---
sidebar_position: 2
sidebar_label: Getting started
description: Install mezon-sdk and run a bot that answers !ping.
---

# Getting started

Install `mezon-sdk`, log in as your bot, and answer a command. This takes about ten minutes.

## Before you start

- A bot with its **Bot ID** and **Token**, added to a clan where you can send messages. See [Create a bot](../../quick-start/creating-mezon-bot.md).
- Node.js 22 with npm. The SDK runs only on Node.js. This guide was tested with Node.js 22; other versions were not tested.

## 1. Create the project

```bash
mkdir my-mezon-bot
cd my-mezon-bot
npm init -y
npm install mezon-sdk@^2.8.66
npm install --save-dev typescript tsx @types/node
```

`better-sqlite3`, a dependency of the SDK, is a native module. Its version 11.10.0 ships ready-made binaries for Node.js 18, 20, 22 and 23. On Node.js 24 or later, npm compiles it instead, which needs Python and a C++ compiler; on Windows that means Visual Studio with the **Desktop development with C++** workload. Without them, `npm install` fails with `gyp ERR!`.

## 2. Give the bot its credentials

Keep the credentials out of your code. Set them as environment variables in the shell that runs the bot:

```bash
export MEZON_BOT_ID="YOUR_BOT_ID"
export MEZON_BOT_TOKEN="YOUR_BOT_TOKEN"
```

On Windows PowerShell, use `$env:MEZON_BOT_ID = "YOUR_BOT_ID"` and `$env:MEZON_BOT_TOKEN = "YOUR_BOT_TOKEN"`.

## 3. Write the bot

Create `bot.ts`:

```ts
import { MezonClient } from "mezon-sdk";

const client = new MezonClient({
  botId: process.env.MEZON_BOT_ID ?? "",
  token: process.env.MEZON_BOT_TOKEN ?? "",
});

client.onChannelMessage(async (event) => {
  if (event.sender_id === client.clientId) return;
  if (event.content?.t?.trim() !== "!ping" || !event.message_id) return;

  const channel = await client.channels.fetch(event.channel_id);
  const message = await channel.messages.fetch(event.message_id);
  await message.reply({ t: "pong" });
});

client.on("ready", () => {
  console.log(`Bot ${client.clientId} is ready`);
});

client.login().catch((error) => {
  console.error("Login failed:", error);
  process.exit(1);
});
```

What the code does:

- `new MezonClient({ botId, token })` creates the client. It throws `botId is required` or `token is required` when a value is missing.
- `onChannelMessage` runs for every message the bot can see. The first check skips the bot's own messages.
- `client.channels.fetch` and `channel.messages.fetch` turn the event into objects you can act on. `message.reply` answers with a reference to the original message.
- `login()` connects. Its promise resolves with the session as a JSON string; do not print it, because it contains the session tokens.

In plain JavaScript (CommonJS), use `const { MezonClient } = require("mezon-sdk");` and drop the TypeScript parts.

## 4. Run it

```bash
npx tsx bot.ts
```

When you see `Bot ... is ready`, type `!ping` in a channel of your clan. The bot replies `pong`.

## If it does not work

| Symptom | Check |
|---|---|
| `botId is required` or `token is required` | The environment variables are set in the shell that runs the bot. |
| `Login failed` | The Bot ID and token belong to the same bot, and the token was not reset since you copied it. |
| No reply | The bot was added to the clan, and it can see the channel (private channels need the bot as a member). |

## Next steps

- [Core concepts](./core-concepts.md)
- [Usage and examples](./usage-and-examples.md)
- [Interactive messages](../../mezon-topics/interactive-message.mdx)
