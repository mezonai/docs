---
sidebar_position: 2
sidebar_label: Mã lỗi & xử lý sự cố
description: Chẩn đoán mã lỗi Mezon API/socket, mất độ chính xác Snowflake BigInt, lỗi build better-sqlite3, sai HMAC Channel App, lỗi 403 allowlist và sự cố WHIP SDP.
---

# Mã lỗi & xử lý sự cố

Tài liệu này tổng hợp các mã lỗi và vướng mắc phổ biến nhất khi phát triển bot, Channel App, webhook, Voice SFU và phát sóng WHIP trên Mezon — kèm nguyên nhân gốc đã kiểm chứng trong mã nguồn và cách khắc phục chính xác.

## Mã lỗi API & tầng truyền tải cốt lõi

| Mã / Trạng thái | Mã gRPC / `mezon-api` | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|---|
| `400` | `InvalidArgument` | Thiếu/sai tham số, `expire_hours` ngoài `1..168`, số đáp án bình chọn ngoài `2..20`, `action_msg` rỗng hoặc `> 512` byte, gọi `GenerateMeetToken` cho kênh không phải thoại (`type != 10`), gọi `GetStreamPlayback` cho kênh không phải stream (`type != 6`), URL ảnh/tệp đính kèm không hợp lệ. | Kiểm tra dữ liệu đầu vào theo đặc tả endpoint trước khi gửi lại. |
| `401` | `Unauthenticated` | JWT phiên hết hạn hoặc sai; **hoặc** phiên `external` (`mezon-light-sdk`) / bot gọi RPC nằm ngoài allowlist của `mezon-api`. | Làm mới/đăng nhập lại phiên (`ensureValidSession()` / `refreshSession()`), hoặc kiểm tra RPC có nằm trong danh sách cho phép không. |
| `403` | `PermissionDenied` | Bot không thuộc clan/kênh, thiếu quyền `Manage Channel` / `Manage Clan`, gọi RPC bị chặn trên `mezon-proto-server`, đóng bình chọn của người khác, hoặc gọi `UpdateQuickMenuAccess` bằng tài khoản bot. | Mời bot vào clan/kênh, cấp đủ quyền hoặc đối chiếu [danh sách API cho phép của bot](../core-concepts/permissions-and-api-access.md). |
| `404` | `NotFound` | Kênh, bình chọn, webhook hoặc tài nguyên WHIP `/resource/<id>` không tồn tại hoặc đã kết thúc. | Lấy lại ID thực thể hoặc khởi tạo phiên WHIP mới. |
| `429` / `Aborted` | `Aborted` | Chạm giới hạn tần suất (rate limiter) theo người dùng trên máy chủ (`limiter.Limit`). | Giảm tốc độ gửi với backoff; `Mezon.Net.Sdk` và `mezon-sdk` đã có hàng đợi gửi sẵn. |
| `500` / `503` | `Internal` / `Unavailable` | Lỗi tạm thời từ cơ sở dữ liệu, cache, DTLS hoặc quá tải/đang drain (ví dụ node streaming trả `503` kèm `Retry-After`). | Thử lại theo exponential backoff có jitter và tuân thủ `Retry-After`. |

---

## Các sự cố tích hợp thường gặp & cách khắc phục

### 1. Mất độ chính xác Snowflake ID 64-bit trong JavaScript (`2^53 - 1`)

**Hiện tượng:** 2–3 chữ số cuối của `user_id`, `channel_id` hoặc `message_id` (19 chữ số) bị đổi (thường thành `00`), dẫn đến lỗi `NotFound` hoặc khớp sai người dùng.

**Nguyên nhân:** ID Mezon là số nguyên 64-bit (`int64`). Kiểu `Number` của JavaScript chỉ chính xác tới `9.007.199.254.740.991` (`Number.MAX_SAFE_INTEGER`). Gọi `JSON.parse()` trên chuỗi JSON có ID dạng số — như trường `user` trong `WebAppData` của Channel App — sẽ âm thầm làm tròn giá trị.

