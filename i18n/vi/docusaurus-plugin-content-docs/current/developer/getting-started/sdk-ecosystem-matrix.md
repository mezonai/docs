---
sidebar_label: Ma trận hệ sinh thái SDK
sidebar_position: 4
description: So sánh toàn bộ các SDK Mezon chính thức, bản tiền 1.0 và bản cũ theo ngôn ngữ, môi trường chạy, phiên bản và mức độ ổn định.
---

# Ma trận hệ sinh thái SDK

Sử dụng bảng đối chiếu này để chọn đúng gói phần mềm đang được duy trì tích cực cho môi trường chạy và bài toán của bạn. Số phiên bản phản ánh trực tiếp mã nguồn đã xác minh tính đến tháng 11/2026.

## SDK ổn định cho môi trường sản xuất

| Gói / Dự án | Kho gói & Phiên bản | Ngôn ngữ / Môi trường | Mục đích sử dụng chính | Tài liệu |
| --- | --- | --- | --- | --- |
| `mezon-sdk` | npm `2.8.68` | TypeScript / JavaScript (**chỉ chạy trên Node.js**) | Bot Mezon đầy đủ tính năng (TLS TCP, bộ đệm SQLite, builder tương tác, MMN, Agent SSE) | [SDK Bot JS/TS](../bot-sdks/javascript/overview.md) |
| `Mezon.Net.Sdk` (+ 7 gói đi kèm) | NuGet `1.11.0` | C# / .NET (`netstandard2.1`, `net6.0`–`net10.0`) | Bot Mezon thông lượng cao, DI, `CommandService`, `InteractionRouter`, Redis L2 / SQLite L3, SFU, MMN | [SDK Bot .NET](../bot-sdks/dotnet/overview.md) |
| `mezon-light-sdk` | npm `1.0.10` | TypeScript / JavaScript (Trình duyệt & Node.js) | Client chat gọn nhẹ xác thực qua `AuthenticateIdToken` (phạm vi `external` 5 RPC) | [Light SDK](../channel-apps-and-widgets/light-sdk.md) |
| `mezon-chat-widget` | npm `1.1.4` | Web / React / Trình duyệt | Widget chat Mezon nhúng nhanh vào ứng dụng web bên thứ ba | [Chat Widget](../channel-apps-and-widgets/chat-widget.md) |
| `mmn-sdk` (`mmn-client-js`, `go-sdk`, `donet-sdk`) | npm / Go / .NET | JS/TS, Go, .NET | Ký giao dịch và gửi chứng minh ZK trực tiếp lên mạng Mezon Đồng (MMN) | [SDK MMN](../payments-and-mmn/mmn-sdks.md) |

:::caution `mezon-sdk` chỉ chạy trên Node.js
Dù các mô tả cũ trên npm có nhắc đến trình duyệt, `mezon-sdk` `2.8.68` phụ thuộc trực tiếp vào `node:tls` (cho TLS TCP rút gọn) và thư viện native `better-sqlite3` (cho bộ đệm tin nhắn cục bộ). Gói này không chạy được trên trình duyệt hay edge runtime không hỗ trợ native binding của Node.js. Để nhúng chat trên trình duyệt, hãy dùng `mezon-light-sdk` hoặc `mezon-chat-widget`.
:::

## SDK Thoại & Phòng họp SFU (tiền 1.0)

Máy chủ phòng họp Mezon (`mezon-sfu`) cung cấp giao thức báo hiệu và truyền media WebRTC riêng với 6 SDK theo ngôn ngữ. Tất cả đều đang ở giai đoạn tiền 1.0 và bám sát tiến trình phát triển giao thức:

