---
sidebar_position: 2
---

# Bắt đầu

## Điều kiện tiên quyết

Để làm việc với thư viện và API của Mezon nói chung, trước tiên bạn phải tạo một tài khoản **[Bot Mezon](../../quick-start/creating-mezon-bot)**.

Để sử dụng `mezon-sdk`, bạn cần cài đặt sẵn các thành phần sau trên hệ thống:

- **Node.js**: (khuyến nghị phiên bản 18.x trở lên)
- **npm** (trình quản lý gói của Node, thường đi kèm Node.js) hoặc **Yarn**
- **TypeScript**: (khuyến nghị phiên bản 4.x trở lên, nếu bạn làm việc với mã nguồn của SDK hoặc muốn hỗ trợ kiểu dữ liệu đầy đủ trong dự án)

## Cài đặt

Cài đặt SDK qua npm:

```sh
npm install mezon-sdk
```

Hoặc dùng Yarn:

```sh
yarn add mezon-sdk
```

:::note

SDK có sẵn trên NPM với tên `mezon-sdk`. Với các dự án trình duyệt và React Native, có thể dùng cùng gói này với các bundler phù hợp.

:::

## Khởi đầu nhanh

Dưới đây là một ví dụ đơn giản để bạn bắt đầu với Mezon SDK:

```javascript
const { MezonClient } = require('mezon-sdk');

// Khởi tạo client với thông tin xác thực của bot
const client = new MezonClient({
  botId: 'YOUR_BOT_ID',
  token: 'YOUR_BOT_TOKEN'
});

// Lắng nghe sự kiện ready
client.on('ready', () => {
  console.log(`Bot ${client.clientId} is ready!`);
});

// Đăng nhập để thiết lập kết nối
client.login()
  .then(() => console.log('Login successful!'))
  .catch(error => console.error('Login failed:', error));
```

## Build từ mã nguồn

Nếu bạn cần build từ mã nguồn hoặc đóng góp cho SDK:

1.  **Clone repository:**
    ```sh
    git clone https://github.com/mezonai/mezon-js.git
    cd mezon-js
    ```

2.  **Cài đặt phụ thuộc:**
    ```sh
    npm install --workspace=mezon-sdk
    ```

3.  **Build SDK:**
    ```sh
    npm run build --workspace=mezon-sdk
    ```

    Lệnh này sẽ biên dịch mã TypeScript thành JavaScript trong thư mục `dist` theo cấu hình trong `tsconfig.json` và `tsconfig.esm.json`.

## Bước tiếp theo

- [Khái niệm cốt lõi](./core-concepts) - Tìm hiểu các khái niệm nền tảng của SDK
- [Cách dùng và ví dụ](./usage-and-examples) - Khám phá các ví dụ thực tế
- [Tài liệu API](./api-references) - Tài liệu API chi tiết
