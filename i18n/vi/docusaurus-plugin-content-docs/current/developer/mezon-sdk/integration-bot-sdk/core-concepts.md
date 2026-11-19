---
sidebar_position: 3
sidebar_label: Khái niệm cốt lõi
description: Client, đăng nhập và phiên, kết nối, bộ nhớ đệm, sự kiện, ID và giới hạn trong mezon-sdk.
---

# Khái niệm cốt lõi

Trang này giải thích cách `mezon-sdk` 2.8.66 hoạt động, để bạn tổ chức bot cho phù hợp.

## Client {#the-client}

`MezonClient` là lớp duy nhất bạn tự tạo. Mọi thứ khác (clan, kênh, người dùng, tin nhắn) đến từ bộ nhớ đệm và sự kiện của client.

```ts
import { MezonClient } from "mezon-sdk";

const client = new MezonClient({
  botId: process.env.MEZON_BOT_ID ?? "",
  token: process.env.MEZON_BOT_TOKEN ?? "",
});
```

Đối tượng cấu hình (`ClientConfigDto`) nhận:

| Tùy chọn | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `botId` | `string` | (bắt buộc) | ID Bot lấy từ Developer Portal. |
| `token` | `string` | (bắt buộc) | Token của bot. |
| `host` | `string` | `"gw.mezon.ai"` | Cổng (gateway) Mezon dùng để đăng nhập. |
| `port` | `string` | `"443"` | Cổng mạng của gateway. |
| `useSSL` | `boolean` | `true` | Dùng HTTPS khi đăng nhập. |
| `timeout` | `number` | `7000` | Thời gian chờ mỗi yêu cầu, tính bằng mili giây. |

Hãy giữ giá trị mặc định khi dùng dịch vụ Mezon công khai.

## Đăng nhập và phiên

`await client.login()` thực hiện toàn bộ việc kết nối:

1. Gửi ID Bot và token tới gateway và nhận một phiên.
2. Mở kết nối TLS tới địa chỉ có trong phiên.
3. Tham gia mọi clan mà bot thuộc về và tải các kênh tin nhắn trực tiếp của bot.
4. Phát sự kiện `ready` và trả về phiên dưới dạng chuỗi JSON.

`login()` thử tối đa 10 lần. Trước lần thử thứ hai, nó chờ 10 giây, mỗi lần sau chờ gấp đôi, tối đa 60 giây (tổng cộng khoảng 7 phút), rồi báo lỗi `Error`. Đừng ghi log chuỗi mà nó trả về: chuỗi này chứa token của phiên.

Phiên có hạn dùng. SDK tự đăng nhập lại khi cần một phiên hợp lệ. Bạn cũng có thể tự kiểm tra:

- `client.isSessionExpired(bufferSec?)` trả về `true` nếu phiên hết hạn trong vòng `bufferSec` giây.
- `await client.ensureValidSession(bufferSec?)` đăng nhập lại nếu cần và trả về phiên.

Gọi `client.closeSocket()` để ngắt kết nối.

## Kết nối

Sau khi đăng nhập, mọi lệnh gọi API và mọi sự kiện đều đi qua một kết nối TLS. Lệnh gọi thất bại bị reject với một giá trị thường, không phải `Error`, nên `error.message` là `undefined`; hãy ghi log cả giá trị.

- Lỗi kết nối reject với một chuỗi, ví dụ "Socket connection has not been established yet." khi gọi trước khi `login()` xong.
- Lệnh gọi bị máy chủ từ chối reject với một đối tượng `{ code, error: { code, message } }`. Ví dụ, API mà bot không được dùng reject với `error.code` 403 và `error.message` "Permission denied.": xem [Bot được phép làm gì](../bot-api-access.md).

## Bộ nhớ đệm

Client giữ ba bộ nhớ đệm. Mỗi bộ có `get(id)` (chỉ đọc bộ nhớ đệm), `fetch(id)` (đọc bộ nhớ đệm, nếu không có thì tải), `values()`, `size`, `filter()`, `map()` và `first()`.