| Kho mã nguồn / Gói | Phiên bản | Môi trường / Nền tảng | Ghi chú |
| --- | --- | --- | --- |
| `mezon-sfu-sdk-js` (`mezon-sfu-sdk`) | `0.0.0` (tiền 1.0) | TypeScript / Trình duyệt & Node.js (`>=20.19`) | WebRTC trình duyệt và báo hiệu/media trên Node.js |
| `mezon-sfu-sdk-go` | Tiền 1.0 (`go 1.25`) | Go (`pion/webrtc/v4`) | Bot thoại phía máy chủ, cầu nối và bộ ghi âm |
| `mezon-sfu-sdk-rust` | `0.1.0` | Rust (edition 2024, `webrtc-rs`) | Đường ống âm thanh/video native độ trễ thấp |
| `mezon-sfu-sdk-kotlin` | `0.1.0` (`ai.mezon`) | Kotlin (JVM & Android) | Ứng dụng phòng họp cho di động và JVM |
| `mezon-sfu-sdk-python` (`mezon-sfu-sdk`) | `0.1.0` | Python `>=3.11` (`aiortc`) | AI voice agent, bot chuyển lời nói thành văn bản, bộ ghi âm |
| `Mezon.Net.Sdk.Sfu` | NuGet `1.11.0` (API SFU tiền 1.0) | .NET (`netstandard2.1`, `net6.0`–`net10.0`, `SIPSorcery`) | Tích hợp trực tiếp với bot `Mezon.Net.Sdk` (Opus/VP8 RTP) |

Xem thêm [Tổng quan SDK Thoại SFU](../media-voice-and-streaming/voice-sfu/sdks-overview.md) và [Bắt đầu nhanh SFU](../media-voice-and-streaming/voice-sfu/quickstarts.mdx).

## SDK cũ & ngừng bảo trì

**Không** khởi tạo dự án mới bằng các gói dưới đây. Xem hướng dẫn chuyển đổi tại [SDK cũ & ngừng bảo trì](../bot-sdks/legacy-sdks.md).

| Gói / Kho mã | Trạng thái thực tế | Lý do không nên dùng | Giải pháp thay thế khuyến nghị |
| --- | --- | --- | --- |
| `mezon-go-sdk` | Đã lỗi thời (`v0.0.34`, module cũ `github.com/nccasia/mezon-go-sdk`) | Giao thức WebSocket/API cũ; thiếu TLS TCP rút gọn và danh sách API bot hiện đại | `mezon-sdk` (Node.js) hoặc `Mezon.Net.Sdk` (.NET) |
| `mezon-java-sdk` | Bản khung đã bỏ ngỏ | Chỉ là khung protobuf/client chưa hoàn thiện và không còn bảo trì | `mezon-sdk` hoặc `Mezon.Net.Sdk` |
| `mezon-mcp` (`mezon-mcp-server`) | Nguyên mẫu lỗi thời (ghim `mezon-sdk ^2.7.84`) | Gãy tương thích với tầng truyền tải và API của `mezon-sdk` `2.8.x` | Tự xây adapter MCP trên `mezon-sdk` `2.8.68` (xem [Tích hợp MCP](../ai-and-mcp/mcp-integration.md)) |
| `mezon-web-js` | Cầu nối iframe cũ (`1.0.0`) | Đã được thay thế bằng luồng truyền dữ liệu khởi chạy có chữ ký `?data=` cho ứng dụng trong kênh | [Ứng dụng trong kênh & xác minh dữ liệu](../channel-apps-and-widgets/channel-apps/verifying-launch-data.mdx) |

## Hướng dẫn chọn nhanh

- **Xây bot tiêu chuẩn bằng JS/TS?** → Cài đặt [`mezon-sdk` 2.8.68](../bot-sdks/javascript/quickstart.md).
- **Xây bot thông lượng cao, chạy DI hoặc đa phiên bản bằng C#?** → Cài đặt [`Mezon.Net.Sdk` 1.11.0](../bot-sdks/dotnet/quickstart.md).
- **Xây ứng dụng web mở trong kênh clan?** → Dùng HTTPS thuần + [xác minh HMAC dữ liệu khởi chạy](../channel-apps-and-widgets/channel-apps/verifying-launch-data.mdx) (không cần SDK).
- **Nhúng chat Mezon lên trang web của bạn?** → Dùng [`mezon-light-sdk` 1.0.10](../channel-apps-and-widgets/light-sdk.md) hoặc [`mezon-chat-widget` 1.1.4](../channel-apps-and-widgets/chat-widget.md).
- **Gửi thông báo một chiều?** → Dùng [Webhook](../webhooks/overview.mdx) (không cần SDK).
