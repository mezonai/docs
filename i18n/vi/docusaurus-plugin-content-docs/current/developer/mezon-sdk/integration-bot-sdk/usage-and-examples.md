---
sidebar_position: 4
sidebar_label: Cách dùng và ví dụ
description: Các công thức mezon-sdk ngắn - lệnh, trả lời, nhắc đến, tin nhắn trực tiếp và ephemeral, bình chọn, kênh và sự kiện.
---

# Cách dùng và ví dụ

Các công thức ngắn cho `mezon-sdk` 2.8.66. Mỗi công thức giả định đã có một `client` đăng nhập, tạo như trong [Bắt đầu](./getting-started.md). Thay `CHANNEL_ID`, `USER_ID` và `CLAN_ID` bằng ID thật, ở dạng chuỗi.

Để tìm một ID, hãy đọc từ sự kiện (ví dụ `event.channel_id` trong `onChannelMessage`), hoặc từ `client.clans` và `clan.channels` sau khi đăng nhập.

## Gửi tin nhắn vào kênh {#send-a-message-to-a-channel}

```ts
const channel = await client.channels.fetch("CHANNEL_ID");
const message = await channel.send({ t: "Hello from my bot" });
console.log("Sent message", message.id);
```

Bot phải nhìn thấy kênh và được phép gửi tin nhắn trong kênh đó.

## Xử lý lệnh {#handle-commands}

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

`onChannelMessage` cũng nhận tin nhắn trực tiếp gửi cho bot. `clan_id` của chúng là `"0"`.

## Sửa, thêm biểu cảm và xóa tin nhắn {#edit-react-to-and-delete-a-message}

```ts
const channel = await client.channels.fetch("CHANNEL_ID");
const sent = await channel.send({ t: "Working on it..." });
await sent.update({ t: "Done." });
await sent.react({ emoji_id: "EMOJI_ID", emoji: "EMOJI_NAME", count: 1 });
await sent.delete();
```

`update` thay toàn bộ nội dung tin nhắn.

Với `react`, hãy dùng ID và tên của một emoji tùy chỉnh trong clan. Nếu `emoji_id` trống, ứng dụng web hiện ảnh lỗi.

## Nhắc đến thành viên {#mention-a-member}

Truyền danh sách nhắc đến làm tham số thứ hai của `send` hoặc `reply`. `s` và `e` là vị trí bắt đầu và kết thúc của phần nhắc đến trong `t`.

```ts
const channel = await client.channels.fetch("CHANNEL_ID");
await channel.send({ t: "@Mai please review the report" }, [
  { user_id: "USER_ID", s: 0, e: 4 },
]);
```

## Gửi tin nhắn trực tiếp {#send-a-direct-message}

```ts
const user = await client.users.fetch("USER_ID");
await user.sendDM({ t: "Hi! Your report is ready." });
```

`client.users.fetch` mở kênh tin nhắn trực tiếp giữa bot và người dùng.

## Gửi tin nhắn ephemeral {#send-an-ephemeral-message}

Tin nhắn ephemeral hiện trong kênh, nhưng chỉ những thành viên bạn chọn mới thấy.

```ts
const channel = await client.channels.fetch("CHANNEL_ID");
const ack = await channel.sendEphemeral("USER_ID", { t: "Only you can see this." });
await channel.deleteEphemeral("USER_ID", ack.message_id);
```

`sendEphemeral` cũng nhận một mảng ID người dùng. `updateEphemeral` sửa một tin nhắn ephemeral.

## Đính kèm ảnh bằng URL {#attach-an-image-by-url}

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

Ảnh phải truy cập được qua một URL `https` công khai. Hãy ghi đúng `width` và `height` của ảnh: ứng dụng web dựng khung ảnh theo hai giá trị này và cắt ảnh nếu chúng sai. Bot không thể tải tệp lên Mezon: xem [Bot được phép làm gì](../bot-api-access.md).

## Tạo bình chọn {#create-a-poll}

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

- `answers`: từ 2 đến 20 lựa chọn.
- `expire_hours`: từ 1 đến 168 (bảy ngày).
- `type`: `0` để chọn một, `1` để chọn nhiều.

Chỉ người tạo bình chọn mới kết thúc được bình chọn đó.

## Liệt kê kênh của mọi clan {#list-the-channels-of-every-clan}

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

Bot thấy các clan đã thêm nó và các kênh nó được truy cập.

## Phản hồi sự kiện trong clan {#react-to-clan-events}

```ts
client.onAddClanUser((event) => {
  console.log("New member", event.user?.user_id, "in clan", event.clan_id);
});
client.onChannelCreated((event) => {
  console.log("Channel created", event.channel_id, "in clan", event.clan_id);
});
```

## Giữ phiên hợp lệ và ngắt kết nối {#keep-the-session-valid-and-disconnect}

```ts
if (client.isSessionExpired(60)) {
  await client.ensureValidSession();
}
client.closeSocket();
```

## Thêm ví dụ {#more-examples}

- [Tin nhắn tương tác](../../mezon-topics/interactive-message.mdx): nút bấm, biểu mẫu, danh sách chọn và cách đọc giá trị.
- [Kênh phát trực tiếp](../../mezon-topics/streaming-channel.mdx): phát video từ bot.
- [Tham chiếu API](./api-references.md)
