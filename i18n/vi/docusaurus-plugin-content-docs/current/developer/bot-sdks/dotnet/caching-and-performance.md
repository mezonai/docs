---
sidebar_label: Bộ đệm & hiệu năng
sidebar_position: 4
description: Làn phân phối sự kiện có thứ tự giới hạn dung lượng, bộ đệm L1 EntityCache tích hợp, kho bản chụp L2 Redis/Valkey có pub/sub vô hiệu hóa và kho lịch sử tin nhắn L3 SQLite WAL trong Mezon.Net.Sdk 1.11.0.
---

# Bộ đệm & hiệu năng

`Mezon.Net.Sdk` được thiết kế cho các bot có lưu lượng phát tán lớn, dù chạy đơn tiến trình hay trong cụm nhiều pod. SDK tách bạch **tầng phân phối sự kiện thời gian thực có thứ tự** khỏi **ba tầng bộ đệm tường minh (L1, L2, L3)**.

## Làn phân phối có thứ tự giới hạn dung lượng

Theo mặc định (`EventDispatchMode.Ordered` trên `MezonSocketClientOptions`), các sự kiện thời gian thực được băm theo ID kênh (dự phòng theo ID clan) vào các **làn xử lý có thứ tự và giới hạn hàng đợi**:

| Tùy chọn | Mặc định | Hành vi |
| --- | --- | --- |
| `EventDispatchMode` | `EventDispatchMode.Ordered` | Bảo đảm đúng thứ tự sự kiện trong từng kênh/clan. Chỉ chuyển sang chế độ song song không thứ tự nếu toàn bộ handler hoàn toàn độc lập thứ tự. |
| `EventDispatchLaneCount` | `16` | Số làn worker chạy song song |
| `EventDispatchLaneCapacity` | `1024` | Số sự kiện tối đa xếp hàng trên mỗi làn trước khi xả tải |
| `SocketHandlerTimeoutInMilliseconds` | `3000` (3 giây) | Ghi cảnh báo và cho làn đi tiếp nếu một subscriber bị treo quá 3 giây (`null` tắt cảnh báo; làn vẫn tự đi tiếp sau 30 giây) |

Tin nhắn gửi đi được xếp tuần tự theo từng kênh qua `ChannelSendQueue` và kiểm soát toàn cục bằng `MaxTransportRequestsPerSecond`, `MaxTransportRequestsPerMinute` và `MaxConnectRequestsPerSecond`.

:::danger Quy tắc cứng: Không bao giờ gọi API REST/socket trong handler sự kiện thời gian thực
Hãy giữ các hàm lắng nghe sự kiện không bị chặn và không gọi API (`ListClanDescs`, `GetChannelDetail`, `ListRoles`). Khi lưu lượng tin nhắn tăng đột biến, gọi API trong `ChannelMessageReceived` sẽ gây bão yêu cầu và nghẽn làn xử lý. Hãy đẩy tác vụ I/O sang hàng đợi nền, nạp danh mục kênh trong `Ready` hoặc lệnh quản trị, và tận dụng cơ chế gộp yêu cầu đơn luồng (single-flight) `EntityCache.GetOrFetchAsync` khi cần tra cứu theo yêu cầu.
:::

## Kiến trúc bộ đệm 3 tầng

| Tầng | Gói NuGet | Dữ liệu lưu trữ | Vòng đời | Quyền quản lý |
| --- | --- | --- | --- | --- |
| **L1** | `Mezon.Net.Sdk` (`EntityCache<T>`) | Thực thể sống (`Clan`, `Channel`, `Role`, `User`, `Message`) | Bộ nhớ tiến trình (LRU, sức chứa mặc định `512`) | Tự động trong `MezonClient` |
| **L2** | `Mezon.Net.Sdk.Caching.Redis` | **Bản chụp DTO** thuần (JSON) dùng chung giữa các pod | TTL + vô hiệu hóa qua pub/sub | Sidecar do ứng dụng quản lý (DI) |
| **L3** | `Mezon.Net.Sdk.Caching.Sqlite` | **Lịch sử tin nhắn** bền vững (SQLite WAL) | Tệp đĩa cục bộ theo tài khoản/môi trường | Sidecar do ứng dụng tự mở |

L2 và L3 được thiết kế có chủ đích là **sidecar do ứng dụng tự kết nối** — `MezonClient` không bao giờ gọi Redis hay SQLite trên luồng socket. Ứng dụng của bạn đăng ký sự kiện SDK và lưu dữ liệu ở nền:

```text
Realtime Envelope
  → Trình lắng nghe L1 của SDK (cập nhật đồng bộ / tạo stub; 0 lời gọi API)
  → Subscriber của ứng dụng (hàng đợi nền): ghi L3 / đặt hoặc vô hiệu hóa L2
  → Logic nghiệp vụ ứng dụng
```

## Bộ đệm L1 (tích hợp sẵn)

### Vì sao `LoginAsync` chỉ nạp danh sách clan

