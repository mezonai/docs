---
sidebar_label: Tổng quan
sidebar_position: 1
description: Kiến trúc, danh mục 8 gói NuGet, các framework mục tiêu và tính năng nổi bật của Mezon.Net.Sdk 1.11.0 cho bot C# và .NET.
---

# SDK bot .NET (`Mezon.Net.Sdk`)

`Mezon.Net` là SDK .NET đa tầng chính thức để xây dựng bot Mezon, dịch vụ thông lượng cao và client thoại thời gian thực bằng C# và các ngôn ngữ .NET khác.

Tài liệu này mô tả **`Mezon.Net` `v1.11.0`** trên NuGet, hỗ trợ đa mục tiêu **`netstandard2.1`**, **`net6.0`**, **`net8.0`**, **`net9.0`** và **`net10.0`**.

## Danh mục 8 gói NuGet

Đa số lập trình viên bot chỉ cần cài **`Mezon.Net.Sdk`** — gói này tự kéo theo `Mezon.Net.Client`, `Mezon.Net.Transport`, `Mezon.Net.Core` và (từ `net6.0+`) `Mezon.Net.Mmn`. Chỉ cài thêm gói bộ đệm hoặc SFU khi bài toán cần:

| Gói NuGet | Target Frameworks | Vai trò |
| --- | --- | --- |
| `Mezon.Net.Sdk` | `netstandard2.1`, `net6.0`–`net10.0` | **SDK bot chính**: `MezonClient`, thực thể (`Clan`, `Channel`, `Role`, `Message`, `User`), DI `AddMezonClient()`, `CommandService`, `InteractionRouter`, `CollectorService`, builder có kiểu, bộ đệm L1, MMN & Agent SSE |
| `Mezon.Net.Client` | `netstandard2.1`, `net6.0`–`net10.0` | Bộ máy socket tầng thấp (`BaseMezonSocketClient`, mã sinh `Api.g.cs` & `Realtime.g.cs`, `Mezon.Net.Models` `*Params`/`*Response`/`*EventData`, bộ mã `MessageContent`) |
| `Mezon.Net.Transport` | `netstandard2.1`, `net6.0`–`net10.0` | Bộ mã khung TLS TCP rút gọn (`MezonNetworkTcpTransporter`) và WebSocket (`MezonNetworkWebSocketTransporter`) |
| `Mezon.Net.Core` | `netstandard2.1`, `net6.0`–`net10.0` | Hợp đồng protobuf, `MezonApiMap`, `MezonApiException`, `RequestOptions`, giao diện tầng truyền tải |
| `Mezon.Net.Mmn` | `net6.0`–`net10.0` | Client gRPC cho nút Mezon Đồng (MMN) + client HTTP tạo chứng minh ZK *(trên `netstandard2.1` được stub rỗng)* |
| `Mezon.Net.Sdk.Caching.Redis` | `netstandard2.1`, `net6.0`–`net10.0` | Bộ đệm **L2** tùy chọn lưu bản chụp DTO dùng chung + vô hiệu hóa pub/sub trên Redis/Valkey giữa nhiều pod |
| `Mezon.Net.Sdk.Caching.Sqlite` | `netstandard2.1`, `net6.0`–`net10.0` | Kho lịch sử tin nhắn **L3** bền vững tùy chọn bằng SQLite WAL (`SqliteMessageStore`) |
| `Mezon.Net.Sdk.Sfu` | `netstandard2.1`, `net6.0`–`net10.0` | Client WebRTC SFU tùy chọn cho phòng thoại/họp (Opus/VP8 RTP qua `SIPSorcery`, kiểm duyệt, tự kết nối lại) |

## Kiến trúc phân tầng & ranh giới protobuf

```text
Mezon.Net.Sdk          → Lớp mặt tiền cho bot (MezonClient, thực thể, DI, lệnh, tương tác, builder, L1)
Mezon.Net.Mmn          → Client gRPC nút MMN + client HTTP chứng minh ZK
Mezon.Net.Client       → Bộ máy socket (bản đồ CID, Envelope, API-qua-socket, làn phân phối có thứ tự)
Mezon.Net.Transport    → TLS TCP rút gọn (chính) + WebSocket
Mezon.Net.Core         → Protobuf, MezonApiMap, ngoại lệ, tùy chọn
```

- **Kiểu phản hồi không cấp phát thừa (`Mezon.Net.Models`)**: Tham số yêu cầu là readonly struct `*Params` (`SendChannelMessageParams`), phản hồi là view struct `*Response` bọc trực tiếp protobuf mà không cấp phát thêm heap, và tham số sự kiện là `*EventData` có thể chuyển đổi ngầm định sang `*Response`.
- **Hai nhóm đối tượng sử dụng**: Lập trình viên bot cài `Mezon.Net.Sdk` và dùng `Mezon.Net.Sdk.MezonClient` (sự kiện ở thì quá khứ không có hậu tố `Event` như `ChannelMessageReceived`). Lập trình viên client giao diện có thể dùng trực tiếp `Mezon.Net.Client` (`Mezon.Net.Client.MezonClient`, sự kiện có hậu tố `Event` như `ChannelMessageReceivedEvent`).
- **ID 64-bit nguyên bản**: Mọi ID Snowflake của Mezon (`BotId`, `ClanId`, `ChannelId`, `MessageId`, `UserId`, `RoleId`) đều là kiểu `long` 64-bit chính xác — không cần giữ dạng chuỗi.
- **Cảnh báo API bot bị chặn lúc biên dịch**: Các phương thức ứng với RPC bị chặn trên socket bot (`ListClanUsersAsync`, `ListChannelMessagesAsync`, `ListRoleUsersAsync`, `ListQuickMenuAccessAsync`, các hàm tải tệp) được đánh dấu `[Obsolete]` để trình biên dịch cảnh báo trước khi bot gặp `MezonApiException` mã `403`.

## Trong mục này

- [Bắt đầu nhanh](./quickstart.md) — bot console và cấu hình DI `AddMezonClient()` cho ASP.NET Core / Generic Host.
- [Lệnh, tương tác & builder](./commands-and-interactions.md) — `CommandService`, `InteractionRouter` (kèm `InteractionActorTrust`), `CollectorService` và các builder tin nhắn có kiểu.
- [Bộ đệm & hiệu năng](./caching-and-performance.md) — làn phân phối có thứ tự, `EntityCache` L1, bản chụp Redis/Valkey L2 và lưu trữ tin nhắn SQLite WAL L3.
- [Tham chiếu API](./api-reference.md) — bảng đầy đủ `MezonClient`, tùy chọn, sự kiện, thực thể và các API `[Obsolete]`.
