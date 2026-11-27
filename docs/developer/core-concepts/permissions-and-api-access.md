---
sidebar_label: Permissions & API access
sidebar_position: 3
description: Reconciled server-side API allowlists for Mezon bot tokens and external Light SDK tokens, including blocked APIs and known handler caveats.
---

# Permissions & API access

Mezon enforces strict **least-privilege API boundaries** for non-human sessions. A bot or external token cannot invoke arbitrary user RPCs even if it has a valid JWT.

## Dual enforcement layers

Every bot API request is checked at two server boundaries:

1. **Socket edge (`mezon-proto-server`)** — `is_bot_allowed_api()` in `src/pipeline_api.c` inspects the `api_index` on every incoming `ApiRequestEvent` from a bot connection (`CONN_F_IS_BOT`). Disallowed calls fail immediately at the socket layer with **`403 Permission denied.`** without touching NATS or PostgreSQL.
2. **Application API (`mezon-api`)** — The authentication interceptor in `server/api.go` checks `isBot` (`appname && shadow`) and `isExternal` (`appname == "external"`). Disallowed calls fail with gRPC `Unauthenticated` (`401`). Individual handlers may additionally enforce role permissions or bot-specific guards (`PermissionDenied`).

Realtime `Envelope` frames (sending chat messages, replies, ephemeral messages, reactions, and joining clan/channel presence) are permitted on bot sockets subject to channel membership and shadow-bot DM rules.

## Bot API allowlist {#bot-api-allowlist}

The table below reconciles `mezon-proto-server/src/pipeline_api.c` and `mezon-api/server/api.go`:

| RPC / API | Bot Socket Status | What it does | `mezon-sdk` (2.8.68) | `Mezon.Net.Sdk` (1.11.0) |
| --- | --- | --- | --- | --- |
| `ListClanDescs` | <BotAccessBadge allowed={true} /> | List clans the bot belongs to | Called inside `login()` | `ListClanDescsAsync` |
| `ListChannelDescs` | <BotAccessBadge allowed={true} /> | List channels in a clan or DM list | `clan.loadChannels()`, `clan.reloadChannels()` | `ListChannelDescsAsync`, `clan.LoadChannelsAsync` |
| `ListChannelDetail` | <BotAccessBadge allowed={true} /> | Fetch metadata for one channel | `client.channels.fetch(id)` | `GetChannelDetailAsync`, `GetChannelAsync` |
| `CreateChannelDesc` | <BotAccessBadge allowed={true} /> | Create a channel or open a DM channel | `client.users.fetch(id)` (DM) | `CreateChannelDescAsync`, `clan.CreateChannelDescAsync` |
| `ListChannelVoiceUsers` | <BotAccessBadge allowed={true} /> | List active members in voice channels | `clan.listChannelVoiceUsers()` | `ListChannelVoiceUsersAsync` |
| `ListRoles` | <BotAccessBadge allowed={true} /> | List roles in a clan | `clan.listRoles()` | `ListRolesAsync`, `clan.ListRolesAsync` |
| `CreateRole` | <BotAccessBadge allowed={true} /> | Create a clan role | Not wrapped directly | `CreateRoleAsync`, `clan.CreateRoleAsync` |
| `UpdateRole` | <BotAccessBadge allowed={true} /> | Update role metadata, members, or permissions | `clan.updateRole()` | `UpdateRoleAsync`, `clan.UpdateRoleAsync` |
| `GetRoleOfUserInTheClan` | <BotAccessBadge allowed={true} /> | Read the caller's roles in a clan | Not wrapped directly | `GetRoleOfUserInTheClanAsync` |
| `ListFriends` | <BotAccessBadge allowed={true} /> | List friend entries | Not wrapped directly | `ListFriendsAsync` |
| `AddFriends` | <BotAccessBadge allowed={true} /> | Add friend relationships | Not wrapped directly | `AddFriendsAsync` |
| `AddQuickMenuAccess` | <BotAccessBadge allowed={true} /> | Register a bot quick menu command | `client.addQuickMenuAccess()` | `AddQuickMenuAccessAsync` |
| `DeleteQuickMenuAccess` | <BotAccessBadge allowed={true} /> | Remove a bot quick menu command | `client.deleteQuickMenuAccess()` | `DeleteQuickMenuAccessAsync` |
| `GenerateMeetToken` | <BotAccessBadge allowed={true} /> | Mint a meeting/voice SFU JWT | `client.generateMeetToken()` | `GenerateMeetTokenAsync` |
| `SendChannelMessage` | <BotAccessBadge allowed={true} /> | Send a channel message via API RPC | Socket realtime `channel.send()` | `SendChannelMessageAsync`, `channel.SendAsync` |
| `UpdateChannelMessage` | <BotAccessBadge allowed={true} /> | Edit an existing message | `message.update()` | `UpdateChannelMessageAsync`, `message.UpdateAsync` |
| `DeleteChannelMessage` | <BotAccessBadge allowed={true} /> | Delete an existing message | `message.delete()` | `DeleteChannelMessageAsync`, `message.DeleteAsync` |
| `CreatePoll` | <BotAccessBadge allowed={true} /> | Create a poll in a channel | `client.createPoll()` | `CreatePollAsync` |
| `ClosePoll` | <BotAccessBadge allowed={true} /> | Close an active poll | `client.closePoll()` | `ClosePollAsync` |
| `GetPoll` | <BotAccessBadge allowed={true} /> | Read poll state and vote counts | `client.getPoll()` | `GetPollAsync` |
| `GenerateCDNSignature` | <BotAccessBadge allowed={true} /> | Generate a signed CDN access token | `client.generateCDNSignature()` | `GenerateCDNSignatureAsync` |
| `GetStreamPlayback` | <BotAccessBadge allowed={true} note="Socket hot path only" /> | Mint a WHIP publish or LL-HLS view grant | `client.getStreamPlayback()` | `GetStreamPlaybackAsync` |

