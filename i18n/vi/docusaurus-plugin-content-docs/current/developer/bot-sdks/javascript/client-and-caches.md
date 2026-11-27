---
sidebar_label: Client & bộ đệm
sidebar_position: 3
description: Tìm hiểu sâu về quy trình đăng nhập của mezon-sdk, các bộ đệm CacheManager, cơ sở dữ liệu SQLite cục bộ, AsyncThrottleQueue và cơ chế kết nối lại kèm chuyển dự phòng.
---

# Vòng đời client & bộ đệm

Hiểu rõ những gì `mezon-sdk` làm trong `login()`, cách hoạt động của bộ đệm RAM và SQLite, cùng cơ chế tự phục hồi khi rớt mạng giúp bạn tránh các lỗi khó lường trên môi trường sản xuất.

## Quy trình đăng nhập & khởi tạo

Khi bạn gọi `await client.login()`, `MezonClientCore` chạy `handleClientLogin()` bên trong vòng lặp thử lại theo hàm mũ (`MAX_TIME_RETRY = 10`) và gộp các lời gọi đồng thời qua `loginInFlight`:

1. **Xác thực qua Gateway**: Gửi `AuthenticateApp(botId, token)` tới `https://gw.mezon.ai:443`.
2. **Khởi tạo các trình quản lý**: Phân tích `session.api_url` và `session.tcp_url` (dự phòng sang `ws_url`), sau đó tạo `MezonApi`, `SessionManager`, `SocketManager` (TLS TCP), `ChannelManager`, `MmnClient`, `ZkClient` và `EventSourceManager`.
3. **Khởi tạo MMN / ZK** *(bot tiêu chuẩn)*: Nếu có `session.id_token`, sinh cặp khóa tạm thời, tính địa chỉ MMN của bot và lấy chứng minh ZK. Nếu thất bại, lỗi chỉ được ghi log chứ không chặn quá trình đăng nhập.
4. **Mở socket TLS & nạp danh sách clan**:
   - Kết nối `tcp_url` bằng khung bắt tay `0xEF`.
   - Gọi `listClanDescs()`, chèn mục clan ảo `"0"` cho DM và nạp vào `client.clans`.
   - Với từng clan thật, gọi `clan.reloadChannels()` (`listChannelDescs`) và `socket.joinClanChat(clanId)`. Các clan bị lỗi sẽ được thử lại tối đa 5 lần với độ trễ hàng đợi tăng dần.
5. **Nạp kênh DM & phát sự kiện `"ready"`**: Gọi `initAllDmChannels()`, lưu đệm kênh DM vào clan `"0"`, gọi `joinClanChat("0", true)` và phát sự kiện `"ready"`.

Các trình lắng nghe nội bộ được gắn trong `initManager()` tự động đồng bộ bộ đệm khi xảy ra `ChannelMessage`, `ChannelCreated`, `ChannelUpdated` (tự tham gia luồng mới kích hoạt khi `status === 1`), `ChannelDeleted`, `AddClanUser` (tự tham gia khi chính bot vừa được thêm vào clan mới), `UserClanRemoved` và `UserChannelAdded`.

## Bộ đệm thực thể (`CacheManager<K, V>`)

`CacheManager<K, V>` bọc `Collection<K, V>` (tương tự `Map`) với các hàm `.get(id)`, `.set(id, val)`, `.fetch(id)` (ưu tiên bộ đệm, thiếu mới gọi fetcher), `.first()`, `.filter()`, `.map()`, `.values()`, `.delete()` và `.size`:

| Bộ đệm | Khóa | Giá trị | Giới hạn trên RAM | Hành vi khi `.fetch(id)` không có trong RAM |
| --- | --- | --- | --- | --- |
| `client.clans` | `clan_id` (`string`) | `Clan` | Không giới hạn | **Ném lỗi** (`Can not find clan`) — chỉ nạp lúc đăng nhập & khi `AddClanUser` |
| `client.channels` | `channel_id` (`string`) | `TextChannel` | Không giới hạn | Gọi RPC `listChannelDetail` và gắn kênh vào `Clan` tương ứng |
| `clan.channels` | `channel_id` (`string`) | `TextChannel` | Không giới hạn | Ủy quyền sang `client.channels.fetch(id)` |
| `client.users` | `user_id` (`string`) | `User` | Không giới hạn | Gọi `CreateChannelDesc` để mở/lấy kênh DM với người dùng đó |
| `channel.messages` | `message_id` (`string`) | `Message` | **200 phần tử** (đẩy ra theo FIFO) | Đọc từ cơ sở dữ liệu SQLite cục bộ `MessageDatabase` (`messages_v2`) |

