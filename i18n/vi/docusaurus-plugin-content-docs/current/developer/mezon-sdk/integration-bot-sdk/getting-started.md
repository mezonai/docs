---
sidebar_position: 2
sidebar_label: Bắt đầu
description: Cài mezon-sdk và chạy một bot trả lời !ping.
---

# Bắt đầu

Cài `mezon-sdk`, đăng nhập bằng bot của bạn và trả lời một lệnh. Việc này mất khoảng mười phút.

## Trước khi bắt đầu

- Một bot có **ID Bot** và **Token**, đã được thêm vào một clan mà bạn gửi được tin nhắn. Xem [Tạo bot](../../quick-start/creating-mezon-bot.md).
- Node.js 22, kèm npm. SDK chỉ chạy trên Node.js. Hướng dẫn này đã được thử với Node.js 22; các phiên bản khác chưa được thử.

## 1. Tạo dự án

```bash
mkdir my-mezon-bot
cd my-mezon-bot
npm init -y
npm install mezon-sdk@^2.8.66
npm install --save-dev typescript tsx @types/node
```

`better-sqlite3`, một thư viện mà SDK dùng, là mô-đun native. Phiên bản 11.10.0 của nó có sẵn bản dựng cho Node.js 18, 20, 22 và 23. Với Node.js 24 trở lên, npm phải tự biên dịch, việc này cần Python và trình biên dịch C++; trên Windows là Visual Studio với workload **Desktop development with C++**. Nếu thiếu, `npm install` lỗi với `gyp ERR!`.

## 2. Đưa thông tin xác thực cho bot

Đừng ghi thông tin xác thực vào mã. Hãy đặt chúng làm biến môi trường trong cửa sổ dòng lệnh chạy bot:

```bash
export MEZON_BOT_ID="YOUR_BOT_ID"
export MEZON_BOT_TOKEN="YOUR_BOT_TOKEN"
```

Trên Windows PowerShell, dùng `$env:MEZON_BOT_ID = "YOUR_BOT_ID"` và `$env:MEZON_BOT_TOKEN = "YOUR_BOT_TOKEN"`.

## 3. Viết bot

Tạo tệp `bot.ts`:

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

Đoạn mã làm gì:

- `new MezonClient({ botId, token })` tạo client. Nếu thiếu giá trị, nó báo lỗi `botId is required` hoặc `token is required`.
- `onChannelMessage` chạy với mọi tin nhắn bot nhìn thấy. Dòng kiểm tra đầu tiên bỏ qua tin nhắn của chính bot.
- `client.channels.fetch` và `channel.messages.fetch` biến sự kiện thành các đối tượng bạn thao tác được. `message.reply` trả lời kèm tham chiếu tới tin nhắn gốc.
- `login()` kết nối. Promise của nó trả về phiên dưới dạng chuỗi JSON; đừng in chuỗi này ra, vì nó chứa token của phiên.

Với JavaScript thuần (CommonJS), dùng `const { MezonClient } = require("mezon-sdk");` và bỏ các phần TypeScript.

## 4. Chạy bot

```bash
npx tsx bot.ts
```

Khi thấy dòng `Bot ... is ready`, hãy gõ `!ping` trong một kênh của clan. Bot trả lời `pong`.

## Nếu bot không chạy

| Hiện tượng | Kiểm tra |
|---|---|
| `botId is required` hoặc `token is required` | Biến môi trường đã được đặt trong cửa sổ dòng lệnh chạy bot. |
| `Login failed` | ID Bot và token thuộc cùng một bot, và token chưa bị đặt lại sau khi bạn sao chép. |
| Bot không trả lời | Bot đã được thêm vào clan và nhìn thấy kênh (kênh riêng tư cần bot là thành viên). |

## Bước tiếp theo

- [Khái niệm cốt lõi](./core-concepts.md)
- [Cách dùng và ví dụ](./usage-and-examples.md)
- [Tin nhắn tương tác](../../mezon-topics/interactive-message.mdx)
