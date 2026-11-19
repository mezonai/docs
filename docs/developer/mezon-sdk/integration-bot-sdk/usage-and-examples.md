---
sidebar_position: 4
sidebar_label: Usage and examples
description: Short mezon-sdk recipes - commands, replies, mentions, direct and ephemeral messages, polls, channels and events.
---

# Usage and examples

Short recipes for `mezon-sdk` 2.8.66. Each one assumes a logged-in `client`, created as in [Getting started](./getting-started.md). Replace `CHANNEL_ID`, `USER_ID` and `CLAN_ID` with real ids, as strings.

To find an id, read it from an event (for example `event.channel_id` in `onChannelMessage`), or from `client.clans` and `clan.channels` after login.

## Send a message to a channel

```ts
const channel = await client.channels.fetch("CHANNEL_ID");
const message = await channel.send({ t: "Hello from my bot" });
console.log("Sent message", message.id);
```

The bot must be able to see the channel and to send messages in it.

## Handle commands

```ts
import { ChannelMessage } from "mezon-sdk";

client.onChannelMessage(async (event: ChannelMessage) => {
  if (event.sender_id === client.clientId || !event.message_id) return;
  const text = event.content?.t?.trim() ?? "";
  if (!text.startsWith("!")) return;

  const [command, ...args] = text.slice(1).split(/\s+/);
  const channel = await client.channels.fetch(event.channel_id);
  const message = await channel.messages.fetch(event.message_id);

  switch (command) {
    case "ping":
      await message.reply({ t: "pong" });
      break;
    case "echo":
      await message.reply({ t: args.join(" ") || "Nothing to echo" });
      break;
  }
});
```

`onChannelMessage` also receives direct messages to the bot. Their `clan_id` is `"0"`.

## Edit, react to and delete a message

```ts
const channel = await client.channels.fetch("CHANNEL_ID");
const sent = await channel.send({ t: "Working on it..." });
await sent.update({ t: "Done." });
await sent.react({ emoji_id: "EMOJI_ID", emoji: "EMOJI_NAME", count: 1 });
await sent.delete();
```

`update` replaces the content of the message.

For `react`, use the id and name of a custom emoji of the clan. With an empty `emoji_id`, the web app shows a broken image.

## Mention a member

Pass the mentions as the second argument of `send` or `reply`. `s` and `e` are the start and end positions of the mention in `t`.

```ts
const channel = await client.channels.fetch("CHANNEL_ID");
await channel.send({ t: "@Mai please review the report" }, [
  { user_id: "USER_ID", s: 0, e: 4 },
]);
```

## Send a direct message

```ts
const user = await client.users.fetch("USER_ID");
await user.sendDM({ t: "Hi! Your report is ready." });
```

`client.users.fetch` opens a direct message channel between the bot and the user.

## Send an ephemeral message

An ephemeral message appears in the channel only for the members you choose.

```ts
const channel = await client.channels.fetch("CHANNEL_ID");
const ack = await channel.sendEphemeral("USER_ID", { t: "Only you can see this." });
await channel.deleteEphemeral("USER_ID", ack.message_id);
```

`sendEphemeral` also takes an array of user ids. `updateEphemeral` changes an ephemeral message.

## Attach an image by URL

```ts
const channel = await client.channels.fetch("CHANNEL_ID");
await channel.send({ t: "Weekly chart" }, undefined, [
  {
    url: "https://example.com/chart.png",
    filename: "chart.png",
    filetype: "image/png",
    width: 640,
    height: 360,
  },
]);
```

The image must be reachable at a public `https` URL. Give its real `width` and `height`: the web app sizes the image box from them and crops the image if they are wrong. Bots cannot upload files to Mezon: see [What bots are allowed to do](../bot-api-access.md).

## Create a poll

```ts
const created = await client.createPoll({
  clan_id: "CLAN_ID",
  channel_id: "CHANNEL_ID",
  question: "Where should we have lunch?",
  answers: ["Pho", "Rice", "Noodles"],
  expire_hours: 24,
  type: 0,
});
const result = await client.getPoll({ poll_id: created?.poll_id });
console.log(result?.answer_counts);
await client.closePoll({ poll_id: created?.poll_id });
```

- `answers`: 2 to 20 answers.
- `expire_hours`: 1 to 168 (seven days).
- `type`: `0` for one choice, `1` for several choices.

Only the poll's creator can close it.

## List the channels of every clan

```ts
import { ChannelType } from "mezon-sdk";

for (const clan of client.clans.values()) {
  await clan.loadChannels();
  for (const channel of clan.channels.values()) {
    if (channel.channel_type === ChannelType.CHANNEL_TYPE_CHANNEL) {
      console.log(clan.name, channel.name, channel.id);
    }
  }
}
```

The bot sees the clans it was added to and the channels it can access.

## React to clan events

```ts
client.onAddClanUser((event) => {
  console.log("New member", event.user?.user_id, "in clan", event.clan_id);
});
client.onChannelCreated((event) => {
  console.log("Channel created", event.channel_id, "in clan", event.clan_id);
});
```

## Keep the session valid and disconnect

```ts
if (client.isSessionExpired(60)) {
  await client.ensureValidSession();
}
client.closeSocket();
```

## More examples

- [Interactive messages](../../mezon-topics/interactive-message.mdx): buttons, forms, selects and how to read the values.
- [Stream channels](../../mezon-topics/streaming-channel.mdx): publish video from a bot.
- [API reference](./api-references.md)
