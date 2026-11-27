---
sidebar_label: Quickstart
sidebar_position: 2
description: Install mezon-sdk 2.8.68 in a Node.js TypeScript project and run a working !ping bot in minutes.
---

# JavaScript & TypeScript quickstart

Build and run a TypeScript bot that connects to Mezon over TLS abridged TCP, listens for `!ping`, and replies safely.

## Prerequisites

- **Node.js 18+** (Node.js 20 LTS or 22 LTS recommended).
- A bot created in the Developer Portal and installed in a test clan. Keep its **Bot ID** and 16-character **Token** handy — see [Create a bot](../../getting-started/create-a-bot.md).

## 1. Initialize the project

```bash
mkdir my-mezon-bot
cd my-mezon-bot
npm init -y
npm install mezon-sdk@2.8.68 dotenv
npm install -D typescript tsx @types/node
npx tsc --init
```

:::note Native `better-sqlite3` dependency
`mezon-sdk` installs `better-sqlite3` for its local message cache. Prebuilt binaries cover standard Linux, macOS, and Windows Node LTS versions; if you run on an uncommon architecture or musl container, make sure Python and C++ build tools (`build-essential`) are present during `npm install`.
:::

## 2. Configure environment variables

Create a `.env` file in the project root (and add `.env` to `.gitignore`):

```bash
MEZON_BOT_ID=YOUR_BOT_ID
MEZON_BOT_TOKEN=YOUR_BOT_TOKEN
```

## 3. Write `src/index.ts`

```ts
import "dotenv/config";
import { MezonClient } from "mezon-sdk";

const botId = process.env.MEZON_BOT_ID;
const token = process.env.MEZON_BOT_TOKEN;

if (!botId || !token) {
  throw new Error("Set MEZON_BOT_ID and MEZON_BOT_TOKEN in your environment.");
}

const client = new MezonClient({ botId, token });

client.on("ready", () => {
  console.log(`Bot ${client.clientId} is online in ${client.clans.size} clan slot(s).`);
});

client.onChannelMessage(async (event) => {
  // Ignore messages sent by the bot itself
  if (event.sender_id === client.clientId) return;

  const text = event.content?.t?.trim();
  if (!text) return;

  if (text === "!ping") {
    const channel = await client.channels.fetch(event.channel_id);
    const message = await channel.messages.fetch(event.message_id!);
    await message.reply({ t: "Pong!" });
  }
});

async function main() {
  await client.login();
}

function shutdown() {
  console.log("Shutting down bot...");
  client.closeSocket();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch((err) => {
  console.error("Failed to start bot:", err);
  process.exit(1);
});
```

## 4. Run your bot

```bash
npx tsx src/index.ts
```

Type `!ping` in any public channel of the clan where you installed the bot. It replies with `Pong!`.

:::tip Keep all Snowflake IDs as strings
Notice `botId`, `event.channel_id`, `event.message_id`, and `event.sender_id` are all strings. Never wrap Mezon IDs in `Number(...)` — JavaScript numbers truncate 64-bit Snowflake IDs.
:::

## Next steps

- [Client lifecycle & caches](./client-and-caches.md) — understand what `login()` seeds and how `./mezon-cache/` works.
- [Guides & recipes](./guides-and-recipes.md) — build embeds, buttons, ephemeral messages, polls, and DM notifications.
- [API reference](./api-reference.md) — inspect every method and event on `MezonClient`.
