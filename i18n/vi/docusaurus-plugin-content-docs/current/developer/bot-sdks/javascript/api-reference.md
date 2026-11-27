---
sidebar_label: Tham chiếu API
sidebar_position: 5
description: Tham chiếu API đầy đủ cho mezon-sdk 2.8.68 — các phương thức của MezonClient, tất cả 30 hàm lắng nghe sự kiện, Clan, TextChannel, Message, User, CacheManager, InteractiveBuilder và ButtonBuilder.
---

# Tham chiếu API SDK JavaScript & TypeScript

Tài liệu tham chiếu cho **`mezon-sdk` `2.8.68`** (`import { MezonClient, Events, ChannelType, TypeMessage, EMarkdownType, EButtonMessageStyle, InteractiveBuilder, ButtonBuilder } from "mezon-sdk"`).

## `MezonClient`

Kế thừa `MezonClientCore` (lớp kế thừa `EventEmitter` của Node.js).

### Thuộc tính

| Thuộc tính | Kiểu | Mô tả |
| --- | --- | --- |
| `clientId` | `string` | ID Snowflake 64-bit của bot |
| `clans` | `CacheManager<string, Clan>` | Bộ đệm các clan (bao gồm clan ảo `"0"` cho DM) |
| `channels` | `CacheManager<string, TextChannel>` | Bộ đệm toàn bộ kênh thuộc các clan và DM |
| `users` | `CacheManager<string, User>` | Bộ đệm người dùng |
| `mmnClient` | `MmnClient` | Client MMN bên dưới (ném lỗi nếu chưa khởi tạo) |
| `zkClient` | `ZkClient` | Client ZK bên dưới (ném lỗi nếu chưa khởi tạo) |
| `agentManager` | `EventSourceManager` | Trình quản lý SSE cho sự kiện AI Agent |
| `addressMMN` | `string` | Địa chỉ ví MMN suy ra từ ID bot |

### Phương thức vòng đời, phiên & API

| Phương thức | Chữ ký | Ghi chú |
| --- | --- | --- |
| `login()` | `Promise<string>` | Xác thực, khởi tạo MMN/ZK, mở socket TLS TCP, nạp clan & DM, phát `"ready"`, trả về chuỗi JSON phiên |
| `closeSocket()` | `void` | Ngắt kết nối chủ động (tắt tự động kết nối lại) và đặt lại bộ quản lý sự kiện |
| `isSessionExpired(bufferSec?)` | `boolean` | Kiểm tra JWT truy cập có hết hạn trong vòng `bufferSec` giây hay không (mặc định `0`) |
| `ensureValidSession(bufferSec?, force?)` | `Promise<Session>` | Trả về phiên hợp lệ hoặc gộp lời gọi xác thực lại (ngưỡng dự phòng mặc định `30s`) |
| `addQuickMenuAccess(body)` | `Promise<any>` | Đăng ký mục quick menu (`ApiQuickMenuAccessPayload`) |
| `deleteQuickMenuAccess(botId?)` | `Promise<any>` | Xóa các mục quick menu của `botId` (mặc định `this.clientId`) |
| `createPoll(body)` | `Promise<ApiCreatePollResponse \| undefined>` | Tạo cuộc bình chọn (`ApiCreatePollRequest`) |
| `closePoll(body)` | `Promise<void \| undefined>` | Đóng cuộc bình chọn (`ApiClosePollRequest`) |
| `getPoll(body)` | `Promise<ApiGetPollResponse \| undefined>` | Lấy trạng thái và kết quả bình chọn (`ApiGetPollRequest`) |
| `generateMeetToken(body)` | `Promise<GenerateMeetTokenResponse \| undefined>` | Cấp JWT cho phòng họp / thoại SFU |
| `getStreamPlayback(body)` | `Promise<GetStreamPlaybackResponse \| undefined>` | Xin quyền phát WHIP hoặc xem LL-HLS qua nhánh nóng socket |
| `generateCDNSignature(body)` | `Promise<GenerateCDNSignatureResponse \| undefined>` | Tạo chữ ký truy cập CDN |
| `sendToken(tokenEvent)` | `Promise<any>` | Ký và gửi giao dịch Mezon Đồng có chứng minh ZK (`APISentTokenRequest`) |
| `getEphemeralKeyPair()` | `Promise<IEphemeralKeyPair>` | Sinh cặp khóa tạm thời MMN |
| `getAddress(userId)` | `Promise<string>` | Tính địa chỉ MMN cho một `userId` |
| `getZkProofs(data)` | `Promise<IZkProof>` | Yêu cầu chứng minh ZK từ `zkApiUrl` |
| `getCurrentNonce(userId, tag?)` | `Promise<any>` | Đọc nonce MMN `"latest"` hoặc `"pending"` (mặc định) |
| `connectMezonAgentSSE()` | `void` | Mở luồng SSE tới `${agentEventUrl}api/sse/metadata` |

