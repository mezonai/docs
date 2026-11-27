---
sidebar_position: 2
sidebar_label: Error codes & troubleshooting
description: Diagnose Mezon API/socket errors, BigInt Snowflake precision, better-sqlite3 builds, Channel App HMAC mismatches, bot 403 allowlists, and WHIP SDP issues.
---

# Error codes & troubleshooting

This guide catalogs the most common error codes and integration pitfalls across Mezon bots, channel apps, webhooks, Voice SFU, and WHIP streaming—together with verified root causes and exact fixes.

## Core API & transport error codes

| Code / status | gRPC / `mezon-api` code | Common causes | Resolution |
|---|---|---|---|
| `400` | `InvalidArgument` | Missing/malformed parameter, `expire_hours` outside `1..168`, poll answers outside `2..20`, `action_msg` empty or `> 512` bytes, `GenerateMeetToken` called on non-voice channel (`type != 10`), `GetStreamPlayback` called on non-stream channel (`type != 6`), invalid attachment/image URL. | Validate request fields against the endpoint contract before retrying. |
| `401` | `Unauthenticated` | Expired or invalid session JWT; **or** an `external` (`mezon-light-sdk`) / bot session calling an RPC outside its allowlist in `mezon-api`. | Refresh/re-authenticate the session (`ensureValidSession()` / `refreshSession()`), or verify the RPC is allowed for your session type. |
| `403` | `PermissionDenied` | Bot lacks clan/channel membership, lacks `Manage Channel` / `Manage Clan`, calls a bot-blocked RPC on `mezon-proto-server`, tries to close another user's poll, or calls `UpdateQuickMenuAccess` as a bot. | Invite the bot to the clan/channel, grant required clan permissions, or check the [bot API allowlist](../core-concepts/permissions-and-api-access.md). |
| `404` | `NotFound` | Channel, poll, webhook, or WHIP `/resource/<id>` does not exist or has ended. | Re-fetch entity IDs or start a new WHIP session. |
| `429` / `Aborted` | `Aborted` | Server per-user rate limiter triggered (`limiter.Limit`). | Back off and throttle outgoing calls; `Mezon.Net.Sdk` and `mezon-sdk` queue sends automatically. |
| `500` / `503` | `Internal` / `Unavailable` | Transient database, cache, DTLS, or capacity exhaustion (e.g. draining streaming node returning `503` with `Retry-After`). | Retry with jittered exponential backoff; honor `Retry-After`. |

---

## Top integration pitfalls & fixes

### 1. Snowflake ID precision loss in JavaScript (`2^53 - 1`)

**Symptom:** The last 2–3 digits of a 19-digit Mezon `user_id`, `channel_id`, or `message_id` change (often ending in `00`), causing `NotFound` or mismatched user records.

**Cause:** Mezon IDs are 64-bit integers (`int64`). JavaScript's `Number` type only represents integers safely up to `9,007,199,254,740,991` (`Number.MAX_SAFE_INTEGER`). Calling `JSON.parse()` on payloads containing numeric IDs—such as the `user` JSON inside Channel App `WebAppData`—silently rounds them.

