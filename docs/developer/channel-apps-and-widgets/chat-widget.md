---
sidebar_position: 3
sidebar_label: Chat widget
description: Drop a customizable mezon-chat Web Component onto any website with OAuth2 backend code exchange, themes, and JS controls.
---

# Mezon Chat Widget (`mezon-chat-widget`)

`mezon-chat-widget` (version `1.1.4`) ships a zero-framework `<mezon-chat>` Custom Element powered by [`mezon-light-sdk`](./light-sdk.md). Visitors click the launcher button, sign in with their Mezon account via an OAuth2 popup proxied by your backend, and chat directly with a designated Mezon user or bot (`peer-id`).

## Installation

Install from npm or load the bundled script:

```bash
npm install mezon-chat-widget
```

```js
import "mezon-chat-widget";
```

## Embed the `<mezon-chat>` element

```html
<mezon-chat
  api-base-url="https://your-app.example.com"
  api-oauth-path="/api/auth/url"
  api-exchange-path="/api/auth/exchange"
  peer-id="SUPPORT_BOT_OR_USER_ID"
  theme="violet-core"
  position="bottom-right"
  save-session="true"
  welcome-message="Hi! How can we help?"
></mezon-chat>
```

## OAuth2 backend proxy contract

Because Mezon OAuth2 requires your `client_secret` (`client_secret_post`), the widget delegates the authorization URL and token exchange to two endpoints on your server (`api-base-url`):

1. **`GET {apiBaseUrl}/{apiOauthPath}`** (default `api/auth/url`):
   Must return `{ "url": "https://oauth2.mezon.ai/oauth2/auth?..." }` pointing its `redirect_uri` back to a page on your site that also loads `mezon-chat-widget`.
2. **Popup callback handling**:
   When Mezon redirects the popup back with `?code=...&state=...`, `MezonChatElement.handleOAuthCallback()` runs automatically on `DOMContentLoaded`, POSTs `{ code, state }` to **`POST {apiBaseUrl}/{apiExchangePath}`** (default `api/auth/exchange`), posts `MEZON_LOGIN_SUCCESS` to `window.opener`, and closes the popup.
3. **`POST {apiBaseUrl}/{apiExchangePath}`**:
   Exchanges `code` at `https://oauth2.mezon.ai/oauth2/token`, fetches `/userinfo` (or decodes `id_token`), and responds with JSON matching `ExchangeResponse`:

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

The widget then exchanges `tokens.id_token` with `LightClient.authenticate(...)` and connects to Mezon realtime messaging.

:::tip Customizing non-standard backend response shapes
If your backend returns a different JSON wrapper, set `MezonChatElement.exchangeCallBack = (raw) => ({ tokens, user })` (runs in the popup) or `MezonChatElement.oauthCallBack = (raw) => ({ tokens, user })` (runs in the opener window).
:::

## HTML attributes

| Attribute | Required | Default | Description |
|---|---|---|---|
| `api-base-url` | Yes | — | Base URL of your backend proxy server. |
| `api-oauth-path` | No | `api/auth/url` | Relative path returning `{ url }`. |
| `api-exchange-path` | No | `api/auth/exchange` | Relative path exchanging `{ code, state }`. |
| `peer-id` | Yes | — | Mezon user ID or bot ID that visitors chat with. |
| `save-session` | No | `false` | Set `"true"` to persist and restore the Light session in browser storage. |
| `auto-open` | No | `false` | Set `"true"` to open the chat drawer automatically on load. |
| `welcome-message` | No | — | Greeting text displayed inside the widget header/empty state. |
| `position` | No | `bottom-right` | Corner anchor: `bottom-right`, `bottom-left`, `top-right`, or `top-left`. |
| `theme` | No | — | Built-in theme name or any hex color string (e.g. `#4F46E5`). |
| `custom-class` | No | — | Extra CSS class applied to the widget container. |
| `icon-chat` | No | — | Custom URL/SVG for the launcher button icon. |
| `icon-header` | No | — | Custom URL/SVG for the header logo icon. |

## Themes

Pass any built-in theme name or a hex color in the `theme` attribute:

| Theme name | Primary color | Border radius |
|---|---|---|
| `warm-amber` | `#E08926` | `10px` |
| `pulse-red` | `#ed1b23` | `6px` |
| `astra` | `#464fb9` | `4px` |
| `violet-core` | `#6C5DB8` | `8px` |
| `clear-sky` | `#25AAE1` | `8px` |
| `deep-teal` | `#004037` | `8px` |

Passing a hex color such as `theme="#2563EB"` automatically derives a contrasting hover shade. You can also register custom themes programmatically via `ThemeRegistry.register({ name, tokens })`.

## JavaScript methods

Query the `<mezon-chat>` element to control the widget from your application code:

```js
const widget = document.querySelector("mezon-chat");

widget.open();
await widget.startDM("ANOTHER_PEER_ID");
widget.sendMessage("I have a question about order #42.");
widget.close();
widget.logout();
```

## Related

- [Mezon Light SDK](./light-sdk.md)
- [OAuth2 Authorization Code Flow](../oauth2/authorization-code-flow.mdx)
- [Channel apps overview](./channel-apps/overview.md)
