---
sidebar_position: 1
sidebar_label: Events reference
description: Unified catalog mapping Mezon Protobuf realtime Envelope events and SSE events to mezon-sdk and Mezon.Net.Sdk listeners.
---

# Unified events reference

Mezon delivers realtime events over the authenticated bot socket as protobuf `rtapi.Envelope` messages (`mezon-protocol/rtapi/realtime.proto`), plus AI-agent lifecycle callbacks over Server-Sent Events (SSE). This reference maps each wire event to its listeners in **`mezon-sdk` (`2.8.68`)** and **`Mezon.Net.Sdk` (`1.11.0`)**.

## Messaging & notifications

| Protobuf `Envelope` field | Field # | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | Notes |
|---|---|---|---|---|
| `channel_message` | `6` | `onChannelMessage` | `ChannelMessageReceived` | Channel, thread, group, and DM (`clan_id == "0"`) messages |
| `message_reaction_event` | `26` | `onMessageReaction` | `MessageReactionReceived` | Emoji reactions added or removed on messages |
| `notifications` | `13` | `onNotification` | `NotificationsReceived` | Notifications addressed to the bot |

## Interactive components & quick menu

| Protobuf `Envelope` field | Field # | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | Notes |
|---|---|---|---|---|
| `message_button_clicked` | `60` | `onMessageButtonClicked` | `MessageButtonClicked` / `InteractionRouter.OnButton` | **Warning:** `user_id` is client-supplied (untrusted); see [Interactive messages](../interactive-features/interactive-messages.mdx) |
| `dropdown_box_selected` | `64` | `onDropdownBoxSelected` | `DropdownBoxSelected` / `InteractionRouter.OnSelect` | `user_id` is server-authenticated (`InteractionActorTrust.ServerAuthenticated`) |
| `quick_menu_event` | `84` | `onQuickMenuEvent` | `QuickMenuReceivedData` (or `QuickMenuReceived`) | Triggered when a member invokes a bot quick menu entry |

## Channels, clans, roles & membership

| Protobuf `Envelope` field | Field # | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | Notes |
|---|---|---|---|---|
| `channel_created_event` | `31` | `onChannelCreated` | `ChannelCreated` | New channel or thread created in a clan |
| `channel_deleted_event` | `32` | `onChannelDeleted` | `ChannelDeleted` | Channel deleted from a clan |
| `channel_updated_event` | `33` | `onChannelUpdated` | `ChannelUpdated` | Channel metadata or thread status updated |
| `channel_archive_event` | `97` | `on(Events.ChannelArchive, fn)` | *(envelope)* | Channel archived (`active = 0`) or unarchived (`active = 1`) |
| `user_channel_added_event` | `36` | `onUserChannelAdded` | `UserChannelAdded` | Member(s) added to a private channel or thread |
| `user_channel_removed_event` | `37` | `onUserChannelRemoved` | `UserChannelRemoved` | Member(s) removed from a channel |
| `add_clan_user_event` | `43` | `onAddClanUser` | `ClanUserAdded` | Member (or the bot itself) joined a clan |
| `user_clan_removed_event` | `38` | `onUserClanRemoved` | `UserClanRemoved` | Member(s) left or removed from a clan |
| `clan_join` | `3` | *(internal)* | `ClanJoined` | Clan chat stream join confirmation |
| `clan_event_created` | `44` | `onClanEventCreated` | `ClanEventCreated` | Scheduled clan event created |
| `role_event` | `51` | `onRoleEvent` | `RoleChanged` | Role created, updated, or deleted |
| `role_assign_event` | `45` | `onRoleAssign` | `RoleAssigned` | Role assigned or revoked for member(s) |
| `transfer_ownership_event` | `87` | *(envelope)* | `OwnershipTransferred` | Clan ownership transferred |
| `friend_state_updated` | `107` | `onFriendStateUpdated` | *(envelope)* | Friend relationship updated across sessions |

## Voice, WebRTC & stream channels

| Protobuf `Envelope` field | Field # | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | Notes |
|---|---|---|---|---|
| `voice_started_event` | `29` | `onVoiceStartedEvent` | `VoiceStarted` | Voice room session started |
| `voice_ended_event` | `30` | `onVoiceEndedEvent` | `VoiceEnded` | Voice room session ended |
| `voice_joined_event` | `27` | `onVoiceJoinedEvent` | `VoiceJoined` | Member joined a voice channel |
| `voice_leaved_event` | `28` | `onVoiceLeavedEvent` | `VoiceLeaved` | Member left a voice channel |
| `voice_interactive_event` | `100` | *(envelope)* | `VoiceInteractiveReceived` | Interactive action inside a voice room |
| `webrtc_signaling_fwd` | `62` | `onWebrtcSignalingFwd` | `WebrtcSignalingForwarded` | Forwarded 1:1 WebRTC signaling payload |
| `streaming_joined_event` | `53` | `onStreamingJoinedEvent` | `StreamingJoinedData` (or `StreamingJoined`) | Stream went live (`is_publisher: true`) or viewer joined |
| `streaming_leaved_event` | `54` | `onStreamingLeavedEvent` | `StreamingLeavedData` (or `StreamingLeaved`) | Stream ended (publisher leave) or viewer left |
| `streaming_watch` | `104` | *(client → server)* | *(client → server)* | Audience client reports watching/unwatching a stream channel |
| `sfu_breakout_room_event` | `105` | *(envelope)* | *(envelope)* | Voice SFU breakout room state event |
| `streaming_viewer_count_event` | `106` | *(envelope)* | `StreamingViewerCountChanged` | Aggregated viewer count update for a stream channel |

## Payments & social

| Protobuf `Envelope` field | Field # | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | Notes |
|---|---|---|---|---|
| `token_sent_event` | `59` | `onTokenSend` | `TokenSent` | Mezon Dong token transfer notification |
| `give_coffee_event` | `47` | `onGiveCoffee` | `CoffeeGiven` | Member gave coffee to another member |

## AI agent events (socket + SSE)

| Event / Envelope | Transport | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | Notes |
|---|---|---|---|---|
| `aiagent_enabled_event` (`94`) | Realtime socket | `onAIAgentEnableEvent` | `AIAgentEnabled` | AI agent enabled/disabled on a channel |
| `room_started` | Agent SSE (`api/sse/metadata`) | `onAIAgentSessionStarted` | `AgentSessionStarted` | Requires `connectMezonAgentSSE()` / `ConnectAgentSseAsync()` |
| `room_ended` | Agent SSE (`api/sse/metadata`) | `onAIAgentSessionEnded` | `AgentSessionEnded` | Agent voice session ended |
| `room_summary_done` | Agent SSE (`api/sse/metadata`) | `onAIAgentSessionSummaryDone` | `AgentSessionSummaryDone` | Agent session summary finished |

## Client connection lifecycle

| Lifecycle event | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) |
|---|---|---|
| Initial login + socket ready | `client.on("ready", fn)` | `client.Ready` |
| Every socket connect (incl. reconnects) | *(handled internally)* | `client.Connected` |
| Reconnecting attempt | *(handled internally)* | `client.Reconnecting` |
| Disconnected | *(handled internally)* | `client.Disconnected` |

## Related

- [Interactive messages](../interactive-features/interactive-messages.mdx)
- [Stream playback & events](../media-voice-and-streaming/stream-channels/playback-and-events.md)
- [AI agent events](../ai-and-mcp/ai-agent-events.md)
- [Architecture and transport](../core-concepts/architecture-and-transport.md)
