---
sidebar_position: 3
sidebar_label: Core concepts
description: The client, login and session, the socket, caches, events, ids and limits in mezon-sdk.
---

# Core concepts

This page explains how `mezon-sdk` 2.8.66 works, so you can structure a bot around it.

## The client

`MezonClient` is the only class you create. Everything else (clans, channels, users, messages) comes from the client's caches and events.

```ts
import { MezonClient } from "mezon-sdk";

const client = new MezonClient({
  botId: process.env.MEZON_BOT_ID ?? "",
  token: process.env.MEZON_BOT_TOKEN ?? "",
});
```

The configuration object (`ClientConfigDto`) takes:

| Option | Type | Default | Meaning |
|---|---|---|---|
| `botId` | `string` | (required) | The bot's Bot ID from the developer portal. |
| `token` | `string` | (required) | The bot's token. |
| `host` | `string` | `"gw.mezon.ai"` | The Mezon gateway used for login. |
| `port` | `string` | `"443"` | Gateway port. |
| `useSSL` | `boolean` | `true` | Use HTTPS for login. |
| `timeout` | `number` | `7000` | Request timeout in milliseconds. |

Keep the defaults for the public Mezon service.

## Login and session

`await client.login()` does the whole connection:

1. It sends the Bot ID and token to the gateway and receives a session.
2. It opens a TLS socket to the address in the session.
3. It joins every clan the bot belongs to and loads the bot's direct message channels.
4. It emits `ready` and resolves with the session as a JSON string.

`login()` tries up to 10 times. It waits 10 seconds before the second try and doubles the wait each time, up to 60 seconds (about 7 minutes in all), then rejects with an `Error`. Do not log the string it resolves with: it contains the session tokens.

The session expires. The SDK logs in again by itself when it needs a valid session. You can also check it:

- `client.isSessionExpired(bufferSec?)` returns `true` if the session expires within `bufferSec` seconds.
- `await client.ensureValidSession(bufferSec?)` logs in again if needed and returns the session.

Call `client.closeSocket()` to disconnect.

## The socket

After login, every API call and every event uses one TLS socket. Failed calls reject with a plain value, not an `Error`, so `error.message` is `undefined`; log the whole value instead.

- Socket problems reject with a string, for example "Socket connection has not been established yet." when a call is made before `login()` finishes.
- Calls the server refuses reject with an object `{ code, error: { code, message } }`. For example, an API that bots may not use rejects with `error.code` 403 and `error.message` "Permission denied.": see [What bots are allowed to do](../bot-api-access.md).

## Caches

The client keeps three caches. Each cache has `get(id)` (local only), `fetch(id)` (local, else load), `values()`, `size`, `filter()`, `map()` and `first()`.

| Cache | Filled | `fetch(id)` does |
|---|---|---|
| `client.clans` | At login, with every clan the bot is in. Clan `"0"` holds the bot's direct message channels. | Returns a cached clan. It throws for a clan the bot is not in. |
| `client.channels` | As the bot sees channels. | Loads the channel from the server. |
| `client.users` | As you fetch users. | Opens (or creates) a direct message channel with that user and returns a `User` you can `sendDM` to. |

Each clan has `clan.channels`, filled by `await clan.loadChannels()`. Each channel has `channel.messages`. `channel.messages.fetch(id)` reads the local SQLite store: it finds only the messages the bot received while it was running.

`TextChannel`, `Message`, `User` and `Clan` are not exported from the package. Let TypeScript infer their types from the calls that return them.

## Events

Register handlers with the `on...` methods. Each one returns the client, so you can chain them. Register them before you call `login()`.

```ts
client
  .onChannelMessage((message) => console.log(message.content?.t))
  .onMessageButtonClicked((click) => console.log(click.button_id));
```

The full list is in the [API reference](./api-references.md#events). The most used ones:

| Event | When |
|---|---|
| `onChannelMessage` | A message arrives in a channel or direct message the bot can see. |
| `onMessageButtonClicked` | A member clicks a button or picks an option in the bot's [interactive message](../../mezon-topics/interactive-message.mdx). |
| `onMessageReaction` | Someone reacts to a message. |
| `onAddClanUser`, `onUserClanRemoved` | A member joins or leaves a clan. |
| `onChannelCreated`, `onChannelUpdated`, `onChannelDeleted` | Channels change. |
| `onStreamingJoinedEvent`, `onStreamingLeavedEvent` | Someone goes live or stops in a stream channel. |

`client.on("ready", ...)` fires when the login is complete.

## Message content

A message's content is a `ChannelMessageContent` object. The text is in `t`. Other keys add formatting and parts:

| Key | Holds |
|---|---|
| `t` | The text. |
| `mk` | Formatting ranges in `t`: `{ type, s, e }`, where `type` is for example `"b"` (bold) or `"lk"` (link), and `s` and `e` are the start and end positions in `t`. |
| `embed` | Interactive message cards built with `InteractiveBuilder`. |
| `components` | Rows of buttons and selects: `[{ components: [...] }]`. |

Mentions and attachments are separate arguments of `send` and `reply`. See [Usage and examples](./usage-and-examples.md).

## Ids

Mezon ids (users, clans, channels, messages) are 64-bit numbers. The SDK gives and takes them as strings. Keep them as strings: JavaScript numbers lose precision above 2^53.

## Sending rate

The SDK queues outgoing messages and sends at most 80 per second from one client. Server limits are not documented here.

## Related

- [Getting started](./getting-started.md)
- [API reference](./api-references.md)
- [What bots are allowed to do](../bot-api-access.md)