| Bộ nhớ đệm | Được nạp | `fetch(id)` làm gì |
|---|---|---|
| `client.clans` | Khi đăng nhập, với mọi clan có bot. Clan `"0"` chứa các kênh tin nhắn trực tiếp của bot. | Trả về clan đã có. Báo lỗi với clan mà bot không tham gia. |
| `client.channels` | Khi bot gặp các kênh. | Tải kênh từ máy chủ. |
| `client.users` | Khi bạn lấy người dùng. | Mở (hoặc tạo) kênh tin nhắn trực tiếp với người đó và trả về một `User` để bạn gọi `sendDM`. |

Mỗi clan có `clan.channels`, được nạp bằng `await clan.loadChannels()`. Mỗi kênh có `channel.messages`. `channel.messages.fetch(id)` đọc kho SQLite cục bộ: nó chỉ tìm thấy những tin nhắn bot nhận được trong lúc đang chạy.

`TextChannel`, `Message`, `User` và `Clan` không được xuất (export) khỏi gói. Hãy để TypeScript tự suy ra kiểu từ các lệnh gọi trả về chúng.

## Sự kiện

Đăng ký hàm xử lý bằng các phương thức `on...`. Mỗi phương thức trả về client, nên bạn có thể gọi nối tiếp. Hãy đăng ký trước khi gọi `login()`.

```ts
client
  .onChannelMessage((message) => console.log(message.content?.t))
  .onMessageButtonClicked((click) => console.log(click.button_id));
```

Danh sách đầy đủ có trong [Tham chiếu API](./api-references.md#events). Các sự kiện hay dùng nhất:

| Sự kiện | Khi nào |
|---|---|
| `onChannelMessage` | Có tin nhắn trong kênh hoặc tin nhắn trực tiếp mà bot nhìn thấy. |
| `onMessageButtonClicked` | Thành viên nhấn nút hoặc chọn một mục trong [tin nhắn tương tác](../../mezon-topics/interactive-message.mdx) của bot. |
| `onMessageReaction` | Ai đó thêm biểu cảm vào tin nhắn. |
| `onAddClanUser`, `onUserClanRemoved` | Thành viên vào hoặc rời clan. |
| `onChannelCreated`, `onChannelUpdated`, `onChannelDeleted` | Kênh thay đổi. |
| `onStreamingJoinedEvent`, `onStreamingLeavedEvent` | Ai đó bắt đầu hoặc dừng phát trong kênh phát trực tiếp. |

`client.on("ready", ...)` chạy khi đăng nhập xong.

## Nội dung tin nhắn

Nội dung tin nhắn là một đối tượng `ChannelMessageContent`. Văn bản nằm trong `t`. Các khóa khác thêm định dạng và thành phần:

| Khóa | Chứa |
|---|---|
| `t` | Văn bản. |
| `mk` | Các đoạn định dạng trong `t`: `{ type, s, e }`, trong đó `type` là ví dụ `"b"` (in đậm) hoặc `"lk"` (liên kết), còn `s` và `e` là vị trí bắt đầu và kết thúc trong `t`. |
| `embed` | Các thẻ tin nhắn tương tác tạo bằng `InteractiveBuilder`. |
| `components` | Các hàng nút bấm và danh sách chọn: `[{ components: [...] }]`. |

Phần nhắc đến và tệp đính kèm là các tham số riêng của `send` và `reply`. Xem [Cách dùng và ví dụ](./usage-and-examples.md).

## ID

ID trong Mezon (người dùng, clan, kênh, tin nhắn) là số 64 bit. SDK nhận và trả chúng dưới dạng chuỗi. Hãy giữ chúng ở dạng chuỗi: số trong JavaScript mất độ chính xác khi lớn hơn 2^53.

## Tốc độ gửi

SDK xếp hàng các tin nhắn gửi đi và gửi tối đa 80 tin mỗi giây từ một client. Trang này không nói về giới hạn phía máy chủ.

## Liên quan

- [Bắt đầu](./getting-started.md)
- [Tham chiếu API](./api-references.md)
- [Bot được phép làm gì](../bot-api-access.md)
