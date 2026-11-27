---
sidebar_position: 3
sidebar_label: Changelog
description: Current package versions and verified platform, SDK, media protocol, and MCP release highlights across the Mezon developer ecosystem.
---

# Platform & SDK changelog

This page tracks the current verified versions and notable developer-facing changes across Mezon's SDKs, media protocols, and platform APIs.

## Current ecosystem version snapshot (November 2026)

| Component | Package / artifact | Current version | Status |
|---|---|---|---|
| **JavaScript / TypeScript Bot SDK** | `mezon-sdk` (npm) | `2.8.68` | Stable |
| **.NET Bot SDK & MMN** | `Mezon.Net.Sdk`, `Mezon.Net.Mmn` (NuGet) | `1.11.0` | Stable |
| **Light External Chat SDK** | `mezon-light-sdk` (npm) | `1.0.10` | Stable |
| **Embeddable Chat Widget** | `mezon-chat-widget` (npm) | `1.1.4` | Stable |
| **Voice SFU SDKs (6 languages)** | `mezon-sfu-sdk` (TS `0.0.0`, PyPI `0.1.0`), `mezon-sfu-sdk-go`, `mezon-sfu` (Rust `0.1.0`), `ai.mezon:mezon-sfu` (Kotlin `0.1.0`), `Mezon.Net.Sdk.Sfu` (NuGet `1.11.0`) | Pre-1.0 | Pre-1.0 |
| **Standalone MMN SDKs** | `mmn-client-js` (`1.0.16`, npm), `github.com/mezonai/mmn-sdk/go-sdk` (`v1.1.0`), `Mezon.Net.Mmn` (`1.11.0`, NuGet) | `1.0.16` / `v1.1.0` / `1.11.0` | Stable |
| **Streaming Server Protocol** | `mezon-streaming-server` (`spec.md`) | `0.9.1` | Active |
| **Mezon Desktop In-App MCP** | `mezon mcp` (`mezon-desktop/crates/mezon-mcp`) | 123 tools (59 read / 64 write) | Active |

---

## Notable platform & SDK milestones

### November 2026

- **Streaming Server Protocol `0.9.1` (2026-11-23):** When a WHIP publisher pauses audio while video continues, the origin injects 20 ms silent Opus frames after 0.5 s so CMAF HLS segments stay A/V synchronized when audio resumes.
- **Streaming Server Protocol `0.9.0` (2026-11-18):** Added `cdn.target: r2` uploader support for Cloudflare R2 object storage with automatic retries on HTTP `429` and `5xx`, and added `"storage"` reporting to `/stats`.
- **`mezon-sdk` `2.8.68`:**
  - Upgraded `mmn-client-js` dependency to `^1.0.16`.
  - Added `getStreamPlayback`, `generateCDNSignature`, `generateMeetToken`, `createPoll` / `getPoll` / `closePoll`, `onFriendStateUpdated`, `Events.ChannelArchive`, and AI agent SSE lifecycle hooks (`connectMezonAgentSSE`, `onAIAgentSessionStarted`, `onAIAgentSessionEnded`, `onAIAgentSessionSummaryDone`).
  - Added gateway healthy-endpoint resolution during socket reconnects.
- **`Mezon.Net.Sdk` `1.11.0`:**
  - Added `InteractionRouter` with explicit `InteractionActorTrust` (`ClientSupplied` vs `ServerAuthenticated`) and `.RequireServerAuthenticatedActor()` guard.
  - Added typed `MessageContentBuilder`, `MessageEmbedBuilder`, and `AgentSseManager` (`ConnectAgentSseAsync`).
  - Added thread-safe `_mmnTransferGate` serialization around MMN pending nonce lookup and signing.
  - Marked bot-blocked API methods (`ListClanUsersAsync`, `ListChannelMessagesAsync`, `ListRoleUsersAsync`, `ListQuickMenuAccessAsync`, `UploadAttachmentFileAsync`) with `[Obsolete]` compiler warnings.
  - Added decoupled media pool support (`media_pool_version: 1`) in `Mezon.Net.Sdk.Sfu`.
- **Voice SFU SDK 6-language suite (Pre-1.0):** Completed cross-SDK interoperability verification against `mezon-sfu` across TypeScript, Go, Rust, Kotlin (JVM + Android), Python, and .NET in both dynamic and fixed-slot rooms.
- **Mezon Desktop In-App MCP:** Shipped `mezon mcp start|status|stop|tools|call|stdio` with `--read-only` filtering and 123 structured tools over localhost Streamable HTTP (`/mcp`) and `stdio`.
- **Channel Apps mobile parity:** Confirmed Web, Android, and iOS clients all invoke `GenerateHashChannelApps` and pass signed `?data=<webAppData>` on app launch.

### October 2026

- **Streaming Server Protocol `0.8.0` (2026-10-30):** Finalized push-to-storage CMAF HLS architecture—origin nodes upload playlists and fMP4 segments directly to S3/R2 buckets behind the CDN instead of serving HLS directly; deprecated legacy node-served HLS routes and `X-Mezon-Cdn-Key` authentication.
- **Realtime Protocol Envelopes `104`–`107`:** Standardized `StreamingWatch` (`104`), `SfuBreakoutRoomEvent` (`105`), `StreamingViewerCountEvent` (`106`), and `FriendStateUpdated` (`107`). Stream channel state moved to cluster-safe single-key Valkey structures (`strm:live`, `strm:<channel_id>`).

## Related

- [SDK ecosystem matrix](../getting-started/sdk-ecosystem-matrix.md)
- [Events reference](./events-reference.md)
- [Error codes & troubleshooting](./error-codes-and-troubleshooting.md)