### Phương thức đăng ký sự kiện (`on*`)

`MezonClient` cung cấp **30 phương thức đăng ký sự kiện có kiểu** (đều trả về `this` để nối chuỗi), cộng thêm các sự kiện `EventEmitter` chuẩn như `client.on("ready", ...)` và `client.on(Events.ChannelArchive, ...)`:

| Phương thức | Enum sự kiện (`Events.*`) | Kiểu dữ liệu tải |
| --- | --- | --- |
| `onChannelMessage(fn)` | `Events.ChannelMessage` | `ChannelMessage` |
| `onChannelCreated(fn)` | `Events.ChannelCreated` | `ChannelCreatedEvent` |
| `onChannelUpdated(fn)` | `Events.ChannelUpdated` | `ChannelUpdatedEvent` |
| `onChannelDeleted(fn)` | `Events.ChannelDeleted` | `ChannelDeletedEvent` |
| `onMessageReaction(fn)` | `Events.MessageReaction` | `any` (`MessageReactionEvent`) |
| `onMessageButtonClicked(fn)` | `Events.MessageButtonClicked` | `MessageButtonClicked` |
| `onDropdownBoxSelected(fn)` | `Events.DropdownBoxSelected` | `DropdownBoxSelected` |
| `onQuickMenuEvent(fn)` | `Events.QuickMenu` | `any` (`QuickMenuEvent`) |
| `onUserChannelAdded(fn)` | `Events.UserChannelAdded` | `UserChannelAddedEvent` |
| `onUserChannelRemoved(fn)` | `Events.UserChannelRemoved` | `UserChannelRemoved` |
| `onAddClanUser(fn)` | `Events.AddClanUser` | `AddClanUserEvent` |
| `onUserClanRemoved(fn)` | `Events.UserClanRemoved` | `UserClanRemovedEvent` |
| `onRoleEvent(fn)` | `Events.RoleEvent` | `RoleEvent` |
| `onRoleAssign(fn)` | `Events.RoleAssign` | `RoleAssignedEvent` |
| `onClanEventCreated(fn)` | `Events.ClanEventCreated` | `CreateEventRequest` |
| `onTokenSend(fn)` | `Events.TokenSend` | `TokenSentEvent` |
| `onGiveCoffee(fn)` | `Events.GiveCoffee` | `GiveCoffeeEvent` |
| `onNotification(fn)` | `Events.Notifications` | `Notifications` |
| `onFriendStateUpdated(fn)` | `Events.FriendStateUpdated` | `FriendStateUpdated` |
| `onVoiceStartedEvent(fn)` | `Events.VoiceStartedEvent` | `VoiceStartedEvent` |
| `onVoiceEndedEvent(fn)` | `Events.VoiceEndedEvent` | `VoiceEndedEvent` |
| `onVoiceJoinedEvent(fn)` | `Events.VoiceJoinedEvent` | `VoiceJoinedEvent` |
| `onVoiceLeavedEvent(fn)` | `Events.VoiceLeavedEvent` | `VoiceLeavedEvent` |
| `onStreamingJoinedEvent(fn)` | `Events.StreamingJoinedEvent` | `StreamingJoinedEvent` |
| `onStreamingLeavedEvent(fn)` | `Events.StreamingLeavedEvent` | `StreamingLeavedEvent` |
| `onWebrtcSignalingFwd(fn)` | `Events.WebrtcSignalingFwd` | `WebrtcSignalingFwd` |
| `onAIAgentEnableEvent(fn)` | `Events.AIAgentEnable` | `AIAgentEnabledEvent` |
| `onAIAgentSessionStarted(fn)` | `Events.AIAgentSessionStarted` | `AIAgentSessionStartedEvent` (SSE) |
| `onAIAgentSessionEnded(fn)` | `Events.AIAgentSessionEnded` | `AIAgentSessionEndedEvent` (SSE) |
| `onAIAgentSessionSummaryDone(fn)` | `Events.AIAgentSessionSummaryDone` | `AIAgentSessionSummaryDoneEvent` (SSE) |

