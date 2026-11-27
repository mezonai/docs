---
sidebar_label: Message format & entities
sidebar_position: 4
description: Mezon entity hierarchy, 64-bit Snowflake ID rules, channel types, stream modes, ChannelMessageContent JSON schema, markdown offsets, and rate/size limits.
---

# Message format & entities

Every interaction on Mezon operates on a small set of core entities identified by **64-bit Snowflake IDs** and structured JSON message payloads.

## Entity hierarchy

```text
Clan (clan_id; "0" = virtual DM container)
 ├── Roles (role_id)
 ├── Categories (category_id)
 └── Channels (channel_id, type: ChannelType)
      ├── Threads (parent_id = parent channel_id, type = 7)
      └── Messages (message_id, optional topic_id)
           ├── content (JSON: text, markdown, embeds, components)
           ├── mentions (user_id / role_id + s/e UTF-16 offsets)
           ├── attachments (hosted media URLs & metadata)
           ├── references (replied message snapshot)
           └── reactions (emoji_id, emoji, count)
```

### 64-bit Snowflake IDs

:::danger Always use `string` for IDs in JavaScript/TypeScript
Mezon IDs (`clan_id`, `channel_id`, `message_id`, `user_id`, `role_id`, `botId`) are **64-bit signed integers** (`Int64`, typically 19 decimal digits like `"1840654271217930240"`). JavaScript's `Number` type only represents integers safely up to `Number.MAX_SAFE_INTEGER` (`9007199254740991`, 16 digits). Parsing a Snowflake ID with `Number(...)` or `parseInt(...)` silently corrupts the last 3 digits!

- **JavaScript / TypeScript (`mezon-sdk`)**: Always keep IDs as **`string`** (or `BigInt` for numeric comparison).
- **.NET (`Mezon.Net.Sdk`)**: Native 64-bit **`long`** (`System.Int64`) is exact.
:::

## Channel types & stream modes

Mezon maps every channel's `ChannelType` to a realtime routing `ChannelStreamMode`:

| `ChannelType` | Value | `ChannelStreamMode` | Value | Notes |
| --- | --- | --- | --- | --- |
| `CHANNEL_TYPE_CHANNEL` | `1` | `STREAM_MODE_CHANNEL` | `2` | Standard clan text channel |
| `CHANNEL_TYPE_GROUP` | `2` | `STREAM_MODE_GROUP` | `3` | Group DM (`clan_id = "0"`) |
| `CHANNEL_TYPE_DM` | `3` | `STREAM_MODE_DM` | `4` | 1-on-1 Direct Message (`clan_id = "0"`) |
| `CHANNEL_TYPE_GMEET_VOICE` | `4` | `STREAM_MODE_CHANNEL` | `2` | Legacy Google Meet voice channel |
| `CHANNEL_TYPE_FORUM` | `5` | `STREAM_MODE_CHANNEL` | `2` | Forum channel |
| `CHANNEL_TYPE_STREAMING` | `6` | `STREAM_MODE_CHANNEL` | `2` | Live stream channel (WHIP / LL-HLS) |
| `CHANNEL_TYPE_THREAD` | `7` | `STREAM_MODE_THREAD` | `6` | Sub-thread under `parent_id` |
| `CHANNEL_TYPE_APP` | `8` | `STREAM_MODE_CHANNEL` | `2` | Installed Channel App |
| `CHANNEL_TYPE_ANNOUNCEMENT` | `9` | `STREAM_MODE_CHANNEL` | `2` | Announcement channel |
| `CHANNEL_TYPE_MEZON_VOICE` | `10` | `STREAM_MODE_CHANNEL` | `2` | Mezon SFU voice/video channel (`meeting_code`) |

`STREAM_MODE_CLAN = 5` is used internally for clan-wide presence broadcasts (`joinClanChat`).

## `TypeMessage` codes

Incoming and outgoing messages carry an integer `code` describing the message kind:

| `TypeMessage` | Code | Meaning |
| --- | --- | --- |
| `Chat` | `0` | Standard chat message |
| `ChatUpdate` | `1` | Edited message event |
| `ChatRemove` | `2` | Deleted message event |
| `Typing` | `3` | Typing indicator |
| `Indicator` | `4` | Presence/activity indicator |
| `Welcome` | `5` | Clan welcome message |
| `CreateThread` | `6` | Thread creation system notice |
| `CreatePin` | `7` | Pinned message notice |
| `MessageBuzz` | `8` | Buzz alert message |
| `Topic` | `9` | Topic thread message (`topic_id`) |
| `AuditLog` | `10` | Audit log message |
| `SendToken` | `11` | Mezon Dong transfer receipt |
| `Ephemeral` | `12` | Ephemeral message visible only to `receiver_id` |
| `UpcomingEvent` | `13` | Clan event notification |
| `UpdateEphemeralMsg` | `14` | Update an existing ephemeral message |
| `DeleteEphemeralMsg` | `15` | Delete an existing ephemeral message |
| `Contact` | `16` | Shared contact card |
| `Location` | `17` | Shared location card |
| `Poll` | `18` | Interactive poll message |