:::caution `client.users.fetch(userId)` sẽ mở kênh DM
Nếu người dùng chưa có trong `client.users`, lời gọi `client.users.fetch(userId)` sẽ kích hoạt `channelManager.createDMchannel(userId)` (`CreateChannelDesc`). Nếu bạn chỉ muốn đọc thông tin người dùng đã đệm mà không gọi RPC, hãy kiểm tra `client.users.get(userId)` trước.
:::

## Bộ đệm tin nhắn SQLite cục bộ (`MessageDatabase`)

`MezonClientCore` tự động khởi tạo `MessageDatabase` lúc tạo đối tượng bằng `better-sqlite3`:

- **Đường dẫn tệp**: `./mezon-cache/mezon-messages-cache.db` (tính theo `process.cwd()`).
- **Lược đồ**: Bảng `messages_v2` với khóa chính `(id, channel_id, clan_id)` và chỉ mục `idx_messages_v2_channel(channel_id)`. Lưu dạng JSON cho `content`, `mentions`, `attachments`, `reactions`, `msg_references`, `topic_id` và `create_time_seconds`.
- **Tự động ghi**: Mọi sự kiện `ChannelMessage` đến đều được `_initChannelMessageCache` lưu xuống SQLite nên `channel.messages.fetch(messageId)` vẫn tìm thấy tin nhắn dù bộ đệm RAM 200 phần tử đã đẩy tin cũ ra hoặc sau khi bot khởi động lại.
- **Tác dụng phụ lên `.gitignore`**: Khi khởi tạo, `MessageDatabase` kiểm tra `.gitignore` tại thư mục chạy và tự nối thêm `/mezon-cache` nếu chưa có.

:::tip Triển khai trong Docker / hệ thống tệp chỉ đọc
Hãy bảo đảm thư mục làm việc của container có quyền ghi vào `./mezon-cache` (hoặc gắn một volume lưu trữ tại đó). Vì `mezon-sdk` luôn mở SQLite ngay trong constructor, hệ thống tệp gốc chỉ đọc mà không có điểm gắn ghi được cho `./mezon-cache` sẽ gây lỗi ngay lúc khởi động.
:::

## Điều tiết gửi đi & tự động tham gia kênh khi thử lại

### `AsyncThrottleQueue` (80 tin nhắn/giây)

Mọi phương thức gửi tin cấp cao (`channel.send`, `channel.sendEphemeral`, `channel.updateEphemeral`, `channel.deleteEphemeral`, `message.reply`, `message.update`, `message.react`, `message.delete`, `user.sendDM`) đều đi qua một `AsyncThrottleQueue` dùng chung với `maxPerSecond = 80`. Hàng đợi theo dõi mốc thời gian trượt 1 giây và điều phối nhịp gửi mỗi 10 ms.

### Kiểm tra giới hạn 4.000 ký tự JSON

Trước khi gửi `writeChatMessage`, `writeEphemeralMessage` hoặc `updateChatMessage`, `SocketManager` kiểm tra `JSON.stringify(content).length > 4000` và ném lỗi ngay nếu vượt quá.

### Tự động tham gia kênh trước khi thử lại

Nếu thao tác gửi tin thường hoặc tin tạm thời thất bại với lỗi `"Must join channel before sending messages"` (mã `3`), `SocketManager` tự gọi `socket.joinChat(...)` cho kênh đó rồi thử gửi lại một lần.

## Tự động kết nối lại & chuyển dự phòng nút máy chủ

Khi xảy ra ngắt kết nối hoặc lỗi socket ngoài ý muốn (không phải do gọi `client.closeSocket()`):

1. `SocketManager.retriesConnect()` lên lịch thử kết nối lại theo hàm mũ từ **5 giây** tăng dần đến tối đa **60 giây**.
2. `handleReconnectSocket()` kiểm tra `isSessionExpired(30)` và tự động gọi `ensureValidSession(30)` (xác thực lại với `gw.mezon.ai` nếu JWT 1 giờ sắp hết hạn).
3. Nếu `socket.connect()` vào `tcp_url` cũ thất bại, `_resolveHealthyEndpoint()` gọi `GET /v2/healthy/endpoint` tới `gw.mezon.ai` (giãn cách tối thiểu **15 giây**). Nếu Gateway trả về nút mới (`tcp_url` / `api_url`), `SocketManager.updateEndpoint()` đổi đích socket và kết nối lại; nếu Gateway trả về `401`/`403`, SDK ép xác thực lại toàn bộ.
4. Sau khi kết nối lại thành công, SDK chạy lại quy trình nạp clan và kênh DM.

## Liên quan

- [Kiến trúc & tầng truyền tải](../../core-concepts/architecture-and-transport.md) — chi tiết khung gói `0xEF` và sơ đồ chuyển dự phòng.
- [Hướng dẫn & mẫu công thức](./guides-and-recipes.md) — ví dụ thực tế với kênh, tin nhắn và người dùng.
- [Tham chiếu API](./api-reference.md) — danh sách đầy đủ chữ ký phương thức.
