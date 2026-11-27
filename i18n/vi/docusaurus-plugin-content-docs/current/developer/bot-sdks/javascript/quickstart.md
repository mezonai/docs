---
sidebar_label: Bắt đầu nhanh
sidebar_position: 2
description: Cài đặt mezon-sdk 2.8.68 trong dự án Node.js TypeScript và chạy bot !ping hoàn chỉnh chỉ trong vài phút.
---

# Bắt đầu nhanh với JavaScript & TypeScript

Xây dựng và chạy một bot TypeScript kết nối tới Mezon qua TLS TCP rút gọn, lắng nghe lệnh `!ping` và phản hồi an toàn.

## Điều kiện cần có

- **Node.js 18+** (khuyến nghị Node.js 20 LTS hoặc 22 LTS).
- Một bot đã tạo trên Developer Portal và cài vào clan thử nghiệm. Chuẩn bị sẵn **ID Bot** và **Token** 16 ký tự — xem [Tạo bot](../../getting-started/create-a-bot.md).

## 1. Khởi tạo dự án

```bash
mkdir my-mezon-bot
cd my-mezon-bot
npm init -y
npm install mezon-sdk@2.8.68 dotenv
npm install -D typescript tsx @types/node
npx tsc --init
```

:::note Phụ thuộc native `better-sqlite3`
`mezon-sdk` cài kèm `better-sqlite3` cho bộ đệm tin nhắn cục bộ. Gói nhị phân dựng sẵn hỗ trợ các bản Node LTS phổ biến trên Linux, macOS và Windows; nếu chạy trong container musl hoặc kiến trúc ít gặp, hãy đảm bảo có sẵn Python và bộ công cụ biên dịch C++ (`build-essential`) khi chạy `npm install`.
:::

## 2. Cấu hình biến môi trường

Tạo tệp `.env` ở thư mục gốc dự án (và thêm `.env` vào `.gitignore`):

```bash
MEZON_BOT_ID=YOUR_BOT_ID
MEZON_BOT_TOKEN=YOUR_BOT_TOKEN
```

## 3. Viết `src/index.ts`

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
  // Bỏ qua tin nhắn do chính bot gửi
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

## 4. Chạy bot

```bash
npx tsx src/index.ts
```

Gõ `!ping` trong một kênh công khai thuộc clan đã cài bot. Bot sẽ trả lời `Pong!`.

:::tip Luôn giữ ID Snowflake ở kiểu `string`
Lưu ý rằng `botId`, `event.channel_id`, `event.message_id` và `event.sender_id` đều là chuỗi. Đừng bao giờ bọc ID Mezon vào `Number(...)` — kiểu số của JavaScript sẽ làm mất độ chính xác của Snowflake 64-bit.
:::

## Bước tiếp theo

- [Vòng đời client & bộ đệm](./client-and-caches.md) — hiểu rõ `login()` khởi tạo gì và cơ chế hoạt động của `./mezon-cache/`.
- [Hướng dẫn & mẫu công thức](./guides-and-recipes.md) — tạo thẻ embed, nút bấm, tin nhắn tạm thời, bình chọn và gửi DM.
- [Tham chiếu API](./api-reference.md) — tra cứu toàn bộ phương thức và sự kiện trên `MezonClient`.
