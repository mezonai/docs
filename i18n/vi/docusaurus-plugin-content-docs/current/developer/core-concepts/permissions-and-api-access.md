---
sidebar_label: Phân quyền & truy cập API
sidebar_position: 3
description: Bảng đối chiếu danh sách API máy chủ cho phép token bot và token external của Light SDK, bao gồm các API bị chặn và các lưu ý thực tế trong handler.
---

# Phân quyền & truy cập API

Mezon áp đặt **ranh giới API theo nguyên tắc đặc quyền tối thiểu** đối với các phiên không phải người dùng. Một token bot hoặc token external không thể gọi tùy ý các RPC của người dùng ngay cả khi JWT còn hợp lệ.

## Hai lớp kiểm soát phía máy chủ

Mọi yêu cầu API từ bot đều đi qua hai chốt chặn:

1. **Tầng biên socket (`mezon-proto-server`)** — Hàm `is_bot_allowed_api()` trong `src/pipeline_api.c` kiểm tra `api_index` trên từng gói `ApiRequestEvent` gửi từ kết nối bot (`CONN_F_IS_BOT`). Các lời gọi không có trong danh sách bị chặn ngay lập tức với **`403 Permission denied.`** trước khi đi vào NATS hay PostgreSQL.
2. **Tầng API ứng dụng (`mezon-api`)** — Bộ chặn xác thực trong `server/api.go` kiểm tra `isBot` (`appname && shadow`) và `isExternal` (`appname == "external"`). Các lời gọi ngoài danh sách bị trả về mã gRPC `Unauthenticated` (`401`). Ngoài ra, từng handler cụ thể có thể kiểm tra thêm quyền vai trò hoặc điều kiện riêng của bot (`PermissionDenied`).

Các khung `Envelope` thời gian thực (gửi tin nhắn chat, trả lời, tin nhắn tạm thời, thả biểu cảm và tham gia hiện diện clan/kênh) được phép trên socket bot miễn tuân thủ quyền thành viên kênh và giới hạn DM của bot ẩn.

## Danh sách API cho phép bot {#bot-api-allowlist}

Bảng dưới đây đối chiếu trực tiếp `mezon-proto-server/src/pipeline_api.c` và `mezon-api/server/api.go`:

