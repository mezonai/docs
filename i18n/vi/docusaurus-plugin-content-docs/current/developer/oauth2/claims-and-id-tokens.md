---
sidebar_position: 2
sidebar_label: Claims và ID Token
description: Xác minh ID Token RS256 của Mezon bằng JWKS, phân biệt user_id và mezon_id, gọi /userinfo và nối đăng nhập sang mezon-light-sdk.
---

# Claims và ID Token

Khi ứng dụng yêu cầu scope `openid` trong [luồng Authorization Code](./authorization-code-flow.mdx), Mezon trả về một JWT `id_token` ký bằng RS256 và cung cấp các trường hồ sơ tương ứng qua endpoint `/userinfo`.

## Xác minh `id_token` bằng JWKS

Luôn kiểm tra chữ ký JWT và các claim trước khi tin cậy `id_token` nhận từ bất kỳ nguồn không đáng tin nào:

- **Thuật toán:** `RS256` (từ chối `none` và các thuật toán khác).
- **JWKS URI:** `https://oauth2.mezon.ai/.well-known/jwks.json` (nên cache khóa và làm mới khi gặp `kid` lạ).
- **Issuer (`iss`):** `https://oauth2.mezon.ai` (đối chiếu với `/.well-known/openid-configuration`).
- **Audience (`aud`):** Phải khớp `YOUR_CLIENT_ID`.
- **Hạn dùng (`exp`):** Phải còn hiệu lực.

### Ví dụ xác minh (Node.js với `jose`)

```js
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(
  new URL("https://oauth2.mezon.ai/.well-known/jwks.json"),
);

export async function verifyMezonIdToken(idToken) {
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: "https://oauth2.mezon.ai",
    audience: process.env.MEZON_CLIENT_ID,
    algorithms: ["RS256"],
  });
  return payload;
}
```

### Ví dụ xác minh (Python với `PyJWT`)

```python
import os
import jwt
from jwt import PyJWKClient

jwks_client = PyJWKClient("https://oauth2.mezon.ai/.well-known/jwks.json")


def verify_mezon_id_token(id_token: str) -> dict:
    signing_key = jwks_client.get_signing_key_from_jwt(id_token)
    return jwt.decode(
        id_token,
        signing_key.key,
        algorithms=["RS256"],
        audience=os.environ["MEZON_CLIENT_ID"],
        issuer="https://oauth2.mezon.ai",
    )
```

## Đọc thông tin từ `/userinfo`

Ngoài việc giải mã `id_token`, backend của bạn có thể gọi `/userinfo` bằng `access_token` nhận được từ `/oauth2/token`:

```bash
curl -H "Authorization: Bearer ACCESS_TOKEN" https://oauth2.mezon.ai/userinfo
```

## Danh sách các claim người dùng

Cả `id_token` đã xác minh và `/userinfo` đều trả về các claim sau (khi tài khoản có giá trị):

| Claim | Kiểu | Mô tả |
|---|---|---|
| `user_id` | string | **ID người dùng Mezon chuẩn** (Snowflake 64-bit, tối đa 19 chữ số). Đồng nhất với ID mà bot, webhook, channel app và `mezon-light-sdk` nhìn thấy. **Luôn lưu dạng chuỗi và dùng làm khóa định danh chính.** |
| `mezon_id` | string | Mã định danh mờ từ dịch vụ đăng nhập Mezon. **Không phải** user ID của Mezon — không truyền `mezon_id` vào bot API, webhook hay `LightClient.authenticate`. |
| `username` | string | Tên đăng nhập duy nhất của người dùng. |
| `display_name` | string | Tên hiển thị của người dùng. |
| `avatar` | string | URL ảnh đại diện. |
| `email` | string | Địa chỉ email (nếu có). |

:::warning Phân biệt `user_id` và `mezon_id`
Luôn liên kết bản ghi cơ sở dữ liệu và lời gọi Mezon API theo `user_id` (lưu dạng chuỗi hoặc int64), **không bao giờ** dùng `mezon_id`. `mezon_id` là định danh nội bộ của dịch vụ đăng nhập và không khớp với Snowflake ID của người dùng trên Mezon.
:::

## Kết nối `id_token` với `mezon-light-sdk`

Sau khi backend đổi mã OAuth2 và lấy được `id_token`, `user_id`, `username`, bạn có thể đưa người dùng thẳng vào phiên chat DM/nhóm thời gian thực qua [`mezon-light-sdk`](../channel-apps-and-widgets/light-sdk.md):

```ts
import { LightClient } from "mezon-light-sdk";

const lightClient = await LightClient.authenticate({
  id_token: tokens.id_token,
  user_id: claims.user_id,
  username: claims.username,
});
```

`mezon-gw` (`AuthenticateIdToken`) xác minh `id_token`, đối chiếu `claims.user_id === user_id`, và cấp phiên `external` giới hạn trong danh sách 5 RPC được phép. Đây chính là cơ chế hoạt động của [`mezon-chat-widget`](../channel-apps-and-widgets/chat-widget.md).

## Liên quan

- [Luồng Authorization Code](./authorization-code-flow.mdx)
- [Mezon Light SDK](../channel-apps-and-widgets/light-sdk.md)
- [Mezon Chat Widget](../channel-apps-and-widgets/chat-widget.md)
