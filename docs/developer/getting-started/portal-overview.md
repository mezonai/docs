---
sidebar_label: Portal overview
sidebar_position: 1
description: Understand the Mezon Developer Portal, what you can build on Mezon, and how applications, bots, webhooks, and OAuth2 fit together.
---

# Developer Portal overview

The [Mezon Developer Portal](https://mezon.ai/developers/applications) is the control plane for registering Mezon identities, issuing secrets, configuring OAuth2 redirect URIs, and generating clan installation links.

## What you can build

Choose the smallest integration mechanism that satisfies your use case:

| Goal | Mechanism | Credentials needed | Persistent process? |
| --- | --- | --- | --- |
| Respond to messages, run commands, post interactive cards/polls, manage roles, transfer Mezon Dong | [Bot](./create-a-bot.md) | Bot ID (64-bit Snowflake) + 16-character Bot Token | Yes (long-lived TLS TCP socket) |
| Embed a web app directly inside a clan channel with verified Mezon user identity | [Channel app](./create-a-channel-app.md) | App ID + 16-character App Token (for HMAC verification) | Only your normal web server |
| Push automated alerts from CI/CD, monitoring, or backend scripts into Mezon | [Webhooks](../webhooks/overview.mdx) | Channel or Clan Webhook URL (created inside Mezon client) | No (single HTTPS `POST`) |
| Let users sign in to your external site with their Mezon account | [OAuth2](../oauth2/authorization-code-flow.mdx) | OAuth2 Client ID, Client Secret, Redirect URI | Only your web backend |
| Join live voice rooms or publish video streams | [Voice SFU & Streaming](../media-voice-and-streaming/overview.md) | Bot session (to request meet tokens / playback grants) | Yes (media publisher/subscriber) |

## Anatomy of a Developer Portal entry

When you create an entry at [mezon.ai/developers/applications](https://mezon.ai/developers/applications), you choose one of two types:

1. **Bot (`Create a bot`)** — Creates a standalone Mezon bot account with its own 64-bit Snowflake **Bot ID** and a 16-character **Token**. Optionally supports **Shadow Bot** mode (`is_shadow: true`) for creator-scoped monitoring (see [Authentication & sessions](../core-concepts/authentication-and-sessions.md#shadow-bots)).
2. **Application (`Create an application`)** — Registers a **Channel App** with an **App ID**, **Token**, and target **URL**. Installing it creates a dedicated App Channel inside a clan.

Each entry exposes tabs in the portal:

- **General Information**: View the App/Bot ID, edit name/avatar/about text, copy the token on creation, or click **Reset Token** to rotate a lost or leaked secret.
- **Installation**: Copy the pre-built **Install Link** (`Add to clan`) to authorize the bot or install the channel app into any clan where the installer has sufficient permissions.
- **OAuth2** (for applications): Configure redirect URIs and credentials for "Sign in with Mezon".

## Security fundamentals

:::warning Store tokens securely
The portal displays a newly created 16-character token **only once**. Never commit tokens into source control, client-side JavaScript bundles, or chat messages. Load them from environment variables or a secret manager (for example `MEZON_BOT_ID` and `MEZON_BOT_TOKEN`), and use **Reset Token** immediately if a credential leaks.
:::

- **Installation scope**: A bot can only observe and interact with clans where a member holding **Manage Clan** explicitly installed it. Private channels additionally require adding the bot to that channel.
- **Channel app permissions**: Installing a channel app creates a channel in a clan and requires the **Manage Channels** permission.
- **Server-side API boundaries**: Bot tokens are restricted to an explicit server-side RPC allowlist enforced by both `mezon-proto-server` and `mezon-api`. See [Permissions & bot API access](../core-concepts/permissions-and-api-access.md).

## Next steps

- [Create a bot](./create-a-bot.md) — register a bot account and install it in your test clan.
- [Create a channel app](./create-a-channel-app.md) — register and install an in-channel web application.
- [SDK ecosystem matrix](./sdk-ecosystem-matrix.md) — pick the official SDK for your stack.
