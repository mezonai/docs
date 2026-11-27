---
sidebar_label: Overview
sidebar_position: 1
description: Overview of mezon-sdk 2.8.68, the official Node.js JavaScript and TypeScript SDK for building Mezon bots.
---

# JavaScript & TypeScript bot SDK (`mezon-sdk`)

`mezon-sdk` is the official TypeScript/JavaScript SDK for building Mezon bots on Node.js. It provides an event-driven `MezonClient` over TLS abridged TCP, automatic gateway failover, built-in entity and SQLite message caching, interactive message builders, Mezon Dong (MMN) transfers, and AI Agent SSE support.

This guide documents **`mezon-sdk` `2.8.68`** (dual CommonJS + ESM builds on npm).

:::danger Node.js only — not browser compatible
Despite older package descriptions, `mezon-sdk` `2.8.68` requires **Node.js** and cannot run in browsers or browser-like edge runtimes:

- Transport uses Node's built-in `node:tls` module for TLS abridged TCP (`0xEF`) framing.
- Local message caching uses native `better-sqlite3` bindings (`./mezon-cache/mezon-messages-cache.db`).

If you are building a browser integration or embedded chat UI, use [`mezon-light-sdk`](../../channel-apps-and-widgets/light-sdk.md) or [`mezon-chat-widget`](../../channel-apps-and-widgets/chat-widget.md) instead.
:::

## Key capabilities

- **TLS Abridged TCP transport**: Connects directly to the shard `tcp_url` returned by `gw.mezon.ai` with automatic exponential-backoff reconnect (`5s` → `60s`) and `getHealthyEndpoint` failover.
- **Automatic session renewal**: Refreshes the 1-hour access JWT proactively with a 30-second expiry buffer (`ensureValidSession`) before API calls and reconnects.
- **30 typed event handlers**: Ergonomic `client.on*()` registration methods covering messages, reactions, channels, clans, roles, buttons, dropdowns, voice/streaming, friends, quick menu, and AI Agent SSE sessions.
- **Two-tier message cache + throttle queue**: In-memory `CacheManager` caches backed by a local SQLite database (`messages_v2`), plus a built-in `AsyncThrottleQueue` capped at **80 messages/second** and automatic **4,000-character** JSON content validation.
- **Interactive builders**: Fluent `InteractiveBuilder` and `ButtonBuilder` helpers for embeds, forms, selects, radios, date pickers, animations, and action rows.
- **Mezon Dong & AI Agent SSE**: Built-in `mmn-client-js` (`1.0.16`) + ZK proof initialization on login, plus opt-in `connectMezonAgentSSE()`.

## Default configuration (`ClientConfigDto`)

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `botId` | `string` | *(required)* | 64-bit Snowflake Bot ID from the Developer Portal (always pass as a `string`) |
| `token` | `string` | *(required)* | 16-character Bot Token from the Developer Portal |
| `host` | `string` | `'gw.mezon.ai'` | Gateway hostname used for initial `AuthenticateApp` and failover lookups |
| `port` | `string` | `'443'` | Gateway port |
| `useSSL` | `boolean` | `true` | Use HTTPS (`true`) or HTTP (`false`) for gateway requests |
| `timeout` | `number` | `7000` | Request timeout in milliseconds |
| `mmnApiUrl` | `string` | `'https://dong.mezon.ai/mmn-api/'` | Mezon Dong Network (MMN) API base URL |
| `zkApiUrl` | `string` | `'https://dong.mezon.ai/zk-api/'` | Zero-knowledge proof service URL for MMN transactions |
| `agentEventUrl` | `string` | *(optional)* | Base URL of your AI Agent SSE service (for example `'https://your-agent-endpoint.example.com/'`); only opened when you call `connectMezonAgentSSE()` |

## In this section

- [Quickstart](./quickstart.md) — install `mezon-sdk` `2.8.68` and run your first `!ping` bot.
- [Client lifecycle & caches](./client-and-caches.md) — login pipeline, `CacheManager`, SQLite persistence, throttling, and reconnect failover.
- [Guides & recipes](./guides-and-recipes.md) — practical snippets for formatting, replies, ephemeral messages, interactive cards, polls, roles, streaming, and MMN.
- [API reference](./api-reference.md) — complete reference of `MezonClient` methods, all 30 `on*` events, structures, and builders.
