---
sidebar_position: 2
sidebar_label: Tổng quan SFU SDK
description: So sánh toàn bộ sáu bộ SDK Voice SFU pre-1.0 của Mezon cho TypeScript, Go, Rust, Kotlin, Python và .NET.
---

# Tổng quan các SFU SDK

Mezon phát triển **sáu bộ SFU SDK chính thức**, đều được kiểm thử tích hợp thực tế với `mezon-sfu` ở cả hai chế độ dynamic và fixed-slot, cùng bộ kiểm thử tương thích chéo giữa các ngôn ngữ (mỗi SDK đều có thể phát và ghi âm lẫn nhau).

:::warning Trạng thái Pre-1.0 trên cả 6 SFU SDK
Cả sáu Voice SFU SDK của Mezon hiện đều ở trạng thái **Pre-1.0** (`0.0.0`, `0.1.0`, hoặc module SFU phát hành kèm `Mezon.Net.Sdk.Sfu 1.11.0`). Các tính năng cốt lõi như kết nối phòng, media, tự kết nối lại và điều hành đều chạy ổn định với `mezon-sfu` thật, nhưng API công khai vẫn có thể thay đổi trước bản `1.0`.
:::

## Ma trận so sánh 6 SFU SDK

| Ngôn ngữ | Gói / Kho mã | Phiên bản | Ngăn xếp WebRTC | API Media | Môi trường chạy | Điểm nổi bật / lưu ý |
|---|---|---|---|---|---|---|
| **TypeScript** | `mezon-sfu-sdk` (`mezonai/mezon-sfu-sdk-js`) | `0.0.0` (Pre-1.0) | WebRTC trình duyệt; `@roamhq/wrtc` + `ws` trên Node | `MediaStreamTrack`; `PcmAudioSource` / `PcmAudioSink` (Node) | Trình duyệt (ưu tiên Chromium), Node.js 20+ | **SDK duy nhất hỗ trợ chia sẻ màn hình** (trình duyệt). Hỗ trợ ESM, CJS, IIFE (`MezonSfu`) + `/node` và `/protocol`. |
| **Go** | `github.com/mezonai/mezon-sfu-sdk-go` | Pre-1.0 | `pion/webrtc/v4` (Go thuần, không cgo) | Opus & VP8 RTP + gói `oggopus` | Máy chủ Linux/Windows, bot, công cụ tải | Không cần cgo; đọc/ghi tệp Ogg Opus theo từng gói mà không cần giải mã. |
| **Rust** | `mezon-sfu-core` + `mezon-sfu` (`mezonai/mezon-sfu-sdk-rust`) | `0.1.0` (Pre-1.0) | `webrtc-rs` 0.21 + `tokio` | Opus & VP8 RTP + `oggopus` | Máy chủ, bot (MSRV 1.88 core / 1.91 client) | Crate lõi `mezon-sfu-core` thiết kế **sans-I/O** tách biệt runtime; yêu cầu keyframe từ người nhận chưa được đẩy lên khi phát camera (hãy gửi keyframe định kỳ). |
| **Kotlin** | `ai.mezon:mezon-sfu-*` (`mezonai/mezon-sfu-sdk-kotlin`) | `0.1.0` (Pre-1.0) | `webrtc-java` 0.19 (JVM); `io.github.webrtc-sdk:android` (Android) | Âm thanh PCM 16-bit, video I420 | JVM 17+, Android 7+ (API 24) | Tách module gọn (`mezon-sfu-core`, `mezon-sfu`, `mezon-sfu-webrtc-jvm`, `mezon-sfu-android`). Trên Android nên hiển thị video qua `addVideoSink`. |
| **Python** | `mezon-sfu-sdk` (`mezonai/mezon-sfu-sdk-python`, PyPI) | `0.1.0` Alpha (Pre-1.0) | `aiortc` 1.15 + `websockets` + `asyncio` | Âm thanh PCM 16-bit, video I420 | Python >= 3.11 | Tách `mezon_sfu.core` + `mezon_sfu` asyncio. **Chỉ hỗ trợ video VP8** (`aiortc` không giải mã được màn hình VP9 từ trình duyệt). |
| **.NET** | `Mezon.Net.Sdk.Sfu` (NuGet) | `1.11.0` (SFU Pre-1.0) | `SIPSorcery` 10 (C# thuần quản lý) | Opus & VP8 RTP + `OggOpusReader` | .NET Standard 2.1, .NET 6, 8, 9, 10 | **SDK duy nhất hiện hỗ trợ decoupled media pools (`media_pool_version: 1`)**; 100% C# không cần thư viện native libwebrtc. |

## So sánh tính năng

| Tính năng | TypeScript | Go | Rust | Kotlin | Python | .NET |
|---|---|---|---|---|---|---|
| Downlink dynamic & fixed-slot | Có | Có | Có | Có | Có | Có |
| Decoupled media pools (`media_pool_version: 1`) | — | — | — | — | — | **Có** |
| Micro + mức âm lượng RFC 6464 | Có | Có | Có | Có | Có | Có |
| Phát camera | Có | VP8 | VP8 | Có | VP8 | VP8 |
| Chia sẻ màn hình | **Trình duyệt** | — | — | — | — | — |
| Nhấn để nói (Audience PTT) | Có | Có | Có | Có | Có | Có |
| Chat phòng, metadata & điều hành (mute/kick) | Có | Có | Có | Có | Có | Có |
| Bật/tắt nhận video & yêu cầu keyframe | Có | Có | Có | Có | Có | Có |
| Theo dõi người đang nói (active speaker) | Có | Có | Có | Có | Có | Có |
| Tự kết nối lại & làm mới `TokenProvider` | Có | Có | Có | Có | Có | Có |

## Lưu ý tương thích với `mezon-sfu`

- **Phát PTT cho khán giả:** Các bản `mezon-sfu` mới (`>= 0520143`) chuyển tiếp âm thanh push-to-talk của audience tới cả speaker và các audience khác; phiên bản cũ chỉ chuyển tiếp cho speaker.
- **Ký tự điều khiển trong metadata/chat:** Cả sáu SDK đều lọc ký tự điều khiển thô từ frame máy chủ để tương thích với các bản `mezon-sfu` cũ hơn.
- **Kiểm thử cục bộ trên `127.0.0.1`:** Khi chạy `mezon-sfu` ở loopback (đặc biệt trên Windows), hãy cấu hình địa chỉ bind / candidate loopback rõ ràng:
  - Rust: `udp_addrs = vec!["127.0.0.1:0".into()]`, `include_loopback_candidates = true`
  - Kotlin JVM: `JvmMediaOptions(anyAddressPorts = true)`
  - Python: `Options(bind_addresses=["127.0.0.1"])`
  - .NET: `new RoomOptions { BindAddress = IPAddress.Loopback }`

## Bước tiếp theo

Chuyển sang [Bắt đầu nhanh SFU](./quickstarts.mdx) để xem mã kết nối, phát và nhận media bằng cả sáu ngôn ngữ.
