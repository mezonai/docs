---
sidebar_position: 3
sidebar_label: Ví dụ
description: Một ứng dụng trong kênh tối giản viết bằng Node.js, và cách thử nó mà không cần Mezon.
---

# Ví dụ ứng dụng trong kênh

Một ứng dụng trong kênh hoàn chỉnh viết bằng Node.js và Express: một trang chào thành viên đã khởi chạy nó. Ứng dụng dùng bước kiểm tra trong [Kiểm tra ai đã mở ứng dụng](./channel-app-auth-flow.mdx).

## Các tệp {#files}

```text
my-channel-app/
├── check-mezon-data.js   hàm checkMezonData (thẻ Node.js ở trang trước)
├── server.js
└── public/
    └── index.html
```

Cài Express:

```bash
npm init -y
npm install express
```

## server.js

```js
const express = require("express");
const { checkMezonData } = require("./check-mezon-data");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/mezon-login", (req, res) => {
  const user = checkMezonData(String(req.body?.data ?? ""), process.env.MEZON_APP_TOKEN ?? "");
  if (!user) return res.status(401).json({ error: "invalid data" });
  res.json({ user });
});

app.listen(3000, () => console.log("Listening on http://localhost:3000"));
```

## public/index.html

```html
<!doctype html>
<html>
  <body>
    <p id="status">Checking your Mezon account...</p>
    <script>
      const status = document.getElementById("status");
      const data = new URLSearchParams(location.search).get("data");
      if (!data) {
        status.textContent = "Open this app with Launch App in Mezon.";
      } else {
        history.replaceState(null, "", location.pathname);
        fetch("/api/mezon-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        })
          .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
          .then(({ user }) => {
            status.textContent = `Hello ${user.display_name || user.username} (id ${user.id})`;
          })
          .catch(() => {
            status.textContent = "Mezon could not confirm who you are. Launch the app again.";
          });
      }
    </script>
  </body>
</html>
```

## Thử mà không cần Mezon {#test-it-without-mezon}

Đoạn mã này tạo `data` giống hệt cách Mezon tạo, bằng token của chính bạn, rồi in ra một URL cục bộ để mở trong trình duyệt.

```js
// make-test-data.js
const crypto = require("node:crypto");

const appToken = process.env.MEZON_APP_TOKEN ?? "";
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

```bash
export MEZON_APP_TOKEN="YOUR_APP_TOKEN"
node server.js &
node make-test-data.js
```

Mở URL được in ra. Trang hiện `Hello Mai Nguyen (id 1234567890123456789)`.

## Thử trong Mezon {#test-it-in-mezon}

1. Đưa ứng dụng lên mạng tại URL bạn đã đăng ký trên Developer Portal.
2. Đặt `MEZON_APP_TOKEN` trên máy chủ bằng token của ứng dụng.
3. Trong Mezon, nhấn **Khởi chạy ứng dụng** dưới kênh của ứng dụng.

Cửa sổ mới chào bạn bằng tên hiển thị Mezon của bạn.

## Liên quan {#related}

- [Ứng dụng trong kênh](./overview.md)
- [Kiểm tra ai đã mở ứng dụng](./channel-app-auth-flow.mdx)
