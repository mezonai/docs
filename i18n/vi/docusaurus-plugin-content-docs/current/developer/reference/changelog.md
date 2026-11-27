---
sidebar_position: 3
sidebar_label: Nhật ký thay đổi
description: Phiên bản hiện tại của các gói và các mốc phát hành đáng chú ý của nền tảng, SDK, giao thức media và MCP trong hệ sinh thái Mezon.
---

# Nhật ký thay đổi Nền tảng & SDK

Trang này theo dõi các phiên bản đã kiểm chứng hiện hành cùng những thay đổi đáng chú ý dành cho nhà phát triển trên toàn bộ bộ SDK, giao thức media và API của Mezon.

## Ảnh chụp phiên bản hệ sinh thái hiện tại (Tháng 11/2026)

| Thành phần | Gói / Artifact | Phiên bản hiện tại | Trạng thái |
|---|---|---|---|
| **JavaScript / TypeScript Bot SDK** | `mezon-sdk` (npm) | `2.8.68` | Ổn định |
| **.NET Bot SDK & MMN** | `Mezon.Net.Sdk`, `Mezon.Net.Mmn` (NuGet) | `1.11.0` | Ổn định |
| **Light External Chat SDK** | `mezon-light-sdk` (npm) | `1.0.10` | Ổn định |
| **Chat Widget nhúng web** | `mezon-chat-widget` (npm) | `1.1.4` | Ổn định |
| **Voice SFU SDKs (6 ngôn ngữ)** | `mezon-sfu-sdk` (TS `0.0.0`, PyPI `0.1.0`), `mezon-sfu-sdk-go`, `mezon-sfu` (Rust `0.1.0`), `ai.mezon:mezon-sfu` (Kotlin `0.1.0`), `Mezon.Net.Sdk.Sfu` (NuGet `1.11.0`) | Pre-1.0 | Pre-1.0 |
| **Các MMN SDK độc lập** | `mmn-client-js` (`1.0.16`, npm), `github.com/mezonai/mmn-sdk/go-sdk` (`v1.1.0`), `Mezon.Net.Mmn` (`1.11.0`, NuGet) | `1.0.16` / `v1.1.0` / `1.11.0` | Ổn định |
| **Giao thức Streaming Server** | `mezon-streaming-server` (`spec.md`) | `0.9.1` | Đang vận hành |
| **Mezon Desktop In-App MCP** | `mezon mcp` (`mezon-desktop/crates/mezon-mcp`) | 123 công cụ (59 đọc / 64 ghi) | Đang vận hành |

---

## Các mốc phát hành đáng chú ý

### Tháng 11/2026

- **Giao thức Streaming Server `0.9.1` (23/11/2026):** Khi người phát WHIP tạm ngắt âm thanh trong khi video vẫn tiếp tục, origin tự chèn khung Opus im lặng 20 ms sau 0,5 giây để phân đoạn CMAF HLS giữ đúng đồng bộ hình-tiếng khi âm thanh trở lại.
- **Giao thức Streaming Server `0.9.0` (18/11/2026):** Bổ sung đích tải lên `cdn.target: r2` cho Cloudflare R2 kèm tự thử lại khi gặp HTTP `429` và `5xx`, đồng thời hiển thị trường `"storage"` trên `/stats`.
- **`mezon-sdk` `2.8.68`:**
  - Nâng cấp phụ thuộc `mmn-client-js` lên `^1.0.16`.
  - Bổ sung `getStreamPlayback`, `generateCDNSignature`, `generateMeetToken`, `createPoll` / `getPoll` / `closePoll`, `onFriendStateUpdated`, `Events.ChannelArchive` và các hook SSE vòng đời AI agent (`connectMezonAgentSSE`, `onAIAgentSessionStarted`, `onAIAgentSessionEnded`, `onAIAgentSessionSummaryDone`).
  - Bổ sung cơ chế truy vấn endpoint khỏe mạnh từ gateway khi socket kết nối lại.
- **`Mezon.Net.Sdk` `1.11.0`:**
  - Bổ sung `InteractionRouter` với mức tin cậy `InteractionActorTrust` tường minh (`ClientSupplied` so với `ServerAuthenticated`) và bộ lọc `.RequireServerAuthenticatedActor()`.
  - Bổ sung `MessageContentBuilder`, `MessageEmbedBuilder` có kiểu mạnh và `AgentSseManager` (`ConnectAgentSseAsync`).
  - Bổ sung khóa tuần tự an toàn luồng `_mmnTransferGate` cho quy trình lấy pending nonce và ký giao dịch MMN.
  - Đánh dấu `[Obsolete]` cho các phương thức API bị chặn với bot (`ListClanUsersAsync`, `ListChannelMessagesAsync`, `ListRoleUsersAsync`, `ListQuickMenuAccessAsync`, `UploadAttachmentFileAsync`).
  - Bổ sung hỗ trợ decoupled media pools (`media_pool_version: 1`) trong `Mezon.Net.Sdk.Sfu`.
- **Bộ 6 Voice SFU SDK (Pre-1.0):** Hoàn thiện kiểm thử tương thích chéo với `mezon-sfu` trên TypeScript, Go, Rust, Kotlin (JVM + Android), Python và .NET ở cả chế độ dynamic và fixed-slot.
- **Mezon Desktop In-App MCP:** Ra mắt `mezon mcp start|status|stop|tools|call|stdio` kèm chế độ lọc `--read-only` và 123 công cụ chuẩn qua Streamable HTTP cục bộ (`/mcp`) và `stdio`.
- **Đồng nhất Channel App trên di động:** Xác nhận cả ba nền tảng Web, Android và iOS đều gọi `GenerateHashChannelApps` và truyền `?data=<webAppData>` đã ký khi khởi chạy ứng dụng.

### Tháng 10/2026

- **Giao thức Streaming Server `0.8.0` (30/10/2026):** Hoàn tất kiến trúc đẩy CMAF HLS lên kho lưu trữ — node origin tải thẳng playlist và phân đoạn fMP4 lên bucket S3/R2 sau CDN thay vì tự phục vụ HLS; ngừng các đường dẫn HLS cũ trên node và khóa `X-Mezon-Cdn-Key`.
- **Giao thức Realtime Envelope `104`–`107`:** Chuẩn hóa `StreamingWatch` (`104`), `SfuBreakoutRoomEvent` (`105`), `StreamingViewerCountEvent` (`106`) và `FriendStateUpdated` (`107`). Trạng thái kênh stream chuyển sang cấu trúc Valkey đơn khóa an toàn cluster (`strm:live`, `strm:<channel_id>`).

## Liên quan

- [Ma trận hệ sinh thái SDK](../getting-started/sdk-ecosystem-matrix.md)
- [Tham chiếu sự kiện](./events-reference.md)
- [Mã lỗi & xử lý sự cố](./error-codes-and-troubleshooting.md)
