---
sidebar_label: Tham chiếu API
sidebar_position: 5
description: Tham chiếu API đầy đủ cho Mezon.Net.Sdk 1.11.0 gồm MezonClientOptions, các phương thức MezonClient, các phương thức [Obsolete] bị chặn với bot, sự kiện và các lớp thực thể.
---

# Tham chiếu API SDK .NET

Tài liệu tham chiếu cho **`Mezon.Net.Sdk` `1.11.0`** (`namespace Mezon.Net.Sdk`).

## Cấu hình (`MezonClientOptions`)

`MezonClientOptions` kế thừa từ `MezonSocketClientOptions` → `MezonApiClientOptions`:

| Thuộc tính | Kiểu | Mặc định | Mô tả |
| --- | --- | --- | --- |
| `BotId` | `long` | `0` *(bắt buộc)* | ID Snowflake 64-bit của bot |
| `Token` | `string` | `""` *(bắt buộc)* | Token 16 ký tự của bot |
| `Host` / `Port` / `UseSSL` | `string` / `string` / `bool` | `gw.mezon.ai` / `443` / `true` | Điểm cuối Gateway khởi tạo phiên |
| `CacheCapacity` | `int` | `512` | Sức chứa LRU tối đa cho mỗi `EntityCache<T>` L1 (`Clans`, `Channels`, `Roles`, `Users`, `channel.Messages`) |
| `AgentEventUrl` | `string` | `""` *(tùy chọn)* | URL gốc AI Agent SSE (`ConnectAgentSseAsync` ném lỗi nếu để trống) |
| `EventDispatchMode` | `EventDispatchMode` | `Ordered` | Làn có thứ tự theo kênh/clan so với phân phối song song không thứ tự |
| `EventDispatchLaneCount` | `int` | `16` | Số làn phân phối có thứ tự |
| `EventDispatchLaneCapacity` | `int` | `1024` | Giới hạn hàng đợi trên mỗi làn |
| `SocketHandlerTimeoutInMilliseconds` | `int?` | `3000` | Ngưỡng cảnh báo handler chậm & cho phép làn đi tiếp |
| `ConnectionTimeoutInMilliseconds` | `int` | `30000` | Thời gian chờ kết nối socket |
| `HeartbeatIntervalInMilliseconds` | `int` | `10000` | Chu kỳ gửi ping/pong giữ kết nối |
| `CreateStatusOnConnect` | `bool` | `true` | Gửi kèm `status=true` khi kết nối để khởi tạo trạng thái hiện diện |

## `MezonClient`

Triển khai `IAsyncDisposable`. Đăng ký DI qua `services.AddMezonClient(configure)`.

### Thuộc tính

- `Options` (`MezonClientOptions`), `BotId` (`long`), `ConnectionState` (`ConnectionState`), `Latency` (`long`)
- `AuthToken` (`string`), `Username` (`string?`)
- `Clans` (`EntityCache<Clan>`), `Channels` (`EntityCache<Channel>`), `Roles` (`EntityCache<Role>`), `Users` (`EntityCache<User>`)
- Trên `net6.0+`: `KeyGen` (`KeyPairAccount?`), `AddressMmn` (`string?`), `ZkProofs` (`ZkProofData?`), `Mmn` (`MmnClient?`)

### Các phương thức được hỗ trợ

| Nhóm | Phương thức |
| --- | --- |
| **Vòng đời & xác thực** | `LoginAsync(ct?)`, `GetAuthTokenAsync()`, `GetSessionIdAsync()`, `RefreshClanMembershipAsync(ct?)`, `JoinClanAsync(clanId, ct?)`, `ConnectAgentSseAsync(ct?)`, `DisposeAsync()` |
| **Tra cứu L1 (gộp yêu cầu)** | `GetClanAsync(clanId, ct?)`, `GetChannelAsync(channelId, ct?)`, `GetUserAsync(userId, ct?)` |
| **Clan, kênh & thoại** | `ListClanDescsAsync(body, opts?)`, `ListChannelDescsAsync(req, opts?)`, `GetChannelDetailAsync(channelId, opts?)`, `CreateChannelDescAsync(body, opts?)`, `ListChannelVoiceUsersAsync(clanId, channelId, channelType, opts?)` |
| **Vai trò & bạn bè** | `ListRolesAsync(req, opts?)`, `CreateRoleAsync(body, opts?)`, `UpdateRoleAsync(body, opts?)`, `GetRoleOfUserInTheClanAsync(clanId, opts?)`, `ListFriendsAsync(state?, limit?, cursor?, opts?)`, `AddFriendsAsync(ids?, usernames?, opts?)` |
| **Tin nhắn & bình chọn** | `SendChannelMessageAsync(msg, opts?)`, `SendEphemeralMessageToBotAsync(msg, opts?)` *(định tuyến qua realtime `SendEphemeralMessageRtAsync`)*, `UpdateChannelMessageAsync(body, opts?)`, `DeleteChannelMessageAsync(body, opts?)`, `CreatePollAsync(body, opts?)`, `ClosePollAsync(body, opts?)`, `GetPollAsync(body, opts?)` |
| **Quick Menu** | `AddQuickMenuAccessAsync(body, opts?)`, `DeleteQuickMenuAccessAsync(body, opts?)`, `UpdateQuickMenuAccessAsync(body, opts?)` *(lưu ý: handler máy chủ trả về `PermissionDenied` cho bot — hãy xóa rồi thêm mới)* |
| **Media & CDN** | `GenerateMeetTokenAsync(body, opts?)`, `GetStreamPlaybackAsync(body, opts?)`, `GenerateCDNSignatureAsync(body, opts?)` |
| **MMN (chỉ `net6.0+`)** | `GetAddress(userId)`, `GetZkProofsAsync(userId, address, pubKey, jwt, ct?)`, `GetCurrentNonceAsync(userId, tag?, ct?)`, `SendTransferAsync(recipient, amount, textData?, extraInfo?, ct?)` *(tuần tự hóa qua semaphore nội bộ)* |
| **Mở rộng** | `client.UseCommands(CommandService)`, `client.UseInteractions(InteractionRouter)`, `client.UseCollectors(CollectorService)` |