**Cách khắc phục:**
- Luôn lưu và truyền ID Mezon ở dạng **chuỗi (`string`)** trong JS/TS (và `int64` / `long` trong Go, C#, Rust, Kotlin, Python).
- Khi phân tích JSON `user` của Channel App trên Node.js, trích `"id"` bằng regex hoặc bộ parser hỗ trợ BigInt trước khi dùng `JSON.parse()` (xem [Xác minh dữ liệu khởi chạy](../channel-apps-and-widgets/channel-apps/verifying-launch-data.mdx)).

---

### 2. Lỗi biên dịch native `better-sqlite3` trên Node.js 22 / 24

**Hiện tượng:** `npm install mezon-sdk` thất bại tại bước `node-gyp rebuild` với lỗi thiếu Python, trình biên dịch C++ hoặc không tải được prebuild trên Node 22 / Node 24.

**Nguyên nhân:** `mezon-sdk` `2.8.68` phụ thuộc `better-sqlite3` (`^11.10.0`) là addon C++ dùng cho bộ nhớ đệm tin nhắn cục bộ. Khi chưa có bản dựng sẵn cho đúng tổ hợp Node ABI + hệ điều hành/CPU, npm phải biên dịch từ mã nguồn.

**Cách khắc phục:**
- Ưu tiên dùng **Node.js 20 LTS** hoặc bản Node 22 đã có prebuild cho `better-sqlite3`.
- Nếu cần biên dịch từ mã nguồn, cài đủ bộ công cụ build:
  - **Linux (Debian/Ubuntu):** `sudo apt-get install -y build-essential python3`
  - **macOS:** `xcode-select --install`
  - **Windows:** Visual Studio Build Tools kèm gói "Desktop development with C++" + Python 3.

---

### 3. Chữ ký HMAC `WebAppData` của Channel App không bao giờ khớp

**Hiện tượng:** Endpoint `checkMezonData` phía backend luôn trả `401` dù mở trực tiếp từ Mezon.

**Danh sách kiểm tra:**
1. **Giải mã URL hai lần:** `URLSearchParams.get("data")` đã giải mã một lần. Gọi thêm `decodeURIComponent(data)` sẽ làm biến đổi chuỗi `%7B` / `%3D` trong `user` và `signature`, làm sai HMAC.
2. **Định dạng MD5:** `secret` là **chuỗi 32 ký tự hex chữ thường** của `md5(appToken)`, KHÔNG phải 16 byte nhị phân thô.
3. **Thứ tự tham số:** Băm nguyên vẹn chuỗi con đứng trước `&hash=` — **không** phân tách, sắp xếp lại khóa hay mã hóa lại.
4. **Token cũ:** Đối chiếu `MEZON_APP_TOKEN` với **Token** hiện tại trên cổng nhà phát triển.
5. **Lệch đồng hồ / `auth_date`:** Đảm bảo máy chủ đã đồng bộ NTP nếu ngưỡng `maxAgeSeconds` từ chối yêu cầu mới.

---

### 4. Lỗi `403 Permission denied` khi bot gọi API

**Hiện tượng:** Gọi `ListChannelMessages`, `ListClanUsers`, `ListRoleUsers`, `ListQuickMenuAccess`, `UploadAttachmentFile`, `VotePoll` hoặc `UpdateQuickMenuAccess` thất bại với `403 Permission denied` (hoặc `Unauthenticated`).

**Nguyên nhân & khắc phục:**
- Bot chỉ được gọi các RPC nằm trong [danh sách cho phép của bot](../core-concepts/permissions-and-api-access.md).
- Để gửi ảnh từ bot, tải ảnh lên một URL HTTPS công khai và truyền `{ url, filename, filetype, width, height }` vào `attachments` thay vì gọi `UploadAttachmentFile`.
- Để cập nhật mục Quick Menu từ bot, hãy **xóa rồi thêm mới** — `UpdateQuickMenuAccess` từ chối cứng phiên bot bằng `PermissionDenied` (`api_quick_menu.go`).
- Để tra cứu tin nhắn, hãy lưu các tin nhắn mới khi nhận qua `onChannelMessage` (hoặc dùng [Mezon Desktop MCP](../ai-and-mcp/mcp-integration.md) cho nhu cầu đọc lịch sử bằng phiên người dùng cá nhân).

---

### 5. Tin nhắn vượt quá 4.000 byte hoặc body webhook vượt 4 MiB

**Hiện tượng:** Tin nhắn từ Channel Webhook Mezon gốc bị thay bằng `"The original message was too long"`, hoặc yêu cầu HTTP lớn bị từ chối ở tầng truyền tải.

**Nguyên nhân & khắc phục:**
- `mezon-api` giới hạn `MaxRequestBodySize = 4 MiB` cho mỗi yêu cầu HTTP.
- Channel Webhook định dạng Mezon gốc giới hạn JSON `{ "t": ..., "mk": ... }` ở **4.000 byte** (chữ tiếng Việt có dấu chiếm 2–3 byte UTF-8 mỗi ký tự). Hãy chia nhỏ thành nhiều tin nhắn hoặc đính kèm liên kết tới báo cáo ngoài.

---

### 6. Lỗi phát sóng WHIP (`400`, `406`, `409`, `404` khi gọi `PATCH`)

| Hiện tượng | Nguyên nhân & cách khắc phục |
|---|---|
| `400` tại `POST /whip/<ch>` | Client gửi `a=setup:passive` (node luôn là DTLS passive — client bắt buộc đề xuất `actpass` hoặc `active`; thêm `-whip_flags dtls_active` với `ffmpeg`), thiếu ICE/fingerprint SHA-256 hoặc tên kênh không hợp lệ. |
| `404` khi gọi `PATCH` | `mezon-streaming-server` chạy ICE-lite và **không** hỗ trợ trickle ICE. Gửi trọn vẹn offer trong `POST` ban đầu. |
| `406 Not Acceptable` | Offer không có Opus `48000` hoặc codec video của node (`H264/90000` với `packetization-mode=1`, `profile-level-id=42e01f`, hoặc `VP8/90000`). |
| `409 Conflict` | Đang có `sub` khác phát trên kênh đó. Mỗi kênh chỉ cho phép một người phát; kết nối lại bằng **cùng `sub`** sẽ tự thay thế phiên cũ. |
| Video HLS bị đứng hình hoặc không phát được | Thiếu **SPS/PPS nội luồng (in-band)** trước khung IDR (`sprop-parameter-sets` bị bỏ qua), bật B-frame (cần `-bf 0`), hoặc encoder bỏ qua PLI mà không đặt GOP cố định 2 giây. |

---

### 7. Shadow Bot không gửi được token MMN

**Hiện tượng:** `sendToken` / `SendTransferAsync` báo lỗi `ZkProofs` / `MMN account is not initialized`.

**Nguyên nhân:** `mezon-gw` không cấp `id_token` cho Shadow Bot (`isShadow == true`). Hãy dùng bot tiêu chuẩn cho các chức năng chuyển Mezon Dong.

---

### 8. Voice SFU ngắt kết nối với mã `4012` hoặc lỗi ICE trên `127.0.0.1`

- **Mã đóng `4012` (`duplicate_session`):** Mỗi user ID Mezon chỉ được giữ **một** phiên SFU duy nhất trên toàn hệ thống. Kiểm tra xem có tiến trình bot thứ hai hoặc tab trình duyệt khác đang đăng nhập cùng tài khoản không.
- **Mã đóng `4004` / `4005`:** Meet token hết hạn hoặc bị từ chối. Truyền callback `TokenProvider` động gọi `GenerateMeetToken` thay vì chuỗi token cố định.
- **SFU cục bộ trên `127.0.0.1` lỗi ICE:** Cấu hình tường minh địa chỉ bind loopback trong Rust, Kotlin JVM, Python hoặc .NET (xem [Tổng quan SFU SDK](../media-voice-and-streaming/voice-sfu/sdks-overview.md#lưu-ý-tương-thích-với-mezon-sfu)).

## Liên quan

- [Quyền hạn và phạm vi truy cập API](../core-concepts/permissions-and-api-access.md)
- [Xác minh dữ liệu khởi chạy](../channel-apps-and-widgets/channel-apps/verifying-launch-data.mdx)
- [Phát luồng với WHIP](../media-voice-and-streaming/stream-channels/publishing-with-whip.mdx)
