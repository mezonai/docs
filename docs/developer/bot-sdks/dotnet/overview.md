---
sidebar_label: Overview
sidebar_position: 1
description: Architecture, NuGet package map, target frameworks, and key capabilities of Mezon.Net.Sdk 1.11.0 for C# and .NET bots.
---

# .NET bot SDK (`Mezon.Net.Sdk`)

`Mezon.Net` is the official multi-layered .NET SDK for building Mezon bots, high-throughput services, and real-time voice clients in C# and other .NET languages.

This documentation covers **`Mezon.Net` `v1.11.0`** on NuGet, targeting **`netstandard2.1`**, **`net6.0`**, **`net8.0`**, **`net9.0`**, and **`net10.0`**.

## Package catalog (8 NuGet packages)

Most bot developers only install **`Mezon.Net.Sdk`** — it brings in `Mezon.Net.Client`, `Mezon.Net.Transport`, `Mezon.Net.Core`, and (on `net6.0+`) `Mezon.Net.Mmn` transitively. Add the caching and SFU packages only when needed:

| NuGet Package | Target Frameworks | Purpose |
| --- | --- | --- |
| `Mezon.Net.Sdk` | `netstandard2.1`, `net6.0`–`net10.0` | **Primary bot SDK**: `MezonClient`, entities (`Clan`, `Channel`, `Role`, `Message`, `User`), `AddMezonClient()` DI, `CommandService`, `InteractionRouter`, `CollectorService`, typed builders, L1 cache, MMN & Agent SSE |
| `Mezon.Net.Client` | `netstandard2.1`, `net6.0`–`net10.0` | Low-level socket engine (`BaseMezonSocketClient`, generated `Api.g.cs` & `Realtime.g.cs`, `Mezon.Net.Models` `*Params`/`*Response`/`*EventData`, `MessageContent` codec) |
| `Mezon.Net.Transport` | `netstandard2.1`, `net6.0`–`net10.0` | TLS abridged TCP (`MezonNetworkTcpTransporter`) and WebSocket (`MezonNetworkWebSocketTransporter`) frame codecs |
| `Mezon.Net.Core` | `netstandard2.1`, `net6.0`–`net10.0` | Protobuf contracts, `MezonApiMap`, `MezonApiException`, `RequestOptions`, transport interfaces |
| `Mezon.Net.Mmn` | `net6.0`–`net10.0` | Mezon Dong Network (MMN) gRPC node client + ZK proof HTTP client *(stubbed on `netstandard2.1`)* |
| `Mezon.Net.Sdk.Caching.Redis` | `netstandard2.1`, `net6.0`–`net10.0` | Optional **L2** shared DTO snapshot cache + Redis/Valkey pub/sub invalidation across pods |
| `Mezon.Net.Sdk.Caching.Sqlite` | `netstandard2.1`, `net6.0`–`net10.0` | Optional **L3** durable SQLite WAL message history store (`SqliteMessageStore`) |
| `Mezon.Net.Sdk.Sfu` | `netstandard2.1`, `net6.0`–`net10.0` | Optional voice/meeting SFU WebRTC client (Opus/VP8 RTP via `SIPSorcery`, moderation, reconnect) |

## Layered architecture & protobuf boundary

```text
Mezon.Net.Sdk          → Bot facade (MezonClient, entities, DI, commands, interactions, builders, L1)
Mezon.Net.Mmn          → MMN gRPC node client + ZK proof HTTP client
Mezon.Net.Client       → Socket engine (CID map, Envelope, API-over-socket, ordered dispatch lanes)
Mezon.Net.Transport    → TLS abridged TCP (primary) + WebSocket
Mezon.Net.Core         → Protobuf, MezonApiMap, exceptions, options
```

- **Zero-allocation response views (`Mezon.Net.Models`)**: Public request types are readonly `*Params` structs (`SendChannelMessageParams`), responses are `*Response` view structs wrapping protobuf messages without extra heap allocations, and event args are `*EventData` structs implicitly convertible to `*Response`.
- **Two audiences**: Bot developers reference `Mezon.Net.Sdk` and work with `Mezon.Net.Sdk.MezonClient` (past-tense events like `ChannelMessageReceived`, no `Event` suffix). Custom UI/engine developers can reference `Mezon.Net.Client` directly (`Mezon.Net.Client.MezonClient`, events suffixed with `Event` like `ChannelMessageReceivedEvent`).
- **Native 64-bit IDs**: All Mezon Snowflake IDs (`BotId`, `ClanId`, `ChannelId`, `MessageId`, `UserId`, `RoleId`) are exact 64-bit `long` values — no string conversion needed.
- **Compile-time bot API safety**: Methods for RPCs blocked on bot sockets (`ListClanUsersAsync`, `ListChannelMessagesAsync`, `ListRoleUsersAsync`, `ListQuickMenuAccessAsync`, upload methods) are annotated with `[Obsolete]` so the compiler warns before a bot triggers a `403` `MezonApiException`.

## In this section

- [Quickstart](./quickstart.md) — console bot and ASP.NET Core / Generic Host `AddMezonClient()` DI setup.
- [Commands, interactions & builders](./commands-and-interactions.md) — `CommandService`, `InteractionRouter` (including `InteractionActorTrust`), `CollectorService`, and typed message builders.
- [Caching & performance](./caching-and-performance.md) — ordered dispatch lanes, L1 `EntityCache`, L2 Redis/Valkey snapshots, and L3 SQLite WAL message persistence.
- [API reference](./api-reference.md) — complete `MezonClient`, options, events, entities, and `[Obsolete]` APIs table.
