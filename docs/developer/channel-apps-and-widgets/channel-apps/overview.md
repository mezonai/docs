---
sidebar_position: 1
sidebar_label: Overview
description: What a Mezon channel app is, how Web, Android, and iOS clients launch it, and what signed launch data Mezon passes.
---

# Channel apps overview

A channel app is a standard web application installed into a Mezon clan as a dedicated channel (`CHANNEL_TYPE_APP = 8`). When a member launches the app from **Web, Android, or iOS**, Mezon calls `GenerateHashChannelApps` on the server and appends cryptographically signed identity data (`?data=...`) to your app's URL, enabling seamless single sign-on without a separate login screen.

No client-side Mezon SDK is required. You only need your app's **Token** from the [Mezon developer portal](https://mezon.ai/developers/applications) on your backend server to verify the HMAC signature.

## Client platform support

All three Mezon client platforms—**Web**, **Android**, and **iOS**—invoke `GenerateHashChannelApps` and pass `?data=<webAppData>` when launching a channel app:

| Entry point | What loads | Signed `data` parameter |
|---|---|---|
| Clicking **Launch App** in the app channel or the clan app launcher (Web, Android, iOS) | Your registered app URL with `data`, `clanId`, and `clanName` query parameters | **Yes** (signed by `GenerateHashChannelApps`) |
| Selecting the app channel inline (without launching) | Your app URL embedded in the channel view | No |
| Clicking a deep link in a message with `?code=...` | Your app URL with optional `subpath` and `code` query parameter | No (unsigned) |

## Launch URL anatomy

When a member launches your app, Mezon opens:

```text
https://app.example.com/?data=WEB_APP_DATA&clanId=CLAN_ID&clanName=CLAN_NAME
```

| Query parameter | Signed? | Description |
|---|---|---|
| `data` | **Yes** | URL-encoded query string containing `query_id`, `user`, `auth_date`, `signature`, and HMAC `hash`. Verify this on your backend before trusting any user field. |
| `clanId` | No | Snowflake ID of the clan from which the app was launched. Treat as untrusted UI context unless cross-checked. |
| `clanName` | No | Display name of the clan, when available. Treat as untrusted UI context. |

:::warning Never trust unsigned URL parameters
`clanId`, `clanName`, `code`, and `subpath` are not covered by the `hash` signature. Always authenticate the user exclusively from the verified `user` object inside `data`.
:::

## Deep links into your app

A message link of the following shape opens your channel app directly to a specific route:

```text
https://mezon.ai/chat/clans/CLAN_ID/channels/APP_CHANNEL_ID?code=CODE&subpath=/orders/42
```

Mezon appends `/orders/42` to your app's base URL and passes `?code=CODE`. Without `code`, the link simply navigates to the app channel. Treat `code` as an untrusted navigation hint.

## Legacy `mezon-web-js` bridge

Older examples referenced a `window.Mezon.WebView` JavaScript bridge (`mezon-web-js`). That bridge is **legacy and unwired in current Mezon clients**. Do not depend on `window.Mezon.WebView` for authentication or client communication; read `?data=` from `location.search` and verify it on your backend instead.

## What you need to build

1. **A web frontend** hosted at the HTTPS URL configured in the developer portal.
2. **A backend login endpoint** that receives the raw `data` string, verifies its HMAC-SHA256 signature with your app token, checks `auth_date` freshness, and issues your app's own session cookie or JWT.

Continue to [Verifying launch data](./verifying-launch-data.mdx) for the exact cryptographic verification specification and code in Node.js, Python, Go, and C#.

## Related

- [Create a channel app](../../getting-started/create-a-channel-app.md)
- [Verifying launch data](./verifying-launch-data.mdx)
- [Express tutorial](./tutorial-express.md)
- [Mezon Light SDK](../light-sdk.md)
