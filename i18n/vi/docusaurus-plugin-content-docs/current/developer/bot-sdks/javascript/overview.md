---
sidebar_label: Tổng quan
sidebar_position: 1
description: Tổng quan về mezon-sdk 2.8.68, SDK JavaScript và TypeScript chính thức trên Node.js để xây dựng bot Mezon.
---

# SDK bot JavaScript & TypeScript (`mezon-sdk`)

`mezon-sdk` là SDK TypeScript/JavaScript chính thức để xây dựng bot Mezon trên Node.js. Thư viện cung cấp `MezonClient` hướng sự kiện chạy qua TLS TCP rút gọn, tự động chuyển dự phòng qua gateway, bộ đệm thực thể kết hợp SQLite cục bộ, bộ dựng tin nhắn tương tác, chuyển Mezon Đồng (MMN) và hỗ trợ AI Agent SSE.

Tài liệu này mô tả **`mezon-sdk` `2.8.68`** (phát hành song song bản CommonJS và ESM trên npm).

:::danger Chỉ chạy trên Node.js — không tương thích trình duyệt
Khác với các mô tả cũ trước đây, `mezon-sdk` `2.8.68` bắt buộc chạy trên **Node.js** và không chạy được trong trình duyệt hay các edge runtime không hỗ trợ native module:

- Tầng truyền tải dùng mô-đun `node:tls` của Node.js cho giao thức TLS TCP rút gọn (`0xEF`).
- Bộ đệm tin nhắn cục bộ dùng thư viện native `better-sqlite3` (`./mezon-cache/mezon-messages-cache.db`).

Nếu bạn muốn tích hợp chat trên trình duyệt, hãy dùng [`mezon-light-sdk`](../../channel-apps-and-widgets/light-sdk.md) hoặc [`mezon-chat-widget`](../../channel-apps-and-widgets/chat-widget.md).
:::

## Tính năng chính

- **Tầng truyền tải TLS TCP rút gọn**: Kết nối trực tiếp tới `tcp_url` do `gw.mezon.ai` cấp, tự động kết nối lại theo hàm mũ (`5s` → `60s`) và chuyển dự phòng qua `getHealthyEndpoint`.
- **Tự động gia hạn phiên**: Làm mới JWT truy cập 1 giờ trước hạn 30 giây (`ensureValidSession`) trước mỗi lời gọi API và khi kết nối lại.
- **30 phương thức đăng ký sự kiện có kiểu**: Các hàm `client.on*()` bao phủ tin nhắn, biểu cảm, kênh, clan, vai trò, nút bấm, danh sách chọn, thoại/phát trực tiếp, bạn bè, quick menu và phiên AI Agent SSE.
- **Bộ đệm tin nhắn hai tầng + hàng đợi điều tiết**: `CacheManager` trên RAM kết hợp SQLite cục bộ (`messages_v2`), kèm `AsyncThrottleQueue` giới hạn **80 tin nhắn/giây** và kiểm tra giới hạn **4.000 ký tự** JSON trước khi gửi.
- **Bộ dựng tin nhắn tương tác**: `InteractiveBuilder` và `ButtonBuilder` hỗ trợ thẻ embed, ô nhập, danh sách chọn, nút radio, chọn ngày, hiệu ứng và hàng nút bấm.
- **Mezon Đồng & AI Agent SSE**: Tích hợp sẵn `mmn-client-js` (`1.0.16`) cùng bước khởi tạo chứng minh ZK khi đăng nhập, và hàm `connectMezonAgentSSE()`.

## Cấu hình mặc định (`ClientConfigDto`)

| Tùy chọn | Kiểu | Mặc định | Mô tả |
| --- | --- | --- | --- |
| `botId` | `string` | *(bắt buộc)* | ID Bot Snowflake 64-bit lấy từ Developer Portal (luôn truyền dạng `string`) |
| `token` | `string` | *(bắt buộc)* | Token Bot 16 ký tự lấy từ Developer Portal |
| `host` | `string` | `'gw.mezon.ai'` | Tên miền Gateway dùng cho `AuthenticateApp` ban đầu và tra cứu dự phòng |
| `port` | `string` | `'443'` | Cổng Gateway |
| `useSSL` | `boolean` | `true` | Dùng HTTPS (`true`) hoặc HTTP (`false`) khi gọi Gateway |
| `timeout` | `number` | `7000` | Thời gian chờ tối đa cho mỗi yêu cầu (mili giây) |
| `mmnApiUrl` | `string` | `'https://dong.mezon.ai/mmn-api/'` | URL gốc API Mạng Mezon Đồng (MMN) |
| `zkApiUrl` | `string` | `'https://dong.mezon.ai/zk-api/'` | URL dịch vụ tạo chứng minh ZK cho giao dịch MMN |
| `agentEventUrl` | `string` | *(tùy chọn)* | URL gốc dịch vụ AI Agent SSE của bạn (ví dụ `'https://your-agent-endpoint.example.com/'`); chỉ kết nối khi bạn gọi `connectMezonAgentSSE()` |

## Trong mục này

- [Bắt đầu nhanh](./quickstart.md) — cài `mezon-sdk` `2.8.68` và chạy bot `!ping` đầu tiên.
- [Vòng đời client & bộ đệm](./client-and-caches.md) — quy trình đăng nhập, `CacheManager`, lưu trữ SQLite, điều tiết gửi và phục hồi kết nối.
- [Hướng dẫn & mẫu công thức](./guides-and-recipes.md) — mã nguồn mẫu định dạng tin nhắn, trả lời, tin tạm thời, thẻ tương tác, bình chọn, vai trò, phát trực tiếp và MMN.
- [Tham chiếu API](./api-reference.md) — danh mục đầy đủ phương thức `MezonClient`, tất cả 30 sự kiện `on*`, lớp thực thể và builder.
