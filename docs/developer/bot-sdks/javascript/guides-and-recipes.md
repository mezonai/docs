---
sidebar_label: Guides & recipes
sidebar_position: 4
description: Practical TypeScript recipes for mezon-sdk 2.8.68 covering formatting, mentions, attachments, replies, ephemeral messages, DMs, embeds, buttons, polls, quick menu, roles, streaming, MMN, and AI Agent SSE.
---

# Guides & recipes

Copy-and-adapt TypeScript recipes verified directly against `mezon-sdk` `2.8.68`.

## 1. Formatted text, mentions & hosted attachments

Remember that `mk` spans use zero-based `[s, e)` character offsets into `content.t`, and bots pass hosted HTTPS URLs inside `attachments` (file uploads are blocked for bots).

```ts
import { EMarkdownType } from "mezon-sdk";

const channel = await client.channels.fetch(channelId);
const text = "Hello @alice! Build v2.8.68 passed.";

await channel.send(
  {
    t: text,
    mk: [
      { type: EMarkdownType.BOLD, s: 14, e: 27 }, // "Build v2.8.68"
      { type: EMarkdownType.SINGLE, s: 20, e: 27 }, // "v2.8.68"
    ],
  },
  [
    {
      user_id: targetUserId,
      username: "alice",
      s: 6,
      e: 12, // "@alice"
    },
  ],
  [
    {
      url: "https://cdn.example.com/reports/build-2.8.68.png",
      filename: "build-2.8.68.png",
      filetype: "image/png",
      width: 1200,
      height: 630,
    },
  ],
);
```

## 2. Reply, edit, react & delete messages

`channel.send()` and `message.reply()` both return a `Message` object already populated with the server-assigned `id`.

```ts
client.onChannelMessage(async (event) => {
  if (event.sender_id === client.clientId) return;
  if (event.content?.t?.trim() !== "!status") return;

  const channel = await client.channels.fetch(event.channel_id);
  const incoming = await channel.messages.fetch(event.message_id!);

  // 1. Reply immediately
  const statusMsg = await incoming.reply({ t: "Checking services..." });

  // 2. React to the user's message
  await incoming.react({
    emoji_id: "0",
    emoji: "✅",
    count: 1,
  });

  // 3. Edit the bot's reply with results
  await statusMsg.update({ t: "All systems operational." });

  // 4. Delete later if desired
  // await statusMsg.delete();
});
```

## 3. Ephemeral messages (private to one or more users)

Ephemeral messages appear inside a channel only to the specified `receiver_id` (or array of user IDs) and are never stored in permanent chat history.

```ts
const channel = await client.channels.fetch(channelId);

// Send an ephemeral message to one user
const ack = await channel.sendEphemeral(
  userId,
  { t: "Processing your request privately..." },
  referenceMessageId, // optional
);

// Update the ephemeral message using its message_id
if (ack?.message_id) {
  await channel.updateEphemeral(
    userId,
    { t: "Done! Your export link is ready." },
    ack.message_id,
  );

  // Or delete it
  // await channel.deleteEphemeral(userId, ack.message_id);
}
```

## 4. Send a Direct Message (DM)

```ts
const user = await client.users.fetch(targetUserId);
await user.sendDM({
  t: "Your scheduled report is ready.",
});
```

## 5. Interactive embeds & action buttons

Use `InteractiveBuilder` and `ButtonBuilder` to compose rich cards, forms, and action rows, then handle clicks via `onMessageButtonClicked` and `onDropdownBoxSelected`.

```ts
import {
  ButtonBuilder,
  EButtonMessageStyle,
  InteractiveBuilder,
} from "mezon-sdk";

const embed = new InteractiveBuilder("Deployment Approval")
  .setDescription("Approve release v2.8.68 to production?")
  .addField("Environment", "production", true)
  .addField("Commit", "`a1b2c3d`", true)
  .addSelectField("region", "Target region", [
    { label: "AP Southeast", value: "ap-se" },
    { label: "EU Central", value: "eu-c" },
  ])
  .build();

const buttons = new ButtonBuilder()
  .addButton("deploy_approve", "Approve", EButtonMessageStyle.SUCCESS)
  .addButton("deploy_cancel", "Cancel", EButtonMessageStyle.DANGER)
  .build();

await channel.send({
  embed: [embed],
  components: [{ components: buttons }],
});

client.onMessageButtonClicked(async (event) => {
  if (event.button_id === "deploy_approve") {
    const ch = await client.channels.fetch(event.channel_id);
    await ch.send({ t: `Action triggered for button ${event.button_id}` });
  }
});

client.onDropdownBoxSelected(async (event) => {
  console.log(
    `User ${event.user_id} picked ${event.values.join(", ")} on ${event.selectbox_id}`,
  );
});
```

