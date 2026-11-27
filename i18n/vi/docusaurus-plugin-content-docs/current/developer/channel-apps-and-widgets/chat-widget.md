---
sidebar_position: 3
sidebar_label: Chat Widget
description: Nhúng Web Component mezon-chat tùy biến vào mọi trang web kèm proxy OAuth2 backend, giao diện chủ đề và điều khiển JavaScript.
---

# Mezon Chat Widget (`mezon-chat-widget`)

`mezon-chat-widget` (phiên bản `1.1.4`) cung cấp phần tử tùy chỉnh `<mezon-chat>` (Web Component không phụ thuộc framework) xây trên [`mezon-light-sdk`](./light-sdk.md). Khách truy cập bấm nút mở khung chat, đăng nhập bằng tài khoản Mezon qua cửa sổ popup OAuth2 đi qua backend của bạn, rồi trò chuyện trực tiếp với người dùng hoặc bot Mezon được chỉ định (`peer-id`).

## Cài đặt

Cài từ npm hoặc nhập trực tiếp vào bundle:

```bash
npm install mezon-chat-widget
```

```js
import "mezon-chat-widget";
```

## Nhúng thẻ `<mezon-chat>`

```html
<mezon-chat
  api-base-url="https://your-app.example.com"
  api-oauth-path="/api/auth/url"
  api-exchange-path="/api/auth/exchange"
  peer-id="SUPPORT_BOT_OR_USER_ID"
  theme="violet-core"
  position="bottom-right"
  save-session="true"
  welcome-message="Xin chào! Chúng tôi có thể hỗ trợ gì cho bạn?"
></mezon-chat>
```

## Quy ước backend proxy OAuth2

Vì luồng OAuth2 của Mezon cần `client_secret` (`client_secret_post`), widget ủy quyền việc tạo URL xác thực và đổi mã cho hai endpoint trên máy chủ của bạn (`api-base-url`):

1. **`GET {apiBaseUrl}/{apiOauthPath}`** (mặc định `api/auth/url`):
   Trả về `{ "url": "https://oauth2.mezon.ai/oauth2/auth?..." }` với `redirect_uri` trỏ về một trang trên miền của bạn cũng có nạp `mezon-chat-widget`.
2. **Tự động xử lý callback trên popup**:
   Khi Mezon chuyển hướng popup về kèm `?code=...&state=...`, `MezonChatElement.handleOAuthCallback()` tự chạy tại `DOMContentLoaded`, gửi `POST` `{ code, state }` tới **`POST {apiBaseUrl}/{apiExchangePath}`** (mặc định `api/auth/exchange`), gửi `MEZON_LOGIN_SUCCESS` về `window.opener` rồi đóng popup.
3. **`POST {apiBaseUrl}/{apiExchangePath}`**:
   Đổi `code` tại `https://oauth2.mezon.ai/oauth2/token`, lấy thông tin từ `/userinfo` (hoặc giải mã `id_token`), và trả về JSON theo cấu trúc `ExchangeResponse`:

```json
{
  "tokens": {
    "access_token": "ACCESS_TOKEN",
    "id_token": "OIDC_ID_TOKEN",
    "refresh_token": "REFRESH_TOKEN"
  },
  "user": {
    "user_id": "1234567890123456789",
    "username": "mai.nguyen",
    "name": "Mai Nguyen",
    "avatar": "https://example.com/avatar.png"
  }
}
```

Sau đó widget tự đổi `tokens.id_token` qua `LightClient.authenticate(...)` và mở kết nối nhắn tin thời gian thực.

:::tip Ánh xạ cấu trúc phản hồi backend tùy biến
Nếu backend của bạn trả về định dạng JSON bọc khác, hãy gán `MezonChatElement.exchangeCallBack = (raw) => ({ tokens, user })` (chạy trong popup) hoặc `MezonChatElement.oauthCallBack = (raw) => ({ tokens, user })` (chạy ở cửa sổ chính).
:::

## Thuộc tính HTML

| Thuộc tính | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|
| `api-base-url` | Có | — | URL gốc máy chủ proxy backend của bạn. |
| `api-oauth-path` | Không | `api/auth/url` | Đường dẫn trả về `{ url }`. |
| `api-exchange-path` | Không | `api/auth/exchange` | Đường dẫn đổi `{ code, state }`. |
| `peer-id` | Có | — | ID người dùng hoặc ID bot Mezon tiếp nhận cuộc trò chuyện. |
| `save-session` | Không | `false` | Đặt `"true"` để lưu và khôi phục phiên Light SDK trong bộ nhớ trình duyệt. |
| `auto-open` | Không | `false` | Đặt `"true"` để tự mở khung chat khi tải trang. |
| `welcome-message` | Không | — | Lời chào hiển thị trong khung chat. |
| `position` | Không | `bottom-right` | Góc neo: `bottom-right`, `bottom-left`, `top-right` hoặc `top-left`. |
| `theme` | Không | — | Tên chủ đề có sẵn hoặc mã màu hex bất kỳ (vd `#4F46E5`). |
| `custom-class` | Không | — | Lớp CSS bổ sung gắn lên khung widget. |
| `icon-chat` | Không | — | URL/SVG tùy chỉnh cho biểu tượng nút mở chat. |
| `icon-header` | Không | — | URL/SVG tùy chỉnh cho biểu tượng tiêu đề khung chat. |

## Chủ đề (Themes)

Truyền tên chủ đề dựng sẵn hoặc mã màu hex vào thuộc tính `theme`:

| Tên chủ đề | Màu chính | Bo góc |
|---|---|---|
| `warm-amber` | `#E08926` | `10px` |
| `pulse-red` | `#ed1b23` | `6px` |
| `astra` | `#464fb9` | `4px` |
| `violet-core` | `#6C5DB8` | `8px` |
| `clear-sky` | `#25AAE1` | `8px` |
| `deep-teal` | `#004037` | `8px` |

Khi truyền mã hex như `theme="#2563EB"`, widget tự tính màu hover tương phản. Bạn cũng có thể đăng ký chủ đề tùy biến qua `ThemeRegistry.register({ name, tokens })`.

## Phương thức JavaScript

Truy vấn phần tử `<mezon-chat>` để điều khiển widget từ mã ứng dụng:

```js
const widget = document.querySelector("mezon-chat");

widget.open();
await widget.startDM("ANOTHER_PEER_ID");
widget.sendMessage("Tôi có câu hỏi về đơn hàng #42.");
widget.close();
widget.logout();
```

## Liên quan

- [Mezon Light SDK](./light-sdk.md)
- [Luồng Authorization Code OAuth2](../oauth2/authorization-code-flow.mdx)
- [Tổng quan Channel App](./channel-apps/overview.md)