### Three important server realities

:::warning Read these three edge cases carefully
Reconciling `mezon-proto-server` against `mezon-api` reveals three subtle behaviors that differ from naive allowlist assumptions:

1. **`GetStreamPlayback` is socket hot-path only**: `mezon-proto-server` allows and serves `GET_STREAM_PLAYBACK` directly on the socket hot path (`pipeline_api.c`), whereas `mezon-api` does not include it in the HTTP bot allowlist. Always request stream grants over the bot socket via the SDK (`client.getStreamPlayback()` / `client.GetStreamPlaybackAsync()`).
2. **`SendSystemMessage` & `SendEphemeralMessageToBot` are blocked on the bot socket**: Both appear in `mezon-api`'s bot allowlist (`server/api.go`), **but neither is in `mezon-proto-server`'s `is_bot_allowed_api()`**. Calling them over the bot socket returns `403 Permission denied`. To send ephemeral messages from a bot, always use the realtime `EphemeralMessageSend` envelope (`channel.sendEphemeral()` in JS or `channel.SendEphemeralAsync()` / `client.SendEphemeralMessageToBotAsync()` in .NET, which routes through `SendEphemeralMessageRtAsync`).
3. **`UpdateQuickMenuAccess` always rejects bots**: Although `UPDATE_QUICK_MENU_ACCESS` appears in both allowlist tables, the handler in `mezon-api/server/api_quick_menu.go` explicitly checks `if appname && shadow` and returns `PermissionDenied`. Bots can **only** add (`AddQuickMenuAccess`) and delete (`DeleteQuickMenuAccess`) quick menu entries — to edit one, delete and recreate it.
:::

## Blocked APIs (not available to bots)

The following user APIs are intentionally blocked for bot sessions and return **`403 Permission denied`** over the socket:

| Blocked RPC | Status | Impact & Workaround |
| --- | --- | --- |
| `ListClanUsers` | <BotAccessBadge allowed={false} /> | Bots cannot enumerate all clan members. Track active users incrementally from incoming `ChannelMessage` and `AddClanUser` events. |
| `ListChannelMessages` | <BotAccessBadge allowed={false} /> | Bots cannot backfill historical chat logs. Persist arriving messages in your own store (SQLite cache in `mezon-sdk` or L3 `Mezon.Net.Sdk.Caching.Sqlite`). |
| `ListRoleUsers` | <BotAccessBadge allowed={false} /> | Bots cannot fetch members of a role on demand. Track `RoleEvent` / `RoleAssigned` events. |
| `ListQuickMenuAccess` | <BotAccessBadge allowed={false} /> | Bots cannot query existing quick menu registrations. Keep your registered menu IDs in bot state/database. |
| `UploadAttachmentFile` / `MultipartUploadAttachmentFile*` | <BotAccessBadge allowed={false} /> | Bots cannot upload raw binary blobs to Mezon storage. Host media on your own HTTPS storage/CDN and pass the URL inside `attachments`. |

In `Mezon.Net.Sdk` `1.11.0`, every bot-blocked method (`ListClanUsersAsync`, `ListChannelMessagesAsync`, `ListRoleUsersAsync`, `ListQuickMenuAccessAsync`, `UploadAttachmentFileAsync`, `MultipartUploadAttachmentFileStartAsync`, `MultipartUploadAttachmentFileFinishAsync`) is annotated with `[Obsolete]` so the C# compiler flags invalid calls at build time.

## External token allowlist (`mezon-light-sdk`) {#external-token-allowlist-mezon-light-sdk}

Sessions created via `AuthenticateIdToken` receive `vrs["appname"] = "external"` (without `shadow`). `mezon-api` restricts external tokens to **exactly five RPCs**:

| RPC | External Token Status | Purpose |
| --- | --- | --- |
| `ListChannelDescs` | <BotAccessBadge allowed={true} note="External" /> | List accessible channels |
| `CreateChannelDesc` | <BotAccessBadge allowed={true} note="External" /> | Create a channel or DM |
| `UploadAttachmentFile` | <BotAccessBadge allowed={true} note="External" /> | Upload chat attachments |
| `ListChannelMessages` | <BotAccessBadge allowed={true} note="External" /> | Fetch channel message history |
| `GenerateCDNSignature` | <BotAccessBadge allowed={true} note="External" /> | Sign CDN URLs for media access |

All other API calls from an `external` session return `Unauthenticated`.

## Clan & channel runtime permissions

In addition to the server API allowlist, runtime operations obey clan and channel access rules:

- **Clan installation**: Requires the **Manage Clan** permission to install a bot, or **Manage Channels** to install a channel app.
- **Channel visibility**: A bot receives events only for public channels in its installed clans, plus private channels, threads, and DM channels it has explicitly been added to.
- **Role management**: `CreateRole` and `UpdateRole` require the bot account to hold sufficient role-management permission within the target clan.

## Related

- [Authentication & sessions](./authentication-and-sessions.md) — how `vrs` claims determine `isBot`, `shadow`, and `external`.
- [Quick Menu](../interactive-features/quick-menu.mdx) — working with Add/Delete quick menu workflows.
- [Light SDK](../channel-apps-and-widgets/light-sdk.md) — building browser clients on the 5-RPC `external` scope.
