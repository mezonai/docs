---
sidebar_label: API reference
sidebar_position: 5
description: Complete API reference for mezon-sdk 2.8.68 — MezonClient methods, all 30 event listeners, Clan, TextChannel, Message, User, CacheManager, InteractiveBuilder, and ButtonBuilder.
---

# JavaScript & TypeScript SDK API reference

Reference for **`mezon-sdk` `2.8.68`** (`import { MezonClient, Events, ChannelType, TypeMessage, EMarkdownType, EButtonMessageStyle, InteractiveBuilder, ButtonBuilder } from "mezon-sdk"`).

## `MezonClient`

Extends `MezonClientCore` (which extends Node's `EventEmitter`).

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `clientId` | `string` | Bot's 64-bit Snowflake ID |
| `clans` | `CacheManager<string, Clan>` | Cached clans (including virtual `"0"` DM clan) |
| `channels` | `CacheManager<string, TextChannel>` | Cached channels across all clans and DMs |
| `users` | `CacheManager<string, User>` | Cached users |
| `mmnClient` | `MmnClient` | Underlying MMN client (throws if not initialized) |
| `zkClient` | `ZkClient` | Underlying ZK client (throws if not initialized) |
| `agentManager` | `EventSourceManager` | SSE manager for AI Agent events |
| `addressMMN` | `string` | Derived MMN wallet address of the bot |

### Lifecycle, session & API methods

| Method | Signature | Notes |
| --- | --- | --- |
| `login()` | `Promise<string>` | Authenticates, initializes MMN/ZK, opens TLS TCP socket, seeds clans & DMs, emits `"ready"`, returns JSON session string |
| `closeSocket()` | `void` | Hard-disconnects the socket (disables auto-reconnect) and resets internal event manager |
| `isSessionExpired(bufferSec?)` | `boolean` | Checks if the access JWT expires within `bufferSec` (default `0`) |
| `ensureValidSession(bufferSec?, force?)` | `Promise<Session>` | Returns active session or deduplicates re-authentication (default buffer `30s`) |
| `addQuickMenuAccess(body)` | `Promise<any>` | Registers a quick menu item (`ApiQuickMenuAccessPayload`) |
| `deleteQuickMenuAccess(botId?)` | `Promise<any>` | Deletes quick menu entries for `botId` (defaults to `this.clientId`) |
| `createPoll(body)` | `Promise<ApiCreatePollResponse \| undefined>` | Creates a poll (`ApiCreatePollRequest`) |
| `closePoll(body)` | `Promise<void \| undefined>` | Closes an open poll (`ApiClosePollRequest`) |
| `getPoll(body)` | `Promise<ApiGetPollResponse \| undefined>` | Fetches poll state & votes (`ApiGetPollRequest`) |
| `generateMeetToken(body)` | `Promise<GenerateMeetTokenResponse \| undefined>` | Mints a voice/meeting SFU JWT |
| `getStreamPlayback(body)` | `Promise<GetStreamPlaybackResponse \| undefined>` | Requests WHIP publish or LL-HLS view grant via socket hot path |
| `generateCDNSignature(body)` | `Promise<GenerateCDNSignatureResponse \| undefined>` | Generates signed CDN access metadata |
| `sendToken(tokenEvent)` | `Promise<any>` | Signs and submits a ZK-proven Mezon Dong transfer (`APISentTokenRequest`) |
| `getEphemeralKeyPair()` | `Promise<IEphemeralKeyPair>` | Generates an ephemeral MMN keypair |
| `getAddress(userId)` | `Promise<string>` | Derives MMN address for a user ID |
| `getZkProofs(data)` | `Promise<IZkProof>` | Requests ZK proofs from `zkApiUrl` |
| `getCurrentNonce(userId, tag?)` | `Promise<any>` | Fetches `"latest"` or `"pending"` (default) MMN nonce |
| `connectMezonAgentSSE()` | `void` | Opens SSE stream to `${agentEventUrl}api/sse/metadata` |

### Event registration methods (`on*`)

`MezonClient` exposes **30 typed event registration methods** (all return `this` for chaining), plus standard `EventEmitter` events such as `client.on("ready", ...)` and `client.on(Events.ChannelArchive, ...)`:

| Method | Event Enum (`Events.*`) | Payload Type |
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

## Entity structures

### `Clan`

- **Properties**: `id`, `name`, `clan_name`, `welcome_channel_id`, `channels` (`CacheManager<string, TextChannel>`), `clientId`.
- **Methods**:
  - `loadChannels(): Promise<void>` — loads channels once (idempotent if already loaded).
  - `reloadChannels(): Promise<void>` — re-fetches channels via `listChannelDescs` and merges into `clan.channels` and `client.channels`.
  - `listChannelVoiceUsers(limit?: number): Promise<ApiVoiceChannelUserList>` — `0 < limit <= 500` (default `500`).
  - `listRoles(limit?, state?, cursor?): Promise<ApiRoleListEventResponse>`
  - `updateRole(roleId: string, request: MezonUpdateRoleBody): Promise<boolean>`
  - `getClient(): MezonClientCore`

### `TextChannel`

- **Properties**: `id`, `name`, `is_private`, `channel_type`, `category_id`, `category_name`, `parent_id`, `meeting_code`, `clan`, `messages` (`CacheManager<string, Message>`, 200-item memory cap + SQLite fallback).
- **Methods**:
  - `send(content, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?): Promise<Message>`
  - `sendEphemeral(receiver_id, content, reference_message_id?, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?): Promise<ChannelMessageAck>`
  - `updateEphemeral(receiver_id, content, message_id, topic_id?, reference_message_id?, attachments?, mentions?, mention_everyone?, anonymous_message?): Promise<ChannelMessageAck>`
  - `deleteEphemeral(receiver_id, message_id, topic_id?): Promise<ChannelMessageAck>`
  - `playMedia(url, participantIdentity, participantName, name): Promise<any>` — requires voice channel with `meeting_code`.

### `Message`

- **Properties**: `id` (alias getter `message_id`), `clan_id`, `channel_id`, `sender_id`, `content`, `mentions`, `attachments`, `reactions`, `references`, `topic_id`, `create_time_seconds`, `update_time_seconds`, `code`, `username`, `mode`, `channel`.
- **Methods**:
  - `reply(content, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?): Promise<Message>`
  - `update(content, mentions?, attachments?): Promise<Message>`
  - `react(payload: ReactMessagePayload): Promise<any>` — `{ id?, emoji_id, emoji, count, action_delete? }`
  - `delete(): Promise<any>`

### `User`

- **Properties**: `id`, `username`, `display_name`, `clan_nick`, `clan_avatar`, `avartar` *(exact SDK spelling)*, `dmChannelId`.
- **Methods**:
  - `sendDM(content, code?, attachments?): Promise<Message>` — automatically opens and caches a DM channel if `dmChannelId` is empty.

## Builders

### `InteractiveBuilder`

`new InteractiveBuilder(title?: string)` initializes a card with a random color, ISO timestamp, and default footer. Chainable methods:

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

## Related

- [Events reference](../../reference/events-reference.md) — cross-SDK event payload tables.
- [Permissions & API access](../../core-concepts/permissions-and-api-access.md) — server-enforced bot allowlist.
