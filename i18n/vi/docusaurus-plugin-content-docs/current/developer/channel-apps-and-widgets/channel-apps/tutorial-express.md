---
sidebar_position: 3
sidebar_label: Hướng dẫn với Express
description: Xây dựng và kiểm thử cục bộ một Channel App Mezon hoàn chỉnh bằng Node.js và Express.
---

# Hướng dẫn xây dựng Channel App (Express)

Hướng dẫn này xây dựng một Channel App Mezon tối giản nhưng hoàn chỉnh với Node.js và Express, kèm script sinh URL khởi chạy cục bộ để bạn kiểm thử toàn bộ luồng trước khi triển khai.

## Cấu trúc dự án

```text
my-channel-app/
├── check-mezon-data.js   # Hàm kiểm tra Node.js từ trang "Xác minh dữ liệu khởi chạy"
├── server.js
├── make-test-data.js     # Script tạo dữ liệu kiểm thử cục bộ
└── public/
    └── index.html
```

Khởi tạo dự án và cài Express:

```bash
mkdir my-channel-app && cd my-channel-app
npm init -y
npm install express
```

Lưu hàm `checkMezonData` từ [Xác minh dữ liệu khởi chạy](./verifying-launch-data.mdx#mã-xác-minh-trên-backend) vào tệp `check-mezon-data.js`.

## 1. Máy chủ backend (`server.js`)

```js
const express = require("express");
const { checkMezonData } = require("./check-mezon-data");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/mezon-login", (req, res) => {
  const token = process.env.MEZON_APP_TOKEN ?? "";
  if (!token) {
    return res.status(500).json({ error: "MEZON_APP_TOKEN is not configured" });
  }

  const user = checkMezonData(String(req.body?.data ?? ""), token);
  if (!user) {
    return res.status(401).json({ error: "invalid launch data" });
  }

  // Cấp cookie phiên HttpOnly hoặc JWT của riêng ứng dụng bằng user.id (dạng chuỗi).
  return res.json({ user });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`Đang lắng nghe tại http://localhost:${port}`));
```

## 2. Trang frontend (`public/index.html`)

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Mezon Channel App</title>
  </head>
  <body>
    <p id="status">Đang xác minh dữ liệu khởi chạy Mezon...</p>
    <script>
      const status = document.getElementById("status");
      const data = new URLSearchParams(location.search).get("data");

      if (!data) {
        status.textContent = "Hãy mở ứng dụng bằng nút Launch App trong Mezon.";
      } else {
        history.replaceState(null, "", location.pathname);
        fetch("/api/mezon-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        })
          .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
          .then(({ user }) => {
            status.textContent = `Xin chào ${user.display_name || user.username} (ID: ${user.id})`;
          })
          .catch(() => {
            status.textContent = "Xác minh thất bại. Vui lòng khởi chạy lại từ Mezon.";
          });
      }
    </script>
  </body>
</html>
```

## 3. Kiểm thử cục bộ không cần Mezon (`make-test-data.js`)

Script sau tạo gói `?data=` được ký theo đúng định dạng HMAC của `mezon-api` để bạn kiểm thử ngay trên máy:

```js
const crypto = require("node:crypto");

const appToken = process.env.MEZON_APP_TOKEN ?? "";
if (!appToken) {
  console.error("Hãy đặt biến môi trường MEZON_APP_TOKEN trước khi chạy.");
  process.exit(1);
}

const secret = crypto.createHash("md5").update(appToken).digest("hex");
const key = crypto.createHmac("sha256", secret).update("WebAppData").digest();

const signed = new URLSearchParams({
  query_id: crypto.randomBytes(12).toString("hex"),
  user: '{"id":1234567890123456789,"username":"mai.nguyen","display_name":"Mai Nguyen"}',
  auth_date: String(Math.floor(Date.now() / 1000)),
}).toString();

const hash = crypto.createHmac("sha256", key).update(signed).digest("hex");
console.log(`http://localhost:3000/?data=${encodeURIComponent(`${signed}&hash=${hash}`)}`);
```

Chạy cả hai script:

```bash
export MEZON_APP_TOKEN="YOUR_TEST_TOKEN"
node server.js &
node make-test-data.js
```

Mở URL vừa in ra trong trình duyệt. Trang sẽ hiển thị:

```text
Xin chào Mai Nguyen (ID: 1234567890123456789)
```

## 4. Triển khai và thử nghiệm trên Mezon

1. Triển khai ứng dụng qua HTTPS và điền URL đó trong cài đặt ứng dụng trên [Cổng nhà phát triển Mezon](https://mezon.ai/developers/applications).
2. Đặt biến môi trường `MEZON_APP_TOKEN` trên máy chủ bằng đúng **Token** của ứng dụng.
3. Cài đặt ứng dụng vào một clan và bấm **Launch App** từ Web, Android hoặc iOS.

## Liên quan

- [Tổng quan Channel App](./overview.md)
- [Xác minh dữ liệu khởi chạy](./verifying-launch-data.mdx)
- [Tạo Channel App](../../getting-started/create-a-channel-app.md)