## Lớp thực thể

### `Clan`

- **Thuộc tính**: `id`, `name`, `clan_name`, `welcome_channel_id`, `channels` (`CacheManager<string, TextChannel>`), `clientId`.
- **Phương thức**:
  - `loadChannels(): Promise<void>` — nạp kênh một lần (bỏ qua nếu đã nạp).
  - `reloadChannels(): Promise<void>` — gọi lại `listChannelDescs` và hợp nhất vào `clan.channels` cùng `client.channels`.
  - `listChannelVoiceUsers(limit?: number): Promise<ApiVoiceChannelUserList>` — yêu cầu `0 < limit <= 500` (mặc định `500`).
  - `listRoles(limit?, state?, cursor?): Promise<ApiRoleListEventResponse>`
  - `updateRole(roleId: string, request: MezonUpdateRoleBody): Promise<boolean>`
  - `getClient(): MezonClientCore`

### `TextChannel`

- **Thuộc tính**: `id`, `name`, `is_private`, `channel_type`, `category_id`, `category_name`, `parent_id`, `meeting_code`, `clan`, `messages` (`CacheManager<string, Message>`, giới hạn 200 tin trên RAM + dự phòng SQLite).
- **Phương thức**:
  - `send(content, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?): Promise<Message>`
  - `sendEphemeral(receiver_id, content, reference_message_id?, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?): Promise<ChannelMessageAck>`
  - `updateEphemeral(receiver_id, content, message_id, topic_id?, reference_message_id?, attachments?, mentions?, mention_everyone?, anonymous_message?): Promise<ChannelMessageAck>`
  - `deleteEphemeral(receiver_id, message_id, topic_id?): Promise<ChannelMessageAck>`
  - `playMedia(url, participantIdentity, participantName, name): Promise<any>` — yêu cầu kênh thoại có `meeting_code`.

### `Message`

- **Thuộc tính**: `id` (getter phụ `message_id`), `clan_id`, `channel_id`, `sender_id`, `content`, `mentions`, `attachments`, `reactions`, `references`, `topic_id`, `create_time_seconds`, `update_time_seconds`, `code`, `username`, `mode`, `channel`.
- **Phương thức**:
  - `reply(content, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?): Promise<Message>`
  - `update(content, mentions?, attachments?): Promise<Message>`
  - `react(payload: ReactMessagePayload): Promise<any>` — `{ id?, emoji_id, emoji, count, action_delete? }`
  - `delete(): Promise<any>`

### `User`

- **Thuộc tính**: `id`, `username`, `display_name`, `clan_nick`, `clan_avatar`, `avartar` *(đúng chính tả trong mã nguồn SDK)*, `dmChannelId`.
- **Phương thức**:
  - `sendDM(content, code?, attachments?): Promise<Message>` — tự động mở và lưu đệm kênh DM nếu `dmChannelId` đang rỗng.

## Bộ dựng (Builders)

### `InteractiveBuilder`

`new InteractiveBuilder(title?: string)` khởi tạo thẻ với màu ngẫu nhiên, mốc thời gian ISO và chân thẻ mặc định. Các phương thức nối chuỗi:

- `setAuthor(name, icon_url?, url?)`
- `setDescription(description)`
- `setThumbnail(url)`
- `setImage(url, width?, height?)`
- `addField(name, value, inline?)`
- `addInputField(id, name, placeholder?, options?, description?)`
- `addSelectField(id, name, options, valueSelected?, description?)`
- `addRadioField(id, name, options, description?, max_options?)`
- `addDatePickerField(id, name, description?)`
- `addAnimation(id, config, name?, description?)`
- `build(): IInteractiveMessageProps`

### `ButtonBuilder`

- `addButton(id: string, label: string, style: EButtonMessageStyle): this` (`PRIMARY = 1`, `SECONDARY = 2`, `SUCCESS = 3`, `DANGER = 4`, `LINK = 5`)
- `build(): ButtonComponent[]`

## Liên quan

- [Tham chiếu sự kiện](../../reference/events-reference.md) — bảng đối chiếu tải sự kiện giữa các SDK.
- [Phân quyền & truy cập API](../../core-concepts/permissions-and-api-access.md) — danh sách API bot được phép trên máy chủ.
