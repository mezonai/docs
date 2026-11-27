---
sidebar_label: Hướng dẫn & mẫu công thức
sidebar_position: 4
description: Các đoạn mã TypeScript thực tế cho mezon-sdk 2.8.68 gồm định dạng văn bản, nhắc tên, tệp đính kèm, trả lời, tin tạm thời, DM, embed, nút bấm, bình chọn, quick menu, vai trò, phát trực tiếp, MMN và AI Agent SSE.
---

# Hướng dẫn & mẫu công thức

Các mẫu mã TypeScript sẵn dùng đã được kiểm chứng trực tiếp trên `mezon-sdk` `2.8.68`.

## 1. Văn bản định dạng, nhắc tên & tệp đính kèm URL

Lưu ý rằng các khoảng `mk` dùng chỉ mục ký tự `[s, e)` bắt đầu từ 0 trên `content.t`, còn bot truyền URL HTTPS công khai vào `attachments` (API tải tệp bị chặn với bot).

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

## 2. Trả lời, chỉnh sửa, thả biểu cảm & xóa tin nhắn

Cả `channel.send()` lẫn `message.reply()` đều trả về đối tượng `Message` đã có sẵn `id` do máy chủ cấp.

```ts
client.onChannelMessage(async (event) => {
  if (event.sender_id === client.clientId) return;
  if (event.content?.t?.trim() !== "!status") return;

  const channel = await client.channels.fetch(event.channel_id);
  const incoming = await channel.messages.fetch(event.message_id!);

  // 1. Trả lời ngay
  const statusMsg = await incoming.reply({ t: "Checking services..." });

  // 2. Thả biểu cảm vào tin nhắn người dùng
  await incoming.react({
    emoji_id: "0",
    emoji: "✅",
    count: 1,
  });

  // 3. Cập nhật tin trả lời của bot
  await statusMsg.update({ t: "All systems operational." });

  // 4. Xóa sau nếu cần
  // await statusMsg.delete();
});
```

## 3. Tin nhắn tạm thời (Ephemeral — chỉ hiện riêng cho người nhận)

Tin nhắn tạm thời hiển thị ngay trong kênh nhưng chỉ người có trong `receiver_id` (một ID hoặc mảng ID) mới thấy và không lưu vào lịch sử vĩnh viễn.

```ts
const channel = await client.channels.fetch(channelId);

// Gửi tin nhắn tạm thời cho một người dùng
const ack = await channel.sendEphemeral(
  userId,
  { t: "Processing your request privately..." },
  referenceMessageId, // tùy chọn
);

// Cập nhật tin tạm thời bằng message_id
if (ack?.message_id) {
  await channel.updateEphemeral(
    userId,
    { t: "Done! Your export link is ready." },
    ack.message_id,
  );

  // Hoặc xóa bỏ
  // await channel.deleteEphemeral(userId, ack.message_id);
}
```

## 4. Gửi tin nhắn trực tiếp (DM)

```ts
const user = await client.users.fetch(targetUserId);
await user.sendDM({
  t: "Your scheduled report is ready.",
});
```

## 5. Thẻ embed tương tác & nút bấm

Dùng `InteractiveBuilder` và `ButtonBuilder` để dựng thẻ giàu nội dung, biểu mẫu và hàng nút bấm, rồi bắt sự kiện bằng `onMessageButtonClicked` và `onDropdownBoxSelected`.

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

:::warning Lưu ý bảo mật đối với `MessageButtonClicked.user_id`
Máy chủ chuyển tiếp `MessageButtonClicked.user_id` nguyên bản do phía client gửi lên, trong khi `DropdownBoxSelected.user_id` được máy chủ ghi đè bằng ID người dùng đã xác thực của phiên. **Không** chỉ dựa vào `MessageButtonClicked.user_id` làm ranh giới bảo mật cho thao tác nhạy cảm (như chuyển tiền hay xóa dữ liệu) mà không có bước xác nhận độc lập. Xem [Tin nhắn tương tác](../../interactive-features/interactive-messages.mdx).
:::

## 6. Bình chọn (Polls), Quick Menu & Vai trò (Roles)

```ts
// Tạo, xem và đóng bình chọn
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

// Đăng ký và lắng nghe Quick Menu
// Lưu ý: UpdateQuickMenuAccess bị từ chối với bot; hãy xóa rồi tạo lại nếu cần sửa.
await client.addQuickMenuAccess({
  clan_id: clanId,
  menu_name: "standup",
  action_msg: "/standup",
  menu_type: 1,
});

client.onQuickMenuEvent((event) => {
  console.log("Quick menu triggered:", event);
});

// Liệt kê vai trò và thành viên đang ở kênh thoại
const clan = client.clans.get(clanId);
if (clan) {
  const roles = await clan.listRoles();
  const voiceUsers = await clan.listChannelVoiceUsers(100);
  console.log(roles.roles?.roles?.length, voiceUsers.voice_channel_users?.length);
}
```

## 7. Quyền phát trực tiếp, Meet token & chuyển Mezon Đồng

```ts
// 1. Lấy quyền phát WHIP ngắn hạn cho kênh phát trực tiếp (tuyệt đối không log token hay URL!)
const grant = await client.getStreamPlayback({
  channel_id: streamChannelId,
  publish: true,
});

// 2. Cấp token phòng họp / thoại SFU
const meet = await client.generateMeetToken({
  channel_id: voiceChannelId,
  room_name: roomName,
});

// 3. Chuyển Mezon Đồng (yêu cầu bot thường đã khởi tạo MMN/ZK)
const tx = await client.sendToken({
  receiver_id: recipientUserId,
  amount: 1000,
  note: "Contest prize",
});
console.log("Transfer submitted:", tx.ok);
```

## 8. Sự kiện phiên AI Agent SSE

Cấu hình `agentEventUrl` trong `new MezonClient(...)`, đăng ký hàm lắng nghe và gọi `connectMezonAgentSSE()` sau khi đăng nhập:

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

## Liên quan

- [Tin nhắn tương tác](../../interactive-features/interactive-messages.mdx)
- [Bình chọn (Polls)](../../interactive-features/polls.mdx)
- [Quick Menu](../../interactive-features/quick-menu.mdx)
- [Kênh phát trực tiếp](../../media-voice-and-streaming/stream-channels/publishing-with-whip.mdx)
- [Chuyển token từ bot](../../payments-and-mmn/bot-token-transfers.mdx)
- [Sự kiện AI Agent](../../ai-and-mcp/ai-agent-events.md)
