---
sidebar_label: API reference
sidebar_position: 5
description: Complete API reference for Mezon.Net.Sdk 1.11.0 covering MezonClientOptions, MezonClient methods, [Obsolete] bot-blocked methods, events, and entity types.
---

# .NET SDK API reference

Reference for **`Mezon.Net.Sdk` `1.11.0`** (`namespace Mezon.Net.Sdk`).

## Configuration (`MezonClientOptions`)

`MezonClientOptions` inherits from `MezonSocketClientOptions` → `MezonApiClientOptions`:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `BotId` | `long` | `0` *(required)* | Bot's 64-bit Snowflake ID |
| `Token` | `string` | `""` *(required)* | Bot's 16-character token |
| `Host` / `Port` / `UseSSL` | `string` / `string` / `bool` | `gw.mezon.ai` / `443` / `true` | Gateway bootstrap endpoint |
| `CacheCapacity` | `int` | `512` | Max LRU capacity per L1 `EntityCache<T>` (`Clans`, `Channels`, `Roles`, `Users`, `channel.Messages`) |
| `AgentEventUrl` | `string` | `""` *(opt-in)* | Base URL for AI Agent SSE (`ConnectAgentSseAsync` throws if empty) |
| `EventDispatchMode` | `EventDispatchMode` | `Ordered` | Per-channel/clan ordered lanes vs. unordered concurrent dispatch |
| `EventDispatchLaneCount` | `int` | `16` | Number of ordered dispatch lanes |
| `EventDispatchLaneCapacity` | `int` | `1024` | Bounded queue capacity per lane |
| `SocketHandlerTimeoutInMilliseconds` | `int?` | `3000` | Handler slow-warning & ordered-lane advance timeout |
| `ConnectionTimeoutInMilliseconds` | `int` | `30000` | Socket connect timeout |
| `HeartbeatIntervalInMilliseconds` | `int` | `10000` | Ping/pong heartbeat interval |
| `CreateStatusOnConnect` | `bool` | `true` | Include `status=true` presence bootstrap on connect |

## `MezonClient`

Implements `IAsyncDisposable`. Register in DI with `services.AddMezonClient(configure)`.

### Properties

- `Options` (`MezonClientOptions`), `BotId` (`long`), `ConnectionState` (`ConnectionState`), `Latency` (`long`)
- `AuthToken` (`string`), `Username` (`string?`)
- `Clans` (`EntityCache<Clan>`), `Channels` (`EntityCache<Channel>`), `Roles` (`EntityCache<Role>`), `Users` (`EntityCache<User>`)
- On `net6.0+`: `KeyGen` (`KeyPairAccount?`), `AddressMmn` (`string?`), `ZkProofs` (`ZkProofData?`), `Mmn` (`MmnClient?`)

### Supported methods

| Category | Methods |
| --- | --- |
| **Lifecycle & auth** | `LoginAsync(ct?)`, `GetAuthTokenAsync()`, `GetSessionIdAsync()`, `RefreshClanMembershipAsync(ct?)`, `JoinClanAsync(clanId, ct?)`, `ConnectAgentSseAsync(ct?)`, `DisposeAsync()` |
| **L1 cache lookup (single-flight)** | `GetClanAsync(clanId, ct?)`, `GetChannelAsync(channelId, ct?)`, `GetUserAsync(userId, ct?)` |
| **Clans, channels & voice** | `ListClanDescsAsync(body, opts?)`, `ListChannelDescsAsync(req, opts?)`, `GetChannelDetailAsync(channelId, opts?)`, `CreateChannelDescAsync(body, opts?)`, `ListChannelVoiceUsersAsync(clanId, channelId, channelType, opts?)` |
| **Roles & friends** | `ListRolesAsync(req, opts?)`, `CreateRoleAsync(body, opts?)`, `UpdateRoleAsync(body, opts?)`, `GetRoleOfUserInTheClanAsync(clanId, opts?)`, `ListFriendsAsync(state?, limit?, cursor?, opts?)`, `AddFriendsAsync(ids?, usernames?, opts?)` |
| **Messages & polls** | `SendChannelMessageAsync(msg, opts?)`, `SendEphemeralMessageToBotAsync(msg, opts?)` *(routes via realtime `SendEphemeralMessageRtAsync`)*, `UpdateChannelMessageAsync(body, opts?)`, `DeleteChannelMessageAsync(body, opts?)`, `CreatePollAsync(body, opts?)`, `ClosePollAsync(body, opts?)`, `GetPollAsync(body, opts?)` |
| **Quick menu** | `AddQuickMenuAccessAsync(body, opts?)`, `DeleteQuickMenuAccessAsync(body, opts?)`, `UpdateQuickMenuAccessAsync(body, opts?)` *(note: server handler rejects bots with `PermissionDenied` — delete and re-add instead)* |
| **Media & CDN** | `GenerateMeetTokenAsync(body, opts?)`, `GetStreamPlaybackAsync(body, opts?)`, `GenerateCDNSignatureAsync(body, opts?)` |
| **MMN (`net6.0+` only)** | `GetAddress(userId)`, `GetZkProofsAsync(userId, address, pubKey, jwt, ct?)`, `GetCurrentNonceAsync(userId, tag?, ct?)`, `SendTransferAsync(recipient, amount, textData?, extraInfo?, ct?)` *(serialized by internal semaphore)* |
| **Extensions** | `client.UseCommands(CommandService)`, `client.UseInteractions(InteractionRouter)`, `client.UseCollectors(CollectorService)` |