**Fix:**
- Always store and transmit Mezon IDs as **strings** in JS/TS (and `int64` / `long` in Go, C#, Rust, Kotlin, Python).
- When parsing Channel App `user` JSON in Node.js, extract `"id"` via regex or a BigInt-safe JSON parser before calling `JSON.parse()` (see [Verifying launch data](../channel-apps-and-widgets/channel-apps/verifying-launch-data.mdx)).

---

### 2. `better-sqlite3` native build failures on Node.js 22 / 24

**Symptom:** `npm install mezon-sdk` fails during `node-gyp rebuild` with missing Python, C++ compiler, or prebuild errors on Node 22 or Node 24.

**Cause:** `mezon-sdk` `2.8.68` depends on `better-sqlite3` (`^11.10.0`), a native C++ addon used for local message caching. If a prebuilt binary is not published for your exact Node ABI + OS/arch combination, npm falls back to compiling from source.

**Fix:**
- Prefer **Node.js 20 LTS** or a Node 22 release with prebuilt `better-sqlite3` binaries.
- If building from source, install platform build tools:
  - **Linux (Debian/Ubuntu):** `sudo apt-get install -y build-essential python3`
  - **macOS:** `xcode-select --install`
  - **Windows:** Visual Studio Build Tools with the "Desktop development with C++" workload + Python 3.

---

### 3. Channel App `WebAppData` HMAC hash never matches

**Symptom:** Your backend `checkMezonData` function always rejects valid launches with `401`.

**Checklist:**
1. **Double decoding:** `URLSearchParams.get("data")` already decodes the query value once. Calling `decodeURIComponent(data)` a second time alters `%7B` / `%3D` sequences inside `user` and `signature` and breaks the HMAC.
2. **MD5 encoding:** `secret` is the **32-character lowercase hex string** of `md5(appToken)`, NOT the raw 16-byte digest.
3. **Parameter order:** Hash the exact substring before `&hash=` verbatim—do **not** parse, sort keys alphabetically, or re-serialize.
4. **Stale token:** Verify `MEZON_APP_TOKEN` matches the current **Token** in the developer portal (resetting it invalidates old values).
5. **Clock skew / `auth_date`:** Ensure your server clock is NTP-synced if your `maxAgeSeconds` check rejects fresh launches.

---

### 4. `403 Permission denied` on bot API calls

**Symptom:** Calling `ListChannelMessages`, `ListClanUsers`, `ListRoleUsers`, `ListQuickMenuAccess`, `UploadAttachmentFile`, `VotePoll`, or `UpdateQuickMenuAccess` fails with `403 Permission denied` (or `Unauthenticated`).

**Cause & Fix:**
- Bots can only invoke RPCs on the server's [bot allowlist](../core-concepts/permissions-and-api-access.md).
- To send images from a bot, host them at a public HTTPS URL and pass `{ url, filename, filetype, width, height }` in `attachments` instead of calling `UploadAttachmentFile`.
- To update a bot's quick menu entry, **delete and re-add it**—`UpdateQuickMenuAccess` explicitly returns `PermissionDenied` for bot sessions (`api_quick_menu.go`).
- To read message history, cache messages as they arrive in `onChannelMessage` (or use [Mezon Desktop MCP](../ai-and-mcp/mcp-integration.md) for personal user-session reads).

---

### 5. Message exceeds 4,000-byte limit or webhook body exceeds 4 MiB

**Symptom:** Native channel webhook messages arrive displaying `"The original message was too long"`, or large HTTP webhook calls fail at the transport layer.

**Cause & Fix:**
- `mezon-api` enforces `MaxRequestBodySize = 4 MiB` on HTTP requests.
- Native channel webhooks cap the serialized `{ "t": ..., "mk": ... }` JSON at **4,000 bytes** (multi-byte UTF-8 characters like Vietnamese accents consume 2–3 bytes each). Split long updates into multiple messages or link to an external report.

---

### 6. WHIP publishing errors (`400`, `406`, `409`, `404` on `PATCH`)

| Symptom | Cause & exact fix |
|---|---|
| `400` on `POST /whip/<ch>` | Client offered `a=setup:passive` (node is always DTLS passive—client must offer `actpass` or `active`; pass `-whip_flags dtls_active` in `ffmpeg`), missing ICE/SHA-256 fingerprint, or invalid channel name. |
| `404` on `PATCH` | `mezon-streaming-server` is ICE-lite and does **not** implement trickle ICE. Send complete candidates (or rely on ICE-lite client STUN checks) in the initial `POST`. |
| `406 Not Acceptable` | Offer did not contain Opus `48000` or the node's configured video codec (`H264/90000` with `packetization-mode=1`, `profile-level-id=42e01f`, or `VP8/90000`). |
| `409 Conflict` | Another `sub` is currently publishing in that stream channel. Only one publisher per channel is allowed; reconnecting with the **same `sub`** replaces your own session cleanly. |
| Video freezes or never starts in HLS | Missing **in-band SPS/PPS** ahead of IDR frames (`sprop-parameter-sets` is ignored), B-frames enabled (`-bf 0` required), or encoder ignoring PLI without a 2-second fixed GOP. |

---

### 7. Shadow Bot cannot send MMN tokens

**Symptom:** `sendToken` / `SendTransferAsync` fails with `ZkProofs` / `MMN account is not initialized`.

**Cause:** `mezon-gw` omits `id_token` when authenticating Shadow Bots (`isShadow == true`). Switch to a standard bot application to perform MMN token transfers.

---

### 8. Voice SFU disconnects with `4012` or fails on `127.0.0.1`

- **Close code `4012` (`duplicate_session`):** A single Mezon user ID can hold only **one** active SFU session across all rooms. Check for a second bot instance or browser tab logged in as the same identity.
- **Close code `4004` / `4005`:** Meet token expired or rejected. Supply a dynamic `TokenProvider` callback that fetches a new token via `GenerateMeetToken` instead of a fixed token string.
- **Local SFU on `127.0.0.1` fails ICE:** Explicitly bind loopback candidates in Rust, Kotlin JVM, Python, or .NET (see [SFU SDKs overview](../media-voice-and-streaming/voice-sfu/sdks-overview.md#known-mezon-sfu-server-compatibility-notes)).

## Related

- [Permissions and API access](../core-concepts/permissions-and-api-access.md)
- [Verifying launch data](../channel-apps-and-widgets/channel-apps/verifying-launch-data.mdx)
- [Publishing with WHIP](../media-voice-and-streaming/stream-channels/publishing-with-whip.mdx)