Trong `LoginAsync()`, `MezonClient` chủ đích chỉ nạp **clans** (`ListClanDescsAsync` + `JoinClanChatRtAsync`) và **ID kênh DM** — **không** tải hàng loạt toàn bộ kênh, vai trò, người dùng hay tin nhắn:

1. **Khởi động `Ready` nhanh**: Bot tham gia nhiều clan với hàng nghìn kênh tránh được lỗi timeout lúc kết nối và vòng lặp kết nối lại.
2. **Chat công khai đã chảy về ngay**: `JoinClanChat` đủ để nhận tin nhắn công khai toàn clan mà không cần gọi join từng kênh.
3. **Tránh ảo giác bộ đệm đầy đủ**: L1 luôn mới nhờ các sự kiện thời gian thực (`ChannelCreated`, `UserChannelAdded`, `RoleChanged`, `RoleAssigned`) kết hợp lời gọi tường minh `clan.LoadChannelsAsync()` / `client.GetChannelAsync()` khi cần.

### Cập nhật L1 tự động theo sự kiện

- `ClanJoined` / `ClanUserAdded` (bot): Tạo stub `Clan` và tham gia chat clan (bất biến lặp).
- `UserChannelAdded` / `UserChannelRemoved`: Cập nhật hoặc gỡ `Channel` và tự tham gia/rời chat kênh nếu liên quan đến bot.
- `ChannelCreated` / `ChannelUpdated` / `ChannelDeleted`: Cập nhật bộ đệm `Channels`; luồng mới kích hoạt (`status == 1`) tự gọi `JoinChannelChat` ở nền.
- `RoleChanged` / `RoleAssigned`: Cập nhật/xóa `Role` (`status == 3` xóa) và cập nhật thành viên.
- `ChannelMessageReceived`: Lưu `Message` **chỉ khi kênh đã có trong bộ đệm**; không tự tạo stub kênh và không gọi API.

## Bộ đệm L2: Bản chụp Redis / Valkey

Cài `Mezon.Net.Sdk.Caching.Redis` khi chạy nhiều phiên bản bot cần chia sẻ siêu dữ liệu thực thể:

```bash
dotnet add package Mezon.Net.Sdk.Caching.Redis --version 1.11.0
```

Đăng ký `IEntitySnapshotStore` và `ICacheInvalidationListener` với `IConnectionMultiplexer` của bạn:

```csharp
services.AddMezonRedisEntitySnapshotStore(multiplexer, o =>
{
    o.KeyPrefix = "mezon:snapshot";
    o.InvalidationChannel = "mezon:snapshot:invalidate";
    o.DefaultAbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
});

services.AddMezonRedisSnapshotInvalidationListener(multiplexer, o =>
{
    o.InvalidationChannel = "mezon:snapshot:invalidate";
});
```

- **Quy ước khóa (`CacheKey`)**: `{env}:{accountId}:{entityType}:{id}` (ví dụ `entityType` là `clan`, `channel`, `user`, `role`).
- **Chỉ lưu DTO**: Không bao giờ tuần tự hóa thực thể sống `Channel`, `Role`, tham chiếu socket hay JWT vào Redis.
- **Vô hiệu hóa giữa các pod**: Lắng nghe `listener.Invalidated` và gỡ khóa cũ khỏi L1 (`client.Channels.Remove(id)`), coi lỗi Redis như cache miss thay vì ném lỗi ngược vào nhánh phân phối sự kiện.

## Bộ đệm L3: Lịch sử tin nhắn SQLite WAL

Cài `Mezon.Net.Sdk.Caching.Sqlite` khi bot cần giữ lịch sử tin nhắn bền vững sau khi khởi động lại (lưu ý `ListChannelMessages` bị chặn đối với bot):

```bash
dotnet add package Mezon.Net.Sdk.Caching.Sqlite --version 1.11.0
```

```csharp
using Mezon.Net.Sdk.Caching.Sqlite;

var dbPath = SqliteMessageStorePaths.ResolveDatabasePath(
    baseDirectory: "./data",
    accountId: botId.ToString(),
    env: "production");

await using var store = await SqliteMessageStore.OpenAsync(dbPath);
```

- Lưu dữ liệu tách khỏi làn sự kiện bằng `UpsertMessageAsync(snapshot, revision)` (dùng `revision` tăng đơn điệu để sự kiện cũ không ghi đè bản mới), `DeleteMessageAsync` và `ApplyReactionAsync`.
- Gọi `store.PruneAsync(retention)` định kỳ theo bộ đếm thời gian để kiểm soát dung lượng đĩa, và `await store.FlushAsync()` trước khi tắt ứng dụng.
- Giữ **một tệp SQLite riêng cho từng tài khoản và môi trường**; không dùng chung một tệp SQLite qua NFS cho nhiều pod.

## Liên quan

- [Tổng quan](./overview.md) — cấu trúc đầy đủ 8 gói NuGet.
- [Tham chiếu API](./api-reference.md) — tùy chọn `MezonSocketClientOptions` và bề mặt `EntityCache`.