:::warning Security note on `MessageButtonClicked.user_id`
The server forwards `MessageButtonClicked.user_id` as supplied by the client, whereas `DropdownBoxSelected.user_id` is overwritten with the server-authenticated session user. Do **not** rely solely on `MessageButtonClicked.user_id` as a security boundary for privileged actions (such as money transfers or destructive operations) without an independent confirmation step. See [Interactive messages](../../interactive-features/interactive-messages.mdx).
:::

## 6. Polls, Quick Menu & Roles

```ts
// Create, inspect, and close a poll
const poll = await client.createPoll({
  channel_id: channelId,
  clan_id: clanId,
  question: "Preferred release window?",
  answers: ["Tuesday 10:00 UTC", "Thursday 14:00 UTC"],
  allow_multiple_answers: false,
  duration_hours: 24,
});

if (poll?.message_id) {
  const state = await client.getPoll({
    message_id: poll.message_id,
    channel_id: channelId,
  });
  console.log("Poll votes:", state);
  // await client.closePoll({ message_id: poll.message_id, channel_id: channelId });
}

// Register and listen to Quick Menu items
// Note: UpdateQuickMenuAccess is rejected for bots; delete + re-add to modify.
await client.addQuickMenuAccess({
  clan_id: clanId,
  menu_name: "standup",
  action_msg: "/standup",
  menu_type: 1,
});

client.onQuickMenuEvent((event) => {
  console.log("Quick menu triggered:", event);
});

// List roles and inspect voice channel participants
const clan = client.clans.get(clanId);
if (clan) {
  const roles = await clan.listRoles();
  const voiceUsers = await clan.listChannelVoiceUsers(100);
  console.log(roles.roles?.roles?.length, voiceUsers.voice_channel_users?.length);
}
```

## 7. Stream playback grants, Meet tokens & MMN transfers

```ts
// 1. Obtain a short-lived WHIP publish grant for a stream channel (never log token or URL!)
const grant = await client.getStreamPlayback({
  channel_id: streamChannelId,
  publish: true,
});

// 2. Mint a Meet / Voice SFU token
const meet = await client.generateMeetToken({
  channel_id: voiceChannelId,
  room_name: roomName,
});

// 3. Transfer Mezon Dong (requires non-shadow bot with initialized MMN/ZK)
const tx = await client.sendToken({
  receiver_id: recipientUserId,
  amount: 1000,
  note: "Contest prize",
});
console.log("Transfer submitted:", tx.ok);
```

## 8. AI Agent SSE session events

Configure `agentEventUrl` in `new MezonClient(...)`, register your listeners, and call `connectMezonAgentSSE()` after login:

```ts
const client = new MezonClient({
  botId: process.env.MEZON_BOT_ID!,
  token: process.env.MEZON_BOT_TOKEN!,
  agentEventUrl: "https://your-agent-endpoint.example.com/",
});

client.onAIAgentSessionStarted((evt) => {
  console.log("AI session started:", evt.room.room_name);
});

client.onAIAgentSessionSummaryDone((evt) => {
  console.log("Summary ready for room:", evt.room.room_id, evt.metadata);
});

await client.login();
client.connectMezonAgentSSE();
```

## Related

- [Interactive messages](../../interactive-features/interactive-messages.mdx)
- [Polls](../../interactive-features/polls.mdx)
- [Quick menu](../../interactive-features/quick-menu.mdx)
- [Stream channels](../../media-voice-and-streaming/stream-channels/publishing-with-whip.mdx)
- [Bot token transfers](../../payments-and-mmn/bot-token-transfers.mdx)
- [AI agent events](../../ai-and-mcp/ai-agent-events.md)
