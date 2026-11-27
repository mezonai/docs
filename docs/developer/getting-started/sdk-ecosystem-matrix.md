---
sidebar_label: SDK ecosystem matrix
sidebar_position: 4
description: Compare all official, pre-1.0, and legacy Mezon SDKs across languages, runtimes, versions, and stability tiers.
---

# SDK ecosystem matrix

Use this matrix to pick the right, actively maintained package for your runtime and use case. Versions reflect the verified source packages as of November 2026.

## Stable production SDKs

| Package / Project | Registry & Version | Language / Runtime | Primary Use Case | Documentation |
| --- | --- | --- | --- | --- |
| `mezon-sdk` | npm `2.8.68` | TypeScript / JavaScript (**Node.js only**) | Full-featured Mezon bots (TLS TCP, SQLite cache, interactive builders, MMN, Agent SSE) | [JS/TS Bot SDK](../bot-sdks/javascript/overview.md) |
| `Mezon.Net.Sdk` (+ 7 companion packages) | NuGet `1.11.0` | C# / .NET (`netstandard2.1`, `net6.0`–`net10.0`) | High-throughput Mezon bots, DI, `CommandService`, `InteractionRouter`, Redis L2 / SQLite L3, SFU, MMN | [.NET Bot SDK](../bot-sdks/dotnet/overview.md) |
| `mezon-light-sdk` | npm `1.0.10` | TypeScript / JavaScript (Browser & Node.js) | Lightweight chat client authenticated via `AuthenticateIdToken` (`external` 5-RPC scope) | [Light SDK](../channel-apps-and-widgets/light-sdk.md) |
| `mezon-chat-widget` | npm `1.1.4` | Web / React / Browser | Drop-in embeddable Mezon chat widget for third-party web apps | [Chat Widget](../channel-apps-and-widgets/chat-widget.md) |
| `mmn-sdk` (`mmn-client-js`, `go-sdk`, `donet-sdk`) | npm / Go / .NET | JS/TS, Go, .NET | Direct Mezon Dong Network (MMN) transaction signing and ZK proof submission | [MMN SDKs](../payments-and-mmn/mmn-sdks.md) |

:::caution `mezon-sdk` is Node.js only
Even though older package descriptions mention browser usage, `mezon-sdk` `2.8.68` imports `node:tls` (for abridged TLS TCP) and native `better-sqlite3` (for local message caching). It cannot run in browsers or edge runtimes without Node.js native bindings. For browser chat integrations, use `mezon-light-sdk` or `mezon-chat-widget`.
:::

## Pre-1.0 Voice & Meeting SFU SDKs

The Mezon meeting SFU (`mezon-sfu`) exposes a dedicated WebRTC signaling and media protocol backed by six language SDKs. All six are pre-1.0 and track active protocol evolution:

| Repository / Package | Version | Runtime / Stack | Notes |
| --- | --- | --- | --- |
| `mezon-sfu-sdk-js` (`mezon-sfu-sdk`) | `0.0.0` (pre-1.0) | TypeScript / Browser & Node.js (`>=20.19`) | Browser WebRTC and Node.js signaling/media |
| `mezon-sfu-sdk-go` | Pre-1.0 (`go 1.25`) | Go (`pion/webrtc/v4`) | Server-side voice bots, bridges, and recorders |
| `mezon-sfu-sdk-rust` | `0.1.0` | Rust (edition 2024, `webrtc-rs`) | Low-latency native audio/video pipelines |
| `mezon-sfu-sdk-kotlin` | `0.1.0` (`ai.mezon`) | Kotlin (JVM & Android) | Mobile and JVM meeting clients |
| `mezon-sfu-sdk-python` (`mezon-sfu-sdk`) | `0.1.0` | Python `>=3.11` (`aiortc`) | AI voice agents, transcription bots, recorders |
| `Mezon.Net.Sdk.Sfu` | NuGet `1.11.0` (SFU API pre-1.0) | .NET (`netstandard2.1`, `net6.0`–`net10.0`, `SIPSorcery`) | Integrated with `Mezon.Net.Sdk` bots (Opus/VP8 RTP) |

See [Voice SFU SDKs overview](../media-voice-and-streaming/voice-sfu/sdks-overview.md) and [Quickstarts](../media-voice-and-streaming/voice-sfu/quickstarts.mdx) for details.

## Legacy & unmaintained SDKs

Do **not** start new projects on the packages below. Read [Legacy & unmaintained SDKs](../bot-sdks/legacy-sdks.md) for migration paths.

| Package / Repo | Observed Status | Why not to use | Recommended replacement |
| --- | --- | --- | --- |
| `mezon-go-sdk` | Stale (`v0.0.34`, legacy `github.com/nccasia/mezon-go-sdk`) | Outdated WebSocket/API contract; misses modern TLS abridged TCP & bot allowlist changes | `mezon-sdk` (Node.js) or `Mezon.Net.Sdk` (.NET) |
| `mezon-java-sdk` | Abandoned stub | Incomplete protobuf/client skeleton with no active maintenance | `mezon-sdk` or `Mezon.Net.Sdk` |
| `mezon-mcp` (`mezon-mcp-server`) | Outdated prototype (pinned to `mezon-sdk ^2.7.84`) | Broken against current `mezon-sdk` `2.8.x` transport & API surface | Build an MCP adapter directly on `mezon-sdk` `2.8.68` (see [MCP integration](../ai-and-mcp/mcp-integration.md)) |
| `mezon-web-js` | Legacy iframe bridge (`1.0.0`) | Replaced by signed `?data=` URL launch payloads for Channel Apps | [Channel apps & launch verification](../channel-apps-and-widgets/channel-apps/verifying-launch-data.mdx) |

## Quick selection guide

- **Building a standard bot in JS/TS?** → Install [`mezon-sdk` 2.8.68](../bot-sdks/javascript/quickstart.md).
- **Building a high-throughput, DI-hosted, or multi-instance bot in C#?** → Install [`Mezon.Net.Sdk` 1.11.0](../bot-sdks/dotnet/quickstart.md).
- **Building a web app inside a clan channel?** → Use plain HTTPS + [HMAC launch data verification](../channel-apps-and-widgets/channel-apps/verifying-launch-data.mdx) (no SDK required).
- **Embedding Mezon chat on your own site?** → Use [`mezon-light-sdk` 1.0.10](../channel-apps-and-widgets/light-sdk.md) or [`mezon-chat-widget` 1.1.4](../channel-apps-and-widgets/chat-widget.md).
- **Sending one-way notifications?** → Use [Webhooks](../webhooks/overview.mdx) (no SDK required).