| RPC / API | Trạng thái trên Socket Bot | Chức năng | `mezon-sdk` (2.8.68) | `Mezon.Net.Sdk` (1.11.0) |
| --- | --- | --- | --- | --- |
| `ListClanDescs` | <BotAccessBadge allowed={true} /> | Liệt kê các clan mà bot tham gia | Gọi tự động trong `login()` | `ListClanDescsAsync` |
| `ListChannelDescs` | <BotAccessBadge allowed={true} /> | Liệt kê kênh trong clan hoặc danh sách DM | `clan.loadChannels()`, `clan.reloadChannels()` | `ListChannelDescsAsync`, `clan.LoadChannelsAsync` |
| `ListChannelDetail` | <BotAccessBadge allowed={true} /> | Lấy thông tin chi tiết một kênh | `client.channels.fetch(id)` | `GetChannelDetailAsync`, `GetChannelAsync` |
| `CreateChannelDesc` | <BotAccessBadge allowed={true} /> | Tạo kênh mới hoặc mở kênh DM | `client.users.fetch(id)` (DM) | `CreateChannelDescAsync`, `clan.CreateChannelDescAsync` |
| `ListChannelVoiceUsers` | <BotAccessBadge allowed={true} /> | Liệt kê thành viên đang ở kênh thoại | `clan.listChannelVoiceUsers()` | `ListChannelVoiceUsersAsync` |
| `ListRoles` | <BotAccessBadge allowed={true} /> | Liệt kê danh sách vai trò trong clan | `clan.listRoles()` | `ListRolesAsync`, `clan.ListRolesAsync` |
| `CreateRole` | <BotAccessBadge allowed={true} /> | Tạo vai trò mới trong clan | Chưa có hàm bọc trực tiếp | `CreateRoleAsync`, `clan.CreateRoleAsync` |
| `UpdateRole` | <BotAccessBadge allowed={true} /> | Cập nhật thông tin, thành viên hoặc quyền của vai trò | `clan.updateRole()` | `UpdateRoleAsync`, `clan.UpdateRoleAsync` |
| `GetRoleOfUserInTheClan` | <BotAccessBadge allowed={true} /> | Đọc vai trò của người gọi trong clan | Chưa có hàm bọc trực tiếp | `GetRoleOfUserInTheClanAsync` |
| `ListFriends` | <BotAccessBadge allowed={true} /> | Liệt kê danh sách bạn bè | Chưa có hàm bọc trực tiếp | `ListFriendsAsync` |
| `AddFriends` | <BotAccessBadge allowed={true} /> | Gửi/thêm quan hệ bạn bè | Chưa có hàm bọc trực tiếp | `AddFriendsAsync` |
| `AddQuickMenuAccess` | <BotAccessBadge allowed={true} /> | Đăng ký lệnh quick menu của bot | `client.addQuickMenuAccess()` | `AddQuickMenuAccessAsync` |
| `DeleteQuickMenuAccess` | <BotAccessBadge allowed={true} /> | Xóa lệnh quick menu của bot | `client.deleteQuickMenuAccess()` | `DeleteQuickMenuAccessAsync` |
| `GenerateMeetToken` | <BotAccessBadge allowed={true} /> | Cấp JWT vào phòng họp / thoại SFU | `client.generateMeetToken()` | `GenerateMeetTokenAsync` |
| `SendChannelMessage` | <BotAccessBadge allowed={true} /> | Gửi tin nhắn kênh qua API RPC | Dùng realtime `channel.send()` | `SendChannelMessageAsync`, `channel.SendAsync` |
| `UpdateChannelMessage` | <BotAccessBadge allowed={true} /> | Chỉnh sửa tin nhắn đã gửi | `message.update()` | `UpdateChannelMessageAsync`, `message.UpdateAsync` |
| `DeleteChannelMessage` | <BotAccessBadge allowed={true} /> | Xóa tin nhắn | `message.delete()` | `DeleteChannelMessageAsync`, `message.DeleteAsync` |
| `CreatePoll` | <BotAccessBadge allowed={true} /> | Tạo cuộc bình chọn trong kênh | `client.createPoll()` | `CreatePollAsync` |
| `ClosePoll` | <BotAccessBadge allowed={true} /> | Đóng cuộc bình chọn đang mở | `client.closePoll()` | `ClosePollAsync` |
| `GetPoll` | <BotAccessBadge allowed={true} /> | Đọc trạng thái và số phiếu bình chọn | `client.getPoll()` | `GetPollAsync` |
| `GenerateCDNSignature` | <BotAccessBadge allowed={true} /> | Tạo chữ ký truy cập CDN | `client.generateCDNSignature()` | `GenerateCDNSignatureAsync` |
| `GetStreamPlayback` | <BotAccessBadge allowed={true} note="Chỉ nhánh nóng socket" /> | Cấp quyền phát WHIP hoặc xem LL-HLS | `client.getStreamPlayback()` | `GetStreamPlaybackAsync` |

### Ba điểm thực tế quan trọng cần lưu ý

:::warning Đọc kỹ ba ngoại lệ thực tế trên máy chủ
Khi đối chiếu `mezon-proto-server` với `mezon-api`, có ba hành vi tinh tế khác với dự đoán thông thường từ bảng danh sách:

1. **`GetStreamPlayback` chỉ hoạt động trên nhánh nóng socket**: `mezon-proto-server` cho phép và trực tiếp phục vụ `GET_STREAM_PLAYBACK` ngay trên nhánh nóng của socket (`pipeline_api.c`), trong khi `mezon-api` không đưa nó vào danh sách HTTP cho bot. Luôn gọi qua socket của SDK (`client.getStreamPlayback()` / `client.GetStreamPlaybackAsync()`).
2. **`SendSystemMessage` & `SendEphemeralMessageToBot` bị chặn trên socket bot**: Cả hai có mặt trong danh sách bot của `mezon-api` (`server/api.go`), **nhưng không có trong `is_bot_allowed_api()` của `mezon-proto-server`**. Gọi chúng qua socket sẽ nhận `403 Permission denied`. Để gửi tin nhắn tạm thời (ephemeral) từ bot, hãy luôn dùng gói `Envelope` thời gian thực `EphemeralMessageSend` (`channel.sendEphemeral()` ở JS hoặc `channel.SendEphemeralAsync()` / `client.SendEphemeralMessageToBotAsync()` ở .NET — vốn định tuyến sang `SendEphemeralMessageRtAsync`).
3. **`UpdateQuickMenuAccess` luôn từ chối bot**: Dù `UPDATE_QUICK_MENU_ACCESS` có mặt trong cả hai bảng danh sách, handler tại `mezon-api/server/api_quick_menu.go` kiểm tra tường minh `if appname && shadow` và trả về `PermissionDenied`. Bot **chỉ có thể** thêm (`AddQuickMenuAccess`) và xóa (`DeleteQuickMenuAccess`) mục quick menu — muốn sửa, hãy xóa rồi tạo lại.
:::

