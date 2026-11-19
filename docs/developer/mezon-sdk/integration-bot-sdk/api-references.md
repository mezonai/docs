---
sidebar_position: 5
sidebar_label: API reference
description: Classes, methods, events and enums of mezon-sdk 2.8.66.
---

# API reference

This reference covers the public API of **mezon-sdk 2.8.66**, checked against the package's type definitions. Optional parameters end with `?`. Ids are strings.

The package root exports `MezonClient`, `InteractiveBuilder`, `ButtonBuilder`, the enums (`ChannelType`, `ChannelStreamMode`, `TypeMessage`, `Events`, `EButtonMessageStyle`, `EMessageComponentType`, ...) and the interfaces (`ClientConfigDto`, `ChannelMessage`, `ChannelMessageContent`, `ApiMessageMention`, `ApiMessageAttachment`, ...). `TextChannel`, `Message`, `User` and `Clan` are not exported: you get them from the client.

## MezonClient

```ts
new MezonClient(config: ClientConfigDto)
```

`ClientConfigDto` is `{ botId: string; token: string; host?: string; port?: string; useSSL?: boolean; timeout?: number }`. The defaults are in [Core concepts](./core-concepts.md#the-client). The constructor throws `botId is required` or `token is required`.

### Properties

| Property | Type | Meaning |
|---|---|---|
| `clientId` | `string` | The Bot ID. Messages the bot sends have this `sender_id`. |
| `clans` | `CacheManager<string, Clan>` | The clans the bot is in, filled at login. Clan `"0"` holds direct message channels. |
| `channels` | `CacheManager<string, TextChannel>` | Channels; `fetch(id)` loads one from the server. |
| `users` | `CacheManager<string, User>` | Users; `fetch(id)` opens a direct message channel with the user. |

### Methods

| Method | Returns | Purpose |
|---|---|---|
| `login()` | `Promise<string>` | Connects and resolves with the session as JSON. Do not log the result. |
| `isSessionExpired(bufferSec?: number)` | `boolean` | `true` if the session ends within `bufferSec` seconds. |
| `ensureValidSession(bufferSec?: number)` | `Promise<Session>` | Logs in again when the session is about to end. |
| `closeSocket()` | `void` | Disconnects. |
| `createPoll(body: ApiCreatePollRequest)` | `Promise<ApiCreatePollResponse \| undefined>` | Creates a poll: `{ clan_id?, channel_id?, question?, answers?, expire_hours?, type? }`. |
| `getPoll(body: ApiGetPollRequest)` | `Promise<ApiGetPollResponse \| undefined>` | Reads a poll and its results by `poll_id`, or by `message_id` and `channel_id`. |
| `closePoll(body: ApiClosePollRequest)` | `Promise<void \| undefined>` | Closes a poll the bot created. |
| `sendToken(body: APISentTokenRequest)` | `Promise<AddTxResponse>` | Sends Mezon Dong from the bot to `receiver_id`: `{ receiver_id, amount, note?, extra_attribute? }`. Throws `Transaction failed: ...` on failure. |
| `getStreamPlayback(body: { channel_id: string; publish: boolean })` | `Promise<GetStreamPlaybackResponse \| undefined>` | Gets a grant to publish to a stream channel. See [Stream channels](../../mezon-topics/streaming-channel.mdx). |
| `generateMeetToken(body: { channel_id: string; room_name: string; metadata: string })` | `Promise<GenerateMeetTokenResponse \| undefined>` | Gets a meeting token for a channel: `{ token, url }`. |
| `generateCDNSignature(body: { channel_id: string })` | `Promise<GenerateCDNSignatureResponse \| undefined>` | Gets a CDN signature for a channel: `{ signature }`. |
| `addQuickMenuAccess(body: ApiQuickMenuAccessPayload)` | `Promise<any>` | Adds a quick menu entry for the bot: `{ menu_name, action_msg, clan_id?, background?, menu_type? }`. |
| `deleteQuickMenuAccess(botId?: string)` | `Promise<any>` | Removes the bot's quick menu entries. |

`listTransactionDetail` exists but does nothing in 2.8.66.

### Events

Each method takes a listener and returns the client. The event data types come from the package.

| Method | Listener receives |
|---|---|
| `onChannelMessage` | `ChannelMessage`: `id`, `message_id`, `clan_id`, `channel_id`, `sender_id`, `content`, `mentions`, `attachments`, `references`, `topic_id`, `username`, `display_name`, `clan_nick`, ... |
| `onMessageReaction` | The reaction (untyped). |
| `onMessageButtonClicked` | `{ message_id, channel_id, button_id, sender_id, user_id, extra_data }` |
| `onDropdownBoxSelected` | `{ message_id, channel_id, selectbox_id, sender_id, user_id, values }` |
| `onChannelCreated`, `onChannelUpdated`, `onChannelDeleted` | The channel and its clan. |
| `onUserChannelAdded`, `onUserChannelRemoved` | Members added to or removed from a channel. |
| `onAddClanUser` | `{ clan_id, user, invitor }` |
| `onUserClanRemoved` | Members removed from a clan. |
| `onRoleEvent`, `onRoleAssign` | Role changes and role assignments. |
| `onTokenSend` | `{ sender_id?, sender_name?, receiver_id, amount, note?, transaction_id? }` |
| `onGiveCoffee` | A coffee given to a member. |
| `onNotification` | Notifications for the bot. |
| `onClanEventCreated` | A clan event was created. |
| `onStreamingJoinedEvent` | `{ clan_id, clan_name, id, participant, user_id, streaming_channel_id, streaming_channel_label, is_publisher }` |
| `onStreamingLeavedEvent` | `{ id, clan_id, streaming_channel_id, streaming_user_id }` |
| `onVoiceStartedEvent`, `onVoiceEndedEvent`, `onVoiceJoinedEvent`, `onVoiceLeavedEvent` | Voice channel activity. |
| `onQuickMenuEvent` | A member used the bot's quick menu entry (untyped). |
| `onWebrtcSignalingFwd` | WebRTC signaling forwarded to the bot. |

`client.on("ready", () => ...)` fires when the login is complete.

## CacheManager

| Member | Returns | Purpose |
|---|---|---|
| `get(id)` | `V \| undefined` | Reads the cache only. |
| `fetch(id)` | `Promise<V>` | Reads the cache, else loads the item (see each cache). |
| `values()` | `IterableIterator<V>` | All cached items. |
| `size` | `number` | Number of cached items. |
| `first()`, `filter(fn)`, `map(fn)` | | Helpers over the cached items. |

## Clan

Properties: `id`, `name`, `clan_name`, `welcome_channel_id`, `channels` (`CacheManager<string, TextChannel>`), `clientId`.

| Method | Returns | Purpose |
|---|---|---|
| `loadChannels()` | `Promise<void>` | Loads the clan's channels into `clan.channels` (once). |
| `reloadChannels()` | `Promise<void>` | Loads them again. |
| `listChannelVoiceUsers(limit?: number)` | `Promise<ApiVoiceChannelUserList>` | Members in the clan's voice channels. `limit` is 1 to 500 (default 500). |
| `listRoles(limit?: number, state?: number, cursor?: string)` | `Promise<ApiRoleListEventResponse>` | The clan's roles. |
| `updateRole(roleId: string, request: MezonUpdateRoleBody)` | `Promise<boolean>` | Changes a role: title, color, permissions, members (`add_user_ids`, `remove_user_ids`). `max_permission_id` is required. |

## TextChannel

Properties: `id`, `name`, `channel_type`, `is_private`, `category_id`, `category_name`, `parent_id`, `meeting_code`, `clan`, `messages` (`CacheManager<string, Message>`, read from the local message store).

| Method | Returns | Purpose |
|---|---|---|
| `send(content, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?)` | `Promise<Message>` | Sends a message. `content` is a `ChannelMessageContent`. |
| `sendEphemeral(receiver_id: string \| string[], content, reference_message_id?, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?)` | `Promise<ChannelMessageAck>` | Sends a message only the receivers see. |
| `updateEphemeral(receiver_id, content, message_id, topic_id?, reference_message_id?, attachments?, mentions?, mention_everyone?, anonymous_message?)` | `Promise<ChannelMessageAck>` | Changes an ephemeral message. |
| `deleteEphemeral(receiver_id, message_id, topic_id?)` | `Promise<ChannelMessageAck>` | Deletes an ephemeral message. |

## Message

Properties: `id`, `clan_id`, `channel_id`, `sender_id`, `content`, `mentions`, `attachments`, `reactions`, `references`, `topic_id`, `create_time_seconds`, `channel`.

| Method | Returns | Purpose |
|---|---|---|
| `reply(content, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?)` | `Promise<Message>` | Replies with a reference to this message. |
| `update(content, mentions?, attachments?)` | `Promise<Message>` | Replaces the content. |
| `react({ emoji_id, emoji, count, action_delete?, id? })` | `Promise<ApiMessageReaction>` | Adds a reaction, or removes it with `action_delete: true`. |
| `delete()` | `Promise<ChannelMessageAck>` | Deletes the message. |

## User

Properties: `id`, `username`, `display_name`, `clan_nick`, `clan_avatar`, `avartar` (the avatar; the property name is spelled this way), `dmChannelId`.

| Method | Returns | Purpose |
|---|---|---|
| `sendDM(content, code?, attachments?)` | `Promise<Message>` | Sends a direct message to the user. |

## Builders

`ButtonBuilder` and `InteractiveBuilder` build buttons and form cards. See [Interactive messages](../../mezon-topics/interactive-message.mdx).

## Enums

`ChannelType`:

| Name | Value | Channel |
|---|---|---|
| `CHANNEL_TYPE_CHANNEL` | 1 | Text channel |
| `CHANNEL_TYPE_GROUP` | 2 | Group chat |
| `CHANNEL_TYPE_DM` | 3 | Direct message |
| `CHANNEL_TYPE_GMEET_VOICE` | 4 | Old voice channel type, no longer used |
| `CHANNEL_TYPE_FORUM` | 5 | Forum |
| `CHANNEL_TYPE_STREAMING` | 6 | Stream channel |
| `CHANNEL_TYPE_THREAD` | 7 | Thread |
| `CHANNEL_TYPE_APP` | 8 | Channel app |
| `CHANNEL_TYPE_ANNOUNCEMENT` | 9 | Announcement |
| `CHANNEL_TYPE_MEZON_VOICE` | 10 | Voice channel |

`ChannelStreamMode`: `STREAM_MODE_CHANNEL` 2, `STREAM_MODE_GROUP` 3, `STREAM_MODE_DM` 4, `STREAM_MODE_CLAN` 5, `STREAM_MODE_THREAD` 6.

`TypeMessage` (the `code` of a message): `Chat` 0, `ChatUpdate` 1, `ChatRemove` 2, `Typing` 3, `Indicator` 4, `Welcome` 5, `CreateThread` 6, `CreatePin` 7, `MessageBuzz` 8, `Topic` 9, `AuditLog` 10, `SendToken` 11, `Ephemeral` 12, `UpcomingEvent` 13, `UpdateEphemeralMsg` 14, `DeleteEphemeralMsg` 15, `Contact` 16, `Location` 17, `Poll` 18.

## Related

- [Core concepts](./core-concepts.md)
- [Usage and examples](./usage-and-examples.md)
- [What bots are allowed to do](../bot-api-access.md)
