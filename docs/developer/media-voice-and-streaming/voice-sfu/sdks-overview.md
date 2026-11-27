---
sidebar_position: 2
sidebar_label: SFU SDKs overview
description: Compare all six pre-1.0 Mezon Voice SFU SDKs across TypeScript, Go, Rust, Kotlin, Python, and .NET.
---

# Voice SFU SDKs overview

Mezon maintains **six official SFU client SDKs** verified against real `mezon-sfu` instances in both dynamic and fixed-slot downlink modes, with automated cross-SDK media interoperability tests (each SDK records and plays audio across the others).

:::warning Pre-1.0 status across all 6 SFU SDKs
All six Mezon Voice SFU SDKs are currently **Pre-1.0** (`0.0.0`, `0.1.0`, or experimental SFU module alongside `Mezon.Net.Sdk.Sfu 1.11.0`). Core room, media, reconnect, and moderation features are tested end-to-end against `mezon-sfu`, but public APIs may still evolve before `1.0`.
:::

## SDK comparison matrix

| Language | Package / Repository | Version | WebRTC stack | Media API | Target runtimes | Unique capabilities / caveats |
|---|---|---|---|---|---|---|
| **TypeScript** | `mezon-sfu-sdk` (`mezonai/mezon-sfu-sdk-js`) | `0.0.0` (Pre-1.0) | Browser WebRTC; `@roamhq/wrtc` + `ws` in Node | `MediaStreamTrack`; `PcmAudioSource` / `PcmAudioSink` in Node | Browsers (Chromium primary), Node.js 20+ | **Only SDK supporting screen share** (browser). Ships ESM, CJS, and IIFE (`MezonSfu`) + `/node` and `/protocol` subpaths. |
| **Go** | `github.com/mezonai/mezon-sfu-sdk-go` | Pre-1.0 | `pion/webrtc/v4` (pure Go, no cgo) | Encoded Opus & VP8 RTP + `oggopus` package | Linux/Windows servers, bots, load testers | Zero cgo dependencies; packet-level Ogg Opus reader/writer without transcoding. |
| **Rust** | `mezon-sfu-core` + `mezon-sfu` (`mezonai/mezon-sfu-sdk-rust`) | `0.1.0` (Pre-1.0) | `webrtc-rs` 0.21 + `tokio` | Encoded Opus & VP8 RTP + `oggopus` | Servers, bots (MSRV 1.88 core / 1.91 client) | Clean **sans-I/O** `mezon-sfu-core` crate separable from runtime; receiver keyframe requests are not surfaced on camera publish (send periodic keyframes). |
| **Kotlin** | `ai.mezon:mezon-sfu-*` (`mezonai/mezon-sfu-sdk-kotlin`) | `0.1.0` (Pre-1.0) | `webrtc-java` 0.19 (JVM); `io.github.webrtc-sdk:android` (Android) | 16-bit PCM audio, I420 video | JVM 17+, Android 7+ (API 24) | Modular artifacts (`mezon-sfu-core`, `mezon-sfu`, `mezon-sfu-webrtc-jvm`, `mezon-sfu-android`). Render Android video via `addVideoSink` (native track wrappers rotate on renegotiation). |
| **Python** | `mezon-sfu-sdk` (`mezonai/mezon-sfu-sdk-python`, PyPI) | `0.1.0` Alpha (Pre-1.0) | `aiortc` 1.15 + `websockets` + `asyncio` | 16-bit PCM audio, I420 video | Python >= 3.11 | Pure `mezon_sfu.core` + asyncio `mezon_sfu`. **VP8 video only** (`aiortc` cannot decode VP9 screens, so VP9-only browser screen shares negotiate inactive). |
| **.NET** | `Mezon.Net.Sdk.Sfu` (NuGet) | `1.11.0` (Pre-1.0 SFU) | Managed C# `SIPSorcery` 10 | Encoded Opus & VP8 RTP + `OggOpusReader` | .NET Standard 2.1, .NET 6, 8, 9, 10 | **Only SDK currently supporting decoupled media pools (`media_pool_version: 1`)**; 100% managed C# without native libwebrtc binaries. |

## Feature parity

| Feature | TypeScript | Go | Rust | Kotlin | Python | .NET |
|---|---|---|---|---|---|---|
| Dynamic & fixed-slot downlink | Yes | Yes | Yes | Yes | Yes | Yes |
| Decoupled media pools (`media_pool_version: 1`) | — | — | — | — | — | **Yes** |
| Microphone + RFC 6464 audio levels | Yes | Yes | Yes | Yes | Yes | Yes |
| Camera publish | Yes | VP8 | VP8 | Yes | VP8 | VP8 |
| Screen share publish | **Browser** | — | — | — | — | — |
| Audience push-to-talk (PTT) | Yes | Yes | Yes | Yes | Yes | Yes |
| Room chat messages, metadata & moderation | Yes | Yes | Yes | Yes | Yes | Yes |
| Video receive toggle & keyframe requests | Yes | Yes | Yes | Yes | Yes | Yes |
| Active speaker tracking | Yes | Yes | Yes | Yes | Yes | Yes |
| Automatic reconnect & `TokenProvider` refresh | Yes | Yes | Yes | Yes | Yes | Yes |

## Known `mezon-sfu` server compatibility notes

- **Audience PTT forwarding:** Modern `mezon-sfu` builds (`>= 0520143`) forward audience push-to-talk audio to both speakers and other audience members; older nodes forwarded PTT to speakers only.
- **Control characters in metadata/chat:** All six SDKs strip raw control characters from server frames to remain compatible with older `mezon-sfu` builds.
- **Local loopback testing (`127.0.0.1`):** When running `mezon-sfu` on localhost (especially on Windows), explicitly enable loopback candidates / bind addresses:
  - Rust: `udp_addrs = vec!["127.0.0.1:0".into()]`, `include_loopback_candidates = true`
  - Kotlin JVM: `JvmMediaOptions(anyAddressPorts = true)`
  - Python: `Options(bind_addresses=["127.0.0.1"])`
  - .NET: `new RoomOptions { BindAddress = IPAddress.Loopback }`

## Next steps

Jump to [SFU quickstarts](./quickstarts.mdx) for runnable connection, publish, and receive examples in all six languages.
