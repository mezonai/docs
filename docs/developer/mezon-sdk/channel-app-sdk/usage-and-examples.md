---
sidebar_position: 3
sidebar_label: Examples
description: A complete minimal channel app in Node.js, and how to test it without Mezon.
---

# Channel app examples

A complete channel app with Node.js and Express: a page that greets the member who launched it. It uses the check from [Check who opened your app](./channel-app-auth-flow.mdx).

## Files

```text
my-channel-app/
├── check-mezon-data.js   the checkMezonData function (Node.js tab of the previous page)
├── server.js
└── public/
    └── index.html
```

Install Express:

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

## Test it without Mezon

This script builds `data` the same way Mezon does, with your own token, and prints a local URL to open in your browser.

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

Open the printed URL. The page shows `Hello Mai Nguyen (id 1234567890123456789)`.

## Test it in Mezon

1. Put the app online at the URL you registered in the developer portal.
2. Set `MEZON_APP_TOKEN` on the server to the app's token.
3. In Mezon, click **Launch App** under the app's channel.

The new window greets you with your Mezon display name.

## Related

- [Channel apps](./overview.md)
- [Check who opened your app](./channel-app-auth-flow.mdx)
