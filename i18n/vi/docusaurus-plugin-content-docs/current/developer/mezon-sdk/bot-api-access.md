---
sidebar_position: 4
sidebar_label: Bot được phép làm gì
description: Các API máy chủ mà bot Mezon được gọi, và những việc bot không làm được.
---

# Bot được phép làm gì

Mezon cho bot dùng ít API máy chủ hơn người dùng. Trang này liệt kê các API đó, tính đến tháng 11 năm 2026, cho cả hai SDK.

## Giới hạn hoạt động thế nào

Bot nói chuyện với Mezon qua một kết nối. Trên kết nối đó, bot gửi hai loại yêu cầu:

- **Tin nhắn thời gian thực:** gửi tin nhắn, trả lời, tin nhắn ephemeral và biểu cảm. Bot gửi được các loại này.
- **Lệnh gọi API:** mọi thứ còn lại, ví dụ lấy danh sách kênh hay tạo bình chọn. Bot chỉ được gọi các API trong bảng dưới đây. Mọi lệnh gọi API khác đều nhận lỗi **"Permission denied."** với mã **403**.

## API bot được gọi

| API | Chức năng | `mezon-sdk` (JavaScript) |
|---|---|---|
| ListClanDescs | Liệt kê các clan của bot | Được `login()` dùng |
| ListChannelDescs | Liệt kê các kênh của clan | `clan.loadChannels()`, `clan.reloadChannels()` |
| ListChannelDetail | Đọc một kênh | `client.channels.fetch(id)` |
| CreateChannelDesc | Tạo kênh, kể cả kênh tin nhắn trực tiếp | `client.users.fetch(id)` (mở tin nhắn trực tiếp) |
| ListChannelVoiceUsers | Liệt kê thành viên trong kênh thoại | `clan.listChannelVoiceUsers()` |
| ListRoles | Liệt kê vai trò của clan | `clan.listRoles()` |
| CreateRole | Tạo vai trò | Chưa có phương thức trong 2.8.66 |
| UpdateRole | Sửa vai trò | `clan.updateRole()` |
| GetRoleOfUserInTheClan | Đọc vai trò của một thành viên | Chưa có phương thức trong 2.8.66 |
| ListFriends, AddFriends | Danh sách bạn bè và yêu cầu kết bạn | Chưa có phương thức trong 2.8.66 |
| AddQuickMenuAccess, UpdateQuickMenuAccess, DeleteQuickMenuAccess | Quản lý các mục menu nhanh của bot | `client.addQuickMenuAccess()`, `client.deleteQuickMenuAccess()` |
| GenerateMeetToken | Lấy token cuộc họp | `client.generateMeetToken()` |
| SendChannelMessage, UpdateChannelMessage, DeleteChannelMessage | Gửi, sửa và xóa tin nhắn | `message.update()`, `message.delete()` |
| CreatePoll, ClosePoll, GetPoll | Bình chọn | `client.createPoll()`, `client.closePoll()`, `client.getPoll()` |
| GenerateCDNSignature | Lấy chữ ký CDN cho một kênh | `client.generateCDNSignature()` |
| GetStreamPlayback | Xin quyền phát vào kênh phát trực tiếp | `client.getStreamPlayback()` |

## Những việc bot không làm được

Vì giới hạn này, bot không thể, chẳng hạn:

- liệt kê toàn bộ thành viên của clan (ListClanUsers);
- đọc lịch sử tin nhắn của kênh (ListChannelMessages). Bot chỉ thấy tin nhắn đến trong lúc nó đang chạy;
- liệt kê thành viên của một vai trò (ListRoleUsers);
- liệt kê các mục menu nhanh (ListQuickMenuAccess);
- tải tệp lên. Để hiện ảnh, hãy gửi liên kết tới một tệp đã có trên mạng, dưới dạng URL đính kèm.

Trong [SDK .NET](./dotnet-sdk.md), các phương thức gọi những API này được đánh dấu `[Obsolete]` và báo lỗi `MezonApiException` khi bot gọi.

## Các giới hạn khác

- Bot chỉ hoạt động trong các clan đã thêm nó, và chỉ thấy các kênh nó được truy cập. Kênh riêng tư cần bot là thành viên.
- Thêm bot vào clan cần quyền **Quản lý Clan**.

## Liên quan

- [SDK bot cho JavaScript/TypeScript](./integration-bot-sdk/overview.md)
- [SDK bot cho .NET](./dotnet-sdk.md)