### `[Obsolete]` bot-blocked methods

The following methods on `MezonClient` (and `Clan`) are marked `[Obsolete]` because `mezon-proto-server` rejects them with `403 Permission denied` for bot sessions (throwing `MezonApiException`):

| Obsolete method | Reason |
| --- | --- |
| `UploadAttachmentFileAsync` | Bot file upload blocked; host files over HTTPS and pass URLs in attachments |
| `MultipartUploadAttachmentFileStartAsync` / `FinishAsync` | Bot file upload blocked |
| `ListClanUsersAsync` | Blocked for bots; track users incrementally via events |
| `ListChannelMessagesAsync` | Blocked for bots; use L3 `Mezon.Net.Sdk.Caching.Sqlite` |
| `ListRoleUsersAsync` (on `MezonClient` & `Clan`) | Blocked for bots; track `RoleChanged` / `RoleAssigned` |
| `ListQuickMenuAccessAsync` | Blocked for bots; store created menu IDs in bot state |
| `StreamingServerCallbackAsync` | Legacy placeholder (`api_index 136`) ignored by `mezon-api` |
| `AddMezonBotClient` (DI extension) | Renamed to `AddMezonClient` |

### Events

| Category | Events |
| --- | --- |
| **Lifecycle** | `Ready`, `Connected`, `Disconnected`, `Reconnecting`, `Log` |
| **Channels & messages** | `ChannelMessageReceived`, `ChannelCreated`, `ChannelUpdated`, `ChannelDeleted`, `MessageReactionReceived`, `NotificationsReceived` |
| **Interactions & quick menu** | `MessageButtonClicked`, `DropdownBoxSelected`, `QuickMenuReceived`, `QuickMenuReceivedData` |
| **Clans, users & roles** | `ClanJoined`, `ClanUserAdded`, `UserClanRemoved`, `UserChannelAdded`, `UserChannelRemoved`, `RoleChanged`, `RoleAssigned`, `ClanEventCreated`, `OwnershipTransferred` |
| **Payments & social** | `TokenSent`, `CoffeeGiven` |
| **Voice & streaming** | `VoiceStarted`, `VoiceEnded`, `VoiceJoined`, `VoiceLeaved`, `VoiceInteractiveReceived`, `WebrtcSignalingForwarded`, `StreamingJoined`, `StreamingLeaved`, `StreamingJoinedData`, `StreamingLeavedData`, `StreamingViewerCountChanged` |
| **AI Agent (Socket + SSE)** | `AIAgentEnabled`, `AgentSessionStarted`, `AgentSessionEnded`, `AgentSessionSummaryDone` |

## Entities

- **`Clan`**: `Id`, `Name`, `ClanName`, `CreatorId`, `WelcomeChannelId`, `Channels` (`EntityCacheView<Channel>`), `Roles` (`EntityCacheView<Role>`), `LoadChannelsAsync()`, `ListRolesAsync()`, `CreateRoleAsync()`, `UpdateRoleAsync()`, `GetRoleOfUserInTheClanAsync()`, `ListChannelVoiceUsersAsync()`, `CreateChannelDescAsync()`.
- **`Channel`**: `Id`, `ClanId`, `ParentId`, `CategoryId`, `CategoryName`, `CreatorId`, `AppId`, `Type`, `IsPrivate`, `IsPublic`, `Name`, `MeetingCode`, `Clan`, `Messages` (`EntityCache<Message>`), `JoinAsync()`, `LeaveAsync()`, `SendAsync()`, `SendTextAsync()`, `SendEphemeralAsync()`, `SendEphemeralTextAsync()`, `UpdateEphemeralAsync()`, `UpdateEphemeralTextAsync()`, `DeleteEphemeralAsync()`, `UpdateMessageAsync()`.
- **`Message`**: `Id`, `ClanId`, `ChannelId`, `SenderId`, `Content` (`MessageContent`), `RawContent`, `Code`, `Channel`, `Reactions`, `Mentions`, `Attachments`, `ReplyAsync()`, `ReplyTextAsync()`, `UpdateAsync()`, `UpdateTextAsync()`, `DeleteAsync()`, `AddReactionAsync()`, `RemoveReactionAsync()`.
- **`User`**: `Id`, `Username`, `DisplayName`, `ClanNick`, `DmChannelId`, `SendDMAsync()`, `SendDMTextAsync()`.

## Related

- [Permissions & API access](../../core-concepts/permissions-and-api-access.md) — server-side allowlist details.
- [Events reference](../../reference/events-reference.md) — cross-SDK event payload catalog.
- [Voice SFU SDKs](../../media-voice-and-streaming/voice-sfu/sdks-overview.md) — using `Mezon.Net.Sdk.Sfu`.
