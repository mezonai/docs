---
sidebar_position: 2
sidebar_label: Claims and ID tokens
description: Verify RS256 Mezon ID tokens with JWKS, understand user_id vs mezon_id, query /userinfo, and bridge logins to mezon-light-sdk.
---

# Claims and ID tokens

When your app requests the `openid` scope in the [authorization code flow](./authorization-code-flow.mdx), Mezon returns a signed RS256 `id_token` JWT and exposes the same profile fields through the `/userinfo` endpoint.

## Verifying `id_token` with JWKS

Always verify the JWT signature and claims before trusting an `id_token` received from any untrusted channel:

- **Algorithm:** `RS256` (reject `none` and unexpected algorithms).
- **JWKS URI:** `https://oauth2.mezon.ai/.well-known/jwks.json` (cache keys and refresh on unknown `kid`).
- **Issuer (`iss`):** `https://oauth2.mezon.ai` (confirm against `/.well-known/openid-configuration`).
- **Audience (`aud`):** Must match `YOUR_CLIENT_ID`.
- **Expiration (`exp`):** Must be in the future.

### Verification example (Node.js with `jose`)

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

### Verification example (Python with `PyJWT`)

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

## Reading `/userinfo`

Alternatively, call `/userinfo` from your backend using the `access_token` returned by `/oauth2/token`:

```bash
curl -H "Authorization: Bearer ACCESS_TOKEN" https://oauth2.mezon.ai/userinfo
```

## User claims reference

Both the verified `id_token` and `/userinfo` carry these claims when populated on the user's account:

| Claim | Type | Description |
|---|---|---|
| `user_id` | string | **Canonical Mezon user ID** (64-bit snowflake, up to 19 digits). Identical to the ID seen by bots, webhooks, channel apps, and `mezon-light-sdk`. **Always store this as a string and use it as your primary foreign key.** |
| `mezon_id` | string | Opaque identifier from Mezon's sign-in service. **Not** the Mezon user ID—do not pass `mezon_id` to bot APIs, webhooks, or `LightClient.authenticate`. |
| `username` | string | User's unique handle. |
| `display_name` | string | User's display name. |
| `avatar` | string | URL to the user's avatar image. |
| `email` | string | User's email address, if present. |

:::warning `user_id` vs. `mezon_id`
Always key your database records and Mezon API calls on `user_id` (stored as a string/int64), **never** on `mezon_id`. `mezon_id` is an internal sign-in identifier that does not match Mezon snowflake user IDs.
:::

## Bridging `id_token` to `mezon-light-sdk`

Once your backend has exchanged the OAuth2 authorization code and obtained `id_token`, `user_id`, and `username`, you can authenticate the user directly into realtime Mezon DM/group chat via [`mezon-light-sdk`](../channel-apps-and-widgets/light-sdk.md):

```ts
import { LightClient } from "mezon-light-sdk";

const lightClient = await LightClient.authenticate({
  id_token: tokens.id_token,
  user_id: claims.user_id,
  username: claims.username,
});
```

`mezon-gw` (`AuthenticateIdToken`) verifies `id_token`, confirms `claims.user_id === user_id`, and returns a scoped `external` session limited to the 5-RPC external allowlist. This is the exact pattern used by [`mezon-chat-widget`](../channel-apps-and-widgets/chat-widget.md).

## Related

- [Authorization code flow](./authorization-code-flow.mdx)
- [Mezon Light SDK](../channel-apps-and-widgets/light-sdk.md)
- [Mezon Chat Widget](../channel-apps-and-widgets/chat-widget.md)