### Các phương thức `[Obsolete]` bị chặn đối với bot

Các phương thức sau trên `MezonClient` (và `Clan`) được gắn `[Obsolete]` vì `mezon-proto-server` trả về `403 Permission denied` cho phiên bot (ném `MezonApiException`):

| Phương thức `[Obsolete]` | Lý do |
| --- | --- |
| `UploadAttachmentFileAsync` | Bot không được tải tệp; hãy lưu tệp trên HTTPS và truyền URL trong tệp đính kèm |
| `MultipartUploadAttachmentFileStartAsync` / `FinishAsync` | Bot không được tải tệp |
| `ListClanUsersAsync` | Bị chặn với bot; ghi nhận người dùng dần qua sự kiện |
| `ListChannelMessagesAsync` | Bị chặn với bot; sử dụng bộ đệm L3 `Mezon.Net.Sdk.Caching.Sqlite` |
| `ListRoleUsersAsync` (trên `MezonClient` & `Clan`) | Bị chặn với bot; theo dõi `RoleChanged` / `RoleAssigned` |
| `ListQuickMenuAccessAsync` | Bị chặn với bot; lưu ID quick menu đã tạo trong trạng thái bot |
| `StreamingServerCallbackAsync` | Chỗ giữ cũ (`api_index 136`) đã bị `mezon-api` bỏ qua |
| `AddMezonBotClient` (hàm mở rộng DI) | Đổi tên thành `AddMezonClient` |

### Sự kiện

| Nhóm | Sự kiện |
| --- | --- |
| **Vòng đời** | `Ready`, `Connected`, `Disconnected`, `Reconnecting`, `Log` |
| **Kênh & tin nhắn** | `ChannelMessageReceived`, `ChannelCreated`, `ChannelUpdated`, `ChannelDeleted`, `MessageReactionReceived`, `NotificationsReceived` |
| **Tương tác & quick menu** | `MessageButtonClicked`, `DropdownBoxSelected`, `QuickMenuReceived`, `QuickMenuReceivedData` |
| **Clan, người dùng & vai trò** | `ClanJoined`, `ClanUserAdded`, `UserClanRemoved`, `UserChannelAdded`, `UserChannelRemoved`, `RoleChanged`, `RoleAssigned`, `ClanEventCreated`, `OwnershipTransferred` |
| **Thanh toán & xã hội** | `TokenSent`, `CoffeeGiven` |
| **Thoại & phát trực tiếp** | `VoiceStarted`, `VoiceEnded`, `VoiceJoined`, `VoiceLeaved`, `VoiceInteractiveReceived`, `WebrtcSignalingForwarded`, `StreamingJoined`, `StreamingLeaved`, `StreamingJoinedData`, `StreamingLeavedData`, `StreamingViewerCountChanged` |
| **AI Agent (Socket + SSE)** | `AIAgentEnabled`, `AgentSessionStarted`, `AgentSessionEnded`, `AgentSessionSummaryDone` |

## Thực thể

- **`Clan`**: `Id`, `Name`, `ClanName`, `CreatorId`, `WelcomeChannelId`, `Channels` (`EntityCacheView<Channel>`), `Roles` (`EntityCacheView<Role>`), `LoadChannelsAsync()`, `ListRolesAsync()`, `CreateRoleAsync()`, `UpdateRoleAsync()`, `GetRoleOfUserInTheClanAsync()`, `ListChannelVoiceUsersAsync()`, `CreateChannelDescAsync()`.
- **`Channel`**: `Id`, `ClanId`, `ParentId`, `CategoryId`, `CategoryName`, `CreatorId`, `AppId`, `Type`, `IsPrivate`, `IsPublic`, `Name`, `MeetingCode`, `Clan`, `Messages` (`EntityCache<Message>`), `JoinAsync()`, `LeaveAsync()`, `SendAsync()`, `SendTextAsync()`, `SendEphemeralAsync()`, `SendEphemeralTextAsync()`, `UpdateEphemeralAsync()`, `UpdateEphemeralTextAsync()`, `DeleteEphemeralAsync()`, `UpdateMessageAsync()`.
- **`Message`**: `Id`, `ClanId`, `ChannelId`, `SenderId`, `Content` (`MessageContent`), `RawContent`, `Code`, `Channel`, `Reactions`, `Mentions`, `Attachments`, `ReplyAsync()`, `ReplyTextAsync()`, `UpdateAsync()`, `UpdateTextAsync()`, `DeleteAsync()`, `AddReactionAsync()`, `RemoveReactionAsync()`.
- **`User`**: `Id`, `Username`, `DisplayName`, `ClanNick`, `DmChannelId`, `SendDMAsync()`, `SendDMTextAsync()`.

## Liên quan

- [Phân quyền & truy cập API](../../core-concepts/permissions-and-api-access.md) — chi tiết danh sách API cho phép trên máy chủ.
- [Tham chiếu sự kiện](../../reference/events-reference.md) — danh mục dữ liệu sự kiện dùng chung giữa các SDK.
- [SDK Thoại SFU](../../media-voice-and-streaming/voice-sfu/sdks-overview.md) — sử dụng `Mezon.Net.Sdk.Sfu`.