## Các API bị chặn đối với bot

Những API người dùng sau đây bị chặn có chủ đích đối với phiên bot và trả về **`403 Permission denied`** trên socket:

| RPC bị chặn | Trạng thái | Tác động & Cách xử lý thay thế |
| --- | --- | --- |
| `ListClanUsers` | <BotAccessBadge allowed={false} /> | Bot không thể liệt kê toàn bộ thành viên clan. Hãy ghi nhận người dùng dần từ các sự kiện `ChannelMessage` và `AddClanUser`. |
| `ListChannelMessages` | <BotAccessBadge allowed={false} /> | Bot không thể đọc ngược lịch sử tin nhắn cũ. Hãy lưu tin nhắn đến trong kho riêng (bộ đệm SQLite của `mezon-sdk` hoặc L3 `Mezon.Net.Sdk.Caching.Sqlite`). |
| `ListRoleUsers` | <BotAccessBadge allowed={false} /> | Bot không thể truy vấn danh sách thành viên của một vai trò theo yêu cầu. Hãy theo dõi sự kiện `RoleEvent` / `RoleAssigned`. |
| `ListQuickMenuAccess` | <BotAccessBadge allowed={false} /> | Bot không thể liệt kê các mục quick menu đã đăng ký. Hãy tự lưu danh sách ID đã tạo trong cơ sở dữ liệu của bot. |
| `UploadAttachmentFile` / `MultipartUploadAttachmentFile*` | <BotAccessBadge allowed={false} /> | Bot không thể tải tệp nhị phân trực tiếp lên kho lưu trữ Mezon. Hãy đặt tệp trên máy chủ/CDN HTTPS của bạn và truyền URL trong `attachments`. |

Trong `Mezon.Net.Sdk` `1.11.0`, mọi phương thức bị chặn đối với bot (`ListClanUsersAsync`, `ListChannelMessagesAsync`, `ListRoleUsersAsync`, `ListQuickMenuAccessAsync`, `UploadAttachmentFileAsync`, `MultipartUploadAttachmentFileStartAsync`, `MultipartUploadAttachmentFileFinishAsync`) đều được gắn `[Obsolete]` để trình biên dịch C# cảnh báo ngay lúc build.

## Danh sách API cho token External (`mezon-light-sdk`) {#external-token-allowlist-mezon-light-sdk}

Phiên được cấp từ `AuthenticateIdToken` mang `vrs["appname"] = "external"` (không có khóa `shadow`). `mezon-api` giới hạn token external trong **đúng 5 RPC**:

| RPC | Trạng thái Token External | Mục đích |
| --- | --- | --- |
| `ListChannelDescs` | <BotAccessBadge allowed={true} note="External" /> | Liệt kê kênh có quyền truy cập |
| `CreateChannelDesc` | <BotAccessBadge allowed={true} note="External" /> | Tạo kênh hoặc kênh DM |
| `UploadAttachmentFile` | <BotAccessBadge allowed={true} note="External" /> | Tải tệp đính kèm chat |
| `ListChannelMessages` | <BotAccessBadge allowed={true} note="External" /> | Đọc lịch sử tin nhắn kênh |
| `GenerateCDNSignature` | <BotAccessBadge allowed={true} note="External" /> | Ký URL CDN để truy cập tệp media |

Mọi lời gọi API khác từ phiên `external` đều nhận mã lỗi `Unauthenticated`.

## Phân quyền chạy thực tế trong clan & kênh

Bên cạnh danh sách API máy chủ, các thao tác còn chịu sự kiểm soát của quyền trong clan và kênh:

- **Cài đặt vào clan**: Cần quyền **Quản lý Clan** để thêm bot, hoặc quyền **Quản lý kênh** để cài ứng dụng trong kênh.
- **Phạm vi nhìn thấy kênh**: Bot chỉ nhận sự kiện từ kênh công khai trong các clan đã cài nó, cùng những kênh riêng tư, luồng và kênh DM mà bot được thêm làm thành viên.
- **Quản lý vai trò**: `CreateRole` và `UpdateRole` yêu cầu tài khoản bot nắm đủ quyền quản trị vai trò trong clan đích.

## Liên quan

- [Xác thực & vòng đời phiên](./authentication-and-sessions.md) — cách claim `vrs` quyết định `isBot`, `shadow` và `external`.
- [Quick Menu](../interactive-features/quick-menu.mdx) — làm việc với quy trình Thêm/Xóa quick menu.
- [Light SDK](../channel-apps-and-widgets/light-sdk.md) — xây dựng ứng dụng web trên phạm vi `external` 5 RPC.
