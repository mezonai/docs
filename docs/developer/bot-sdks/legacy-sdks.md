---
sidebar_label: Legacy & unmaintained SDKs
sidebar_position: 3
description: Status and migration paths for deprecated or unmaintained Mezon repositories including mezon-go-sdk, mezon-java-sdk, mezon-mcp, and mezon-web-js.
---

# Legacy & unmaintained SDKs

Several older Mezon repositories still exist in GitHub or package registries from earlier platform versions. **Do not start new integrations on these packages** — they lack support for the current TLS abridged TCP (`0xEF`) transport, gateway failover, or current bot API allowlists.

## Summary & replacement paths

| Repository / Package | Current Status | Key Limitations | Recommended Replacement |
| --- | --- | --- | --- |
| `mezon-go-sdk` (`v0.0.34`) | **Stale / Unmaintained** | Legacy `github.com/nccasia/mezon-go-sdk` module; older WebSocket/API contract; lacks TLS abridged TCP framing, `getHealthyEndpoint` failover, polls, and stream playback grants | [`mezon-sdk` 2.8.68](./javascript/overview.md) (Node.js) or [`Mezon.Net.Sdk` 1.11.0](./dotnet/overview.md) (.NET). For Go **voice SFU** media only, use [`mezon-sfu-sdk-go`](../media-voice-and-streaming/voice-sfu/sdks-overview.md). |
| `mezon-java-sdk` | **Abandoned stub** | Incomplete Gradle/protobuf scaffolding; never reached production bot support | [`mezon-sdk` 2.8.68](./javascript/overview.md) or [`Mezon.Net.Sdk` 1.11.0](./dotnet/overview.md). For JVM/Android **voice SFU** media only, use `mezon-sfu-sdk-kotlin`. |
| `mezon-mcp` (`mezon-mcp-server`) | **Outdated prototype** | Pinned to `mezon-sdk ^2.7.84`; incompatible with `mezon-sdk` `2.8.x` transport, session lifecycle, and API surface | Build MCP tool servers directly on top of `mezon-sdk` `2.8.68` — see [MCP integration](../ai-and-mcp/mcp-integration.md). |
| `mezon-web-js` (`1.0.0`) | **Superseded legacy bridge** | Early iframe `postMessage` mini-app bridge replaced by signed URL launch payloads | Use standard HTTPS Channel Apps with server-side HMAC verification of `?data=` — see [Channel apps overview](../channel-apps-and-widgets/channel-apps/overview.md) and [Verifying launch data](../channel-apps-and-widgets/channel-apps/verifying-launch-data.mdx). |

## Migration checklist

1. **Migrating from `mezon-go-sdk` or `mezon-java-sdk`**:
   - Reuse your existing Developer Portal **Bot ID** and **Token** — credentials are protocol-level and do not change across SDKs.
   - Audit any calls to `ListClanUsers`, `ListChannelMessages`, `ListRoleUsers`, or `UploadAttachmentFile`: modern `mezon-proto-server` rejects these with `403 Permission denied` for bot tokens (see [Permissions & API access](../core-concepts/permissions-and-api-access.md)).
   - Replace polling or message-history backfills with event-driven state plus local SQLite persistence (`mezon-sdk` built-in cache or `Mezon.Net.Sdk.Caching.Sqlite`).
2. **Migrating from `mezon-mcp`**:
   - Upgrade to `mezon-sdk@2.8.68` and expose only bot-allowlisted capabilities as MCP tools (sending messages, ephemeral responses, polls, channel lookups, role listing).
3. **Migrating from `mezon-web-js`**:
   - Remove the webpack mini-app bridge bundle from your frontend.
   - Read the `?data=` query parameter on your Channel App entry route and validate its HMAC signature on your backend using your 16-character App Token.

## Related

- [SDK ecosystem matrix](../getting-started/sdk-ecosystem-matrix.md) — full comparison of active vs. legacy SDKs.
- [Changelog](../reference/changelog.md) — history of platform and SDK milestones.
