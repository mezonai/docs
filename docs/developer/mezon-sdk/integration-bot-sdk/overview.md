---
sidebar_position: 1
sidebar_label: Overview
description: What the mezon-sdk package is, where it runs and how a bot connects to Mezon.
---

# JavaScript and TypeScript bot SDK

`mezon-sdk` is the Node.js library for Mezon bots. Your program logs in with the bot's Bot ID and token, receives events such as new messages and button clicks, and sends messages back.

These pages describe **mezon-sdk 2.8.66**, the version on npm in November 2026.

## What you need

- A bot created in the developer portal, with its **Bot ID** and **Token**: see [Create a bot](../../quick-start/creating-mezon-bot.md).
- Node.js. The SDK runs on Node.js only, not in a browser or React Native: it opens a TLS socket with `node:tls` and stores messages with the native `better-sqlite3` module.
- TypeScript is optional. The package ships its type definitions.

## How a bot connects

1. `login()` sends the Bot ID and token over HTTPS and gets a session.
2. The SDK opens a TLS socket to Mezon. All later calls and events use this socket.
3. It joins every clan the bot belongs to, loads the bot's direct message channels, and emits `ready`.
4. Your event handlers run as events arrive: `onChannelMessage`, `onMessageButtonClicked`, and others.

The SDK also creates a local SQLite file, `./mezon-cache/mezon-messages-cache.db`, in the working directory. It keeps the messages the bot has received, so that `channel.messages.fetch(id)` can find them. On first run it adds `/mezon-cache` to the `.gitignore` of the working directory.

## What a bot can do

- Read and answer messages in the channels it can see: reply, edit, delete, react.
- Send direct messages and ephemeral messages (seen only by the chosen members).
- Send [interactive messages](../../mezon-topics/interactive-message.mdx) and handle button clicks and form values.
- Create, read and close polls.
- List channels, voice channel members and roles; update roles.
- Get a grant to publish video to a [stream channel](../../mezon-topics/streaming-channel.mdx).

:::note
Mezon allows bots only a fixed list of server APIs. Any other call fails with "Permission denied." (code 403). For example, a bot cannot list all members of a clan or read the message history of a channel. See [What bots are allowed to do](../bot-api-access.md).
:::

## Pages in this section

- [Getting started](./getting-started.md): install the SDK and run a bot that answers `!ping`.
- [Core concepts](./core-concepts.md): the client, login and session, caches, events and limits.
- [Usage and examples](./usage-and-examples.md): short recipes for common tasks.
- [API reference](./api-references.md): classes, methods and events of version 2.8.66.

## Related

- [`mezon-sdk` on npm](https://www.npmjs.com/package/mezon-sdk)
- [Source code on GitHub](https://github.com/mezonai/mezon-js/tree/master/packages/mezon-sdk)
- [.NET bot SDK](../dotnet-sdk.md)