## `ChannelMessageContent` JSON schema

Mezon stores message bodies as a JSON object (`ChannelMessageContent` in JS, `MessageContent` / `MessageContentBuilder` in .NET). Instead of parsing raw Markdown strings on every render, Mezon encodes inline spans using **zero-based `[s, e)` character index ranges** into `t`:

```json
{
  "t": "Deploy v2.4 succeeded! View logs in #ops",
  "mk": [
    { "type": "b", "s": 0, "e": 11 },
    { "type": "s", "s": 7, "e": 11 }
  ],
  "hg": [
    { "channelId": "1840654271217930240", "s": 36, "e": 40 }
  ],
  "embed": [],
  "components": []
}
```

### Root content fields

| Key | Type | Description |
| --- | --- | --- |
| `t` | `string` | Plain text body of the message |
| `mk` | `MarkdownOnMessage[]` | Formatted spans (`{ type, s, e }`) using `EMarkdownType` |
| `hg` | `HashtagOnMessage[]` | Clickable channel links (`{ channelId, s, e }`) |
| `ej` | `EmojiOnMessage[]` | Custom clan emojis (`{ emojiid, s, e }`) |
| `lk` | `LinkOnMessage[]` | Clickable HTTP/HTTPS link ranges (`{ s, e }`) |
| `vk` | `LinkVoiceRoomOnMessage[]` | Voice room invite link ranges (`{ s, e }`) |
| `embed` | `IInteractiveMessageProps[]` | Rich cards, fields, inputs, selects, radio buttons, date pickers, animations |
| `components` | `IMessageActionRow[]` | Action rows containing interactive buttons and components |
| `contentThread` | `string` | Optional thread preview text |

### `EMarkdownType` values

| Enum member | Wire `type` | Renders as |
| --- | --- | --- |
| `EMarkdownType.BOLD` | `"b"` | **Bold** |
| `EMarkdownType.SINGLE` | `"s"` | Inline `code` |
| `EMarkdownType.TRIPLE` | `"t"` | Fenced code block |
| `EMarkdownType.PRE` | `"pre"` | Preformatted block |
| `EMarkdownType.CODE` | `"c"` | Code span |
| `EMarkdownType.LINK` | `"lk"` | Hyperlink |
| `EMarkdownType.VOICE_LINK` | `"vk"` | Voice room link |
| `EMarkdownType.LINKYOUTUBE` | `"lk_yt"` | YouTube link embed |

## Mentions, attachments & references

Mentions, attachments, and reply references sit **alongside** `content` (not inside the `content` JSON string):

- **Mentions (`mentions`)**: Array of `{ user_id, username, s, e }` or `{ role_id, rolename, s, e }`, where `s` and `e` point to the `@name` substring inside `content.t`.
- **Attachments (`attachments`)**: Array of `{ url, filename, filetype, size, width, height }`. Because bots cannot call `UploadAttachmentFile`, pass publicly reachable HTTPS URLs.
- **References (`references`)**: Populated automatically by `message.reply()` (JS) and `message.ReplyAsync()` (.NET) with `{ message_ref_id, message_sender_id, message_sender_username, message_sender_avatar, content }`.

## Hard size & throughput limits

| Limit | Value | Where enforced |
| --- | --- | --- |
| **Max serialized `content` JSON length** | **`4,000` characters** (`JSON.stringify(content).length <= 4000`) | Client-side in `mezon-sdk` `SocketManager` (throws before transmit) and server-side |
| **`mezon-sdk` client send throttle** | **`80` messages / second** | `AsyncThrottleQueue` (`MAX_PER_SECSON = 80`) across `send`, `reply`, `update`, `react`, `delete`, `sendDM`, ephemeral |
| **Max realtime `Envelope` frame** | **`1 MiB`** (`1,048,576` bytes) | TLS abridged TCP framing layer |
| **Max reassembled raw API response** | **`16 MiB`** (`16,777,216` bytes) | TLS abridged TCP `0xFF` chunk reassembler |
| **`Mezon.Net.Sdk` ordered dispatch** | **16 lanes × 1,024 queued events/lane** (3s handler timeout) | Configurable via `MezonSocketClientOptions` |

:::tip Handling long output
Because the 4,000-character limit applies to the **entire JSON string** (including `embed`, `components`, `mk`, and key names — not just `content.t`), split large reports across multiple messages or link to an external page/channel app.
:::

## Related

- [Interactive messages](../interactive-features/interactive-messages.mdx) — embeds, buttons, inputs, selects, radio groups, and date pickers.
- [Polls](../interactive-features/polls.mdx) — creating, reading, and closing polls.
- [JavaScript SDK guides & recipes](../bot-sdks/javascript/guides-and-recipes.md) — code examples for formatting, mentions, replies, and ephemeral messages.
- [.NET SDK commands & interactions](../bot-sdks/dotnet/commands-and-interactions.md) — using `MessageContentBuilder`, `MessageEmbedBuilder`, and `ButtonBuilder`.
