---
sidebar_position: 3
sidebar_label: Express tutorial
description: Build and locally test a complete Mezon channel app using Node.js and Express.
---

# Channel app tutorial (Express)

This tutorial builds a complete minimal Mezon channel app using Node.js and Express, including a local launch-URL generator so you can verify the entire flow before deploying.

## Project layout

```text
my-channel-app/
├── check-mezon-data.js   # Node.js validator from "Verifying launch data"
├── server.js
├── make-test-data.js     # Local test helper
└── public/
    └── index.html
```

Initialize the project and install Express:

```bash
mkdir my-channel-app && cd my-channel-app
npm init -y
npm install express
```

Save the Node.js `checkMezonData` function from [Verifying launch data](./verifying-launch-data.mdx#backend-validators) into `check-mezon-data.js`.

## 1. Backend server (`server.js`)

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

  // Issue your own HttpOnly session cookie or JWT here using user.id (string).
  return res.json({ user });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
```

## 2. Frontend page (`public/index.html`)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Mezon Channel App</title>
  </head>
  <body>
    <p id="status">Verifying your Mezon launch data...</p>
    <script>
      const status = document.getElementById("status");
      const data = new URLSearchParams(location.search).get("data");

      if (!data) {
        status.textContent = "Open this app using Launch App inside Mezon.";
      } else {
        history.replaceState(null, "", location.pathname);
        fetch("/api/mezon-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        })
          .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
          .then(({ user }) => {
            status.textContent = `Hello ${user.display_name || user.username} (ID: ${user.id})`;
          })
          .catch(() => {
            status.textContent = "Verification failed. Please relaunch the app from Mezon.";
          });
      }
    </script>
  </body>
</html>
```

## 3. Test locally without Mezon (`make-test-data.js`)

This script generates a signed `?data=` payload matching `mezon-api`'s exact HMAC format so you can test locally:

```js
const crypto = require("node:crypto");

const appToken = process.env.MEZON_APP_TOKEN ?? "";
if (!appToken) {
  console.error("Set MEZON_APP_TOKEN before running.");
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

Run both scripts:

```bash
export MEZON_APP_TOKEN="YOUR_TEST_TOKEN"
node server.js &
node make-test-data.js
```

Open the printed URL in a browser. The page displays:

```text
Hello Mai Nguyen (ID: 1234567890123456789)
```

## 4. Deploy and test in Mezon

1. Host the app behind HTTPS and set the URL in your application settings on the [Mezon developer portal](https://mezon.ai/developers/applications).
2. Configure `MEZON_APP_TOKEN` on your server to match your application's **Token**.
3. Install the app in a clan and click **Launch App** from Web, Android, or iOS.

## Related

- [Channel apps overview](./overview.md)
- [Verifying launch data](./verifying-launch-data.mdx)
- [Create a channel app](../../getting-started/create-a-channel-app.md)
