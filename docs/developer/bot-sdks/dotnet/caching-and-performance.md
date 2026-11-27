---
sidebar_label: Caching & performance
sidebar_position: 4
description: Ordered bounded event dispatch lanes, built-in L1 EntityCache, optional L2 Redis/Valkey snapshot store with pub/sub invalidation, and optional L3 SQLite WAL message history in Mezon.Net.Sdk 1.11.0.
---

# Caching & performance

`Mezon.Net.Sdk` is engineered for high-fanout bots running in single processes or multi-pod clusters. It separates **ordered realtime event dispatch** from **three explicit cache tiers (L1, L2, L3)**.

## Ordered bounded dispatch lanes

By default (`EventDispatchMode.Ordered` on `MezonSocketClientOptions`), realtime events are hashed by channel ID (falling back to clan ID) onto **bounded ordered lanes**:

| Option | Default | Behavior |
| --- | --- | --- |
| `EventDispatchMode` | `EventDispatchMode.Ordered` | Guarantees in-order delivery per channel/clan. Switch to unordered concurrent dispatch only if your handlers are strictly order-independent. |
| `EventDispatchLaneCount` | `16` | Number of parallel ordered worker lanes |
| `EventDispatchLaneCapacity` | `1024` | Max queued events per lane before shedding overflow |
| `SocketHandlerTimeoutInMilliseconds` | `3000` (3 s) | Logs a warning and lets the ordered lane advance if a subscriber stalls past 3 seconds (`null` disables warnings; lanes still advance after 30s) |

Outbound sends are serialized per channel via `ChannelSendQueue` and bounded globally by `MaxTransportRequestsPerSecond`, `MaxTransportRequestsPerMinute`, and `MaxConnectRequestsPerSecond`.

:::danger Hard rule: Never call REST/socket APIs inside realtime event handlers
Keep realtime event subscribers non-blocking and free of API calls (`ListClanDescs`, `GetChannelDetail`, `ListRoles`). Under bursty channel traffic, calling APIs from `ChannelMessageReceived` causes request stampedes and lane starvation. Offload I/O to background queues, hydrate directories in `Ready` or admin commands, and rely on `EntityCache.GetOrFetchAsync` single-flight deduplication when on-demand lookups are required.
:::

## Three-tier cache architecture

| Layer | NuGet Package | Stores | Lifetime | Ownership |
| --- | --- | --- | --- | --- |
| **L1** | `Mezon.Net.Sdk` (`EntityCache<T>`) | Live entities (`Clan`, `Channel`, `Role`, `User`, `Message`) | Process memory (LRU, default capacity `512`) | Automatic in `MezonClient` |
| **L2** | `Mezon.Net.Sdk.Caching.Redis` | Plain **DTO snapshots** (JSON) shared across pods | TTL + pub/sub invalidation | App-owned sidecar (DI) |
| **L3** | `Mezon.Net.Sdk.Caching.Sqlite` | Durable **message history** (SQLite WAL) | Local disk file per account/env | App-owned sidecar (explicit open) |

L2 and L3 are intentionally **app-owned sidecars** — `MezonClient` never calls Redis or SQLite on the socket thread. Your app subscribes to SDK events and persists off the hot path:

```text
Realtime Envelope
  → SDK L1 cache listeners (synchronous mutate / stub; zero API calls)
  → App subscribers (background queue): L3 upsert / L2 Set or Invalidate
  → App business logic
```

## L1 cache (built-in)

### Why `LoginAsync` seeds clans only

During `LoginAsync()`, `MezonClient` intentionally seeds **clans** (`ListClanDescsAsync` + `JoinClanChatRtAsync`) and **DM channel IDs** only — it does **not** bulk-fetch every channel, role, user, or message:

1. **Fast `Ready` startup**: Bots installed in many clans with thousands of channels avoid connect timeouts and reconnect storms.
2. **Public chat already flows**: `JoinClanChat` delivers public clan messages without per-channel joins.
3. **No false-complete snapshot**: L1 stays fresh via realtime events (`ChannelCreated`, `UserChannelAdded`, `RoleChanged`, `RoleAssigned`) plus explicit `clan.LoadChannelsAsync()` / `client.GetChannelAsync()` calls when needed.

### Built-in L1 event mutations

- `ClanJoined` / `ClanUserAdded` (bot): Stubs `Clan` and joins clan chat (idempotent).
- `UserChannelAdded` / `UserChannelRemoved`: Upserts or removes `Channel` and joins/leaves channel chat if the bot is affected.
- `ChannelCreated` / `ChannelUpdated` / `ChannelDeleted`: Mutates `Channels` cache; newly activated threads (`status == 1`) trigger a background `JoinChannelChat`.
- `RoleChanged` / `RoleAssigned`: Upserts/removes `Role` (`status == 3` deletes) and updates membership.
- `ChannelMessageReceived`: Upserts `Message` **only if the channel is already cached**; does not create channel stubs or call APIs.

## L2 cache: Redis / Valkey snapshots

Install `Mezon.Net.Sdk.Caching.Redis` when running multiple bot instances that share entity metadata:

```bash
dotnet add package Mezon.Net.Sdk.Caching.Redis --version 1.11.0
```

Register `IEntitySnapshotStore` and `ICacheInvalidationListener` using your `IConnectionMultiplexer`:

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

- **Key convention (`CacheKey`)**: `{env}:{accountId}:{entityType}:{id}` (for example `entityType` in `clan`, `channel`, `user`, `role`).
- **DTOs only**: Never serialize live `Channel`, `Role`, socket references, or JWTs into Redis.
- **Cross-pod invalidation**: Subscribe to `listener.Invalidated` and evict the stale entry from L1 (`client.Channels.Remove(id)`), treating Redis faults as cache misses rather than throwing into event dispatch.

## L3 cache: SQLite WAL message history

Install `Mezon.Net.Sdk.Caching.Sqlite` when your bot needs durable message history across restarts (remember `ListChannelMessages` is blocked for bots):

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

- Persist off the dispatch lane using `UpsertMessageAsync(snapshot, revision)` (monotonic revision prevents out-of-order overwrites), `DeleteMessageAsync`, and `ApplyReactionAsync`.
- Call `store.PruneAsync(retention)` on a periodic timer to bound disk usage, and `await store.FlushAsync()` before shutdown.
- Keep **one SQLite file per account and environment**; do not share a single SQLite file over NFS across multiple pods.

## Related

- [Overview](./overview.md) — full 8-package layout.
- [API reference](./api-reference.md) — `MezonSocketClientOptions` and `EntityCache` surface.
