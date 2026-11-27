---
sidebar_label: SDK cũ & ngừng bảo trì
sidebar_position: 3
description: Trạng thái và lộ trình chuyển đổi cho các kho mã cũ hoặc ngừng bảo trì của Mezon gồm mezon-go-sdk, mezon-java-sdk, mezon-mcp và mezon-web-js.
---

# SDK cũ & ngừng bảo trì

Một số kho mã nguồn Mezon cũ hơn vẫn tồn tại trên GitHub hoặc kho gói từ các phiên bản nền tảng trước đây. **Không khởi tạo tích hợp mới trên các gói này** — chúng thiếu hỗ trợ cho tầng truyền tải TLS TCP rút gọn (`0xEF`), chuyển dự phòng gateway hoặc danh sách API bot hiện hành.

## Tổng hợp & giải pháp thay thế

| Kho mã nguồn / Gói | Trạng thái hiện tại | Hạn chế chính | Giải pháp thay thế khuyến nghị |
| --- | --- | --- | --- |
| `mezon-go-sdk` (`v0.0.34`) | **Lỗi thời / Ngừng bảo trì** | Module cũ `github.com/nccasia/mezon-go-sdk`; dùng giao thức WebSocket/API cũ; thiếu khung TLS TCP rút gọn, chuyển dự phòng `getHealthyEndpoint`, bình chọn và cấp quyền phát trực tiếp | [`mezon-sdk` 2.8.68](./javascript/overview.md) (Node.js) hoặc [`Mezon.Net.Sdk` 1.11.0](./dotnet/overview.md) (.NET). Riêng cho media **thoại SFU** bằng Go, dùng [`mezon-sfu-sdk-go`](../media-voice-and-streaming/voice-sfu/sdks-overview.md). |
| `mezon-java-sdk` | **Bản khung bị bỏ ngỏ** | Chỉ là khung Gradle/protobuf dở dang; chưa từng đạt mức hỗ trợ bot sản xuất | [`mezon-sdk` 2.8.68](./javascript/overview.md) hoặc [`Mezon.Net.Sdk` 1.11.0](./dotnet/overview.md). Riêng cho media **thoại SFU** trên JVM/Android, dùng `mezon-sfu-sdk-kotlin`. |
| `mezon-mcp` (`mezon-mcp-server`) | **Nguyên mẫu lỗi thời** | Ghim `mezon-sdk ^2.7.84`; không tương thích với tầng truyền tải, vòng đời phiên và API của `mezon-sdk` `2.8.x` | Xây máy chủ công cụ MCP trực tiếp trên `mezon-sdk` `2.8.68` — xem [Tích hợp MCP](../ai-and-mcp/mcp-integration.md). |
| `mezon-web-js` (`1.0.0`) | **Cầu nối cũ đã thay thế** | Cầu nối `postMessage` iframe đời đầu cho mini-app, đã được thay bằng tải dữ liệu khởi chạy qua URL có chữ ký | Dùng Ứng dụng trong kênh HTTPS tiêu chuẩn với bước xác minh chữ ký HMAC của `?data=` trên máy chủ — xem [Tổng quan ứng dụng trong kênh](../channel-apps-and-widgets/channel-apps/overview.md) và [Xác minh dữ liệu khởi chạy](../channel-apps-and-widgets/channel-apps/verifying-launch-data.mdx). |

## Danh sách kiểm tra khi chuyển đổi

1. **Chuyển từ `mezon-go-sdk` hoặc `mezon-java-sdk`**:
   - Giữ nguyên **ID Bot** và **Token** hiện có trên Developer Portal — thông tin xác thực thuộc cấp giao thức và dùng chung giữa mọi SDK.
   - Rà soát mọi lời gọi `ListClanUsers`, `ListChannelMessages`, `ListRoleUsers` hoặc `UploadAttachmentFile`: `mezon-proto-server` hiện tại từ chối chúng với `403 Permission denied` đối với token bot (xem [Phân quyền & truy cập API](../core-concepts/permissions-and-api-access.md)).
   - Thay thế việc đọc ngược lịch sử bằng cách cập nhật trạng thái theo sự kiện kết hợp lưu trữ SQLite cục bộ (bộ đệm tích hợp của `mezon-sdk` hoặc `Mezon.Net.Sdk.Caching.Sqlite`).
2. **Chuyển từ `mezon-mcp`**:
   - Nâng cấp lên `mezon-sdk@2.8.68` và chỉ mở các năng lực nằm trong danh sách API cho phép bot dưới dạng công cụ MCP (gửi tin nhắn, phản hồi tạm thời, bình chọn, tra cứu kênh, liệt kê vai trò).
3. **Chuyển từ `mezon-web-js`**:
   - Gỡ bỏ gói webpack cầu nối mini-app khỏi giao diện frontend.
   - Đọc tham số truy vấn `?data=` tại đường dẫn khởi chạy ứng dụng kênh và kiểm tra chữ ký HMAC trên backend bằng App Token 16 ký tự.

## Liên quan

- [Ma trận hệ sinh thái SDK](../getting-started/sdk-ecosystem-matrix.md) — bảng so sánh đầy đủ giữa SDK đang hoạt động và SDK cũ.
- [Nhật ký thay đổi](../reference/changelog.md) — lịch sử các cột mốc nền tảng và SDK.
