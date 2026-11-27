---
sidebar_label: Client & caches
sidebar_position: 3
description: Deep dive into mezon-sdk login pipeline, CacheManager caches, local SQLite message database, AsyncThrottleQueue, and automatic failover reconnect.
---

# Client lifecycle & caches

Understanding what `mezon-sdk` does during `login()`, how its in-memory and SQLite caches behave, and how it recovers from disconnects prevents subtle production bugs.

## Login & bootstrap pipeline

When you call `await client.login()`, `MezonClientCore` executes `handleClientLogin()` inside an exponential backoff loop (`MAX_TIME_RETRY = 10`) and deduplicates concurrent calls via `loginInFlight`:

1. **Authenticate against Gateway**: Sends `AuthenticateApp(botId, token)` to `https://gw.mezon.ai:443`.
2. **Initialize managers**: Parses `session.api_url` and `session.tcp_url` (falling back to `ws_url`), then creates `MezonApi`, `SessionManager`, `SocketManager` (TLS TCP), `ChannelManager`, `MmnClient`, `ZkClient`, and `EventSourceManager`.
3. **Initialize MMN / ZK** *(non-shadow bots)*: If `session.id_token` is present, generates an ephemeral key pair, derives the bot's MMN address, and fetches ZK proofs. Failure is logged without blocking bot login.
4. **Open TLS socket & seed clans**:
   - Connects to `tcp_url` with the `0xEF` handshake.
   - Calls `listClanDescs()`, inserts a virtual `"0"` clan entry for DMs, and populates `client.clans`.
   - For each real clan, calls `clan.reloadChannels()` (`listChannelDescs`) and `socket.joinClanChat(clanId)`. Failed clans are retried up to 5 times with increasing API queue delay.
5. **Seed DM channels & emit `"ready"`**: Calls `initAllDmChannels()`, caches DM channels under clan `"0"`, calls `joinClanChat("0", true)`, and emits `"ready"`.

Internal SDK listeners bound during `initManager()` automatically keep caches synchronized on `ChannelMessage`, `ChannelCreated`, `ChannelUpdated` (auto-joining newly active threads where `status === 1`), `ChannelDeleted`, `AddClanUser` (auto-joining when the bot itself is added to a new clan), `UserClanRemoved`, and `UserChannelAdded`.

## Entity caches (`CacheManager<K, V>`)

`CacheManager<K, V>` wraps a `Map`-like `Collection<K, V>` with `.get(id)`, `.set(id, val)`, `.fetch(id)` (cache-first, fallback to fetcher), `.first()`, `.filter()`, `.map()`, `.values()`, `.delete()`, and `.size`:

| Cache | Key | Value | In-memory cap | Fallback on `.fetch(id)` miss |
| --- | --- | --- | --- | --- |
| `client.clans` | `clan_id` (`string`) | `Clan` | Unbounded | **Throws** (`Can not find clan`) — seeded at login & on `AddClanUser` |
| `client.channels` | `channel_id` (`string`) | `TextChannel` | Unbounded | Calls `listChannelDetail` RPC and attaches channel to its `Clan` |
| `clan.channels` | `channel_id` (`string`) | `TextChannel` | Unbounded | Delegates to `client.channels.fetch(id)` |
| `client.users` | `user_id` (`string`) | `User` | Unbounded | Calls `CreateChannelDesc` to open/get a DM channel with that user |
| `channel.messages` | `message_id` (`string`) | `Message` | **200 entries** (FIFO eviction) | Reads from local SQLite `MessageDatabase` (`messages_v2`) |

:::caution `client.users.fetch(userId)` opens a DM channel
Calling `client.users.fetch(userId)` when a user is not already in `client.users` calls `channelManager.createDMchannel(userId)` (`CreateChannelDesc`). If you only want to check cached user metadata without issuing an RPC, use `client.users.get(userId)` first.
:::

## Local SQLite message cache (`MessageDatabase`)

`MezonClientCore` automatically instantiates `MessageDatabase` on startup using `better-sqlite3`:

- **File path**: `./mezon-cache/mezon-messages-cache.db` (relative to `process.cwd()`).
- **Schema**: Table `messages_v2` with primary key `(id, channel_id, clan_id)` and index `idx_messages_v2_channel(channel_id)`. Stores JSON-serialized `content`, `mentions`, `attachments`, `reactions`, `msg_references`, `topic_id`, and `create_time_seconds`.
- **Automatic write**: Every incoming `ChannelMessage` event is persisted to SQLite by `_initChannelMessageCache` so `channel.messages.fetch(messageId)` still works even after the 200-item in-memory cache evicts older messages or after a restart.
- **`.gitignore` side effect**: On construction, `MessageDatabase` checks `.gitignore` in the working directory and appends `/mezon-cache` if absent.

:::tip Container & read-only filesystem deployments
Ensure your bot container's working directory has write access to `./mezon-cache` (or mount a persistent volume there). Because `mezon-sdk` creates the database unconditionally in the constructor, a read-only root filesystem without a writable `./mezon-cache` mount will fail at startup.
:::

## Outbound throttling & automatic join retry

### `AsyncThrottleQueue` (80 messages/second)

All high-level messaging methods (`channel.send`, `channel.sendEphemeral`, `channel.updateEphemeral`, `channel.deleteEphemeral`, `message.reply`, `message.update`, `message.react`, `message.delete`, `user.sendDM`) pass through a shared `AsyncThrottleQueue` with `maxPerSecond = 80`. The queue tracks send timestamps over a rolling 1-second window and paces bursts every 10 ms.

### 4,000-character JSON content guard

Before writing `writeChatMessage`, `writeEphemeralMessage`, or `updateChatMessage`, `SocketManager` checks `JSON.stringify(content).length > 4000` and throws immediately if exceeded.

### Automatic join-before-retry

If sending a message or ephemeral message fails with `"Must join channel before sending messages"` (error code `3`), `SocketManager` automatically calls `socket.joinChat(...)` for that channel and retries the send once.

## Automatic reconnect & shard failover

When an unexpected disconnect or socket error occurs (anything other than `client.closeSocket()`):

1. `SocketManager.retriesConnect()` schedules reconnect attempts with exponential backoff starting at **5 seconds** and capping at **60 seconds**.
2. `handleReconnectSocket()` checks `isSessionExpired(30)` and transparently calls `ensureValidSession(30)` (re-authenticating against `gw.mezon.ai` if the 1-hour JWT is near expiry).
3. If `socket.connect()` fails against the previous `tcp_url`, `_resolveHealthyEndpoint()` queries `GET /v2/healthy/endpoint` on `gw.mezon.ai` (rate-limited to once every **15 seconds**). If the gateway returns a new shard (`tcp_url` / `api_url`), `SocketManager.updateEndpoint()` swaps the socket target and reconnects; if the gateway returns `401`/`403`, the SDK forces full re-authentication.
4. Once reconnected, the SDK re-runs the clan & DM channel initialization pipeline.

## Related

- [Architecture & transport](../../core-concepts/architecture-and-transport.md) — wire-level `0xEF` framing and failover sequence diagram.
- [Guides & recipes](./guides-and-recipes.md) — practical usage of channels, messages, and users.
- [API reference](./api-reference.md) — full method signatures.
