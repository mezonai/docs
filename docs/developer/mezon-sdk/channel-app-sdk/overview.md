---
sidebar_position: 1
sidebar_label: Overview
description: What a channel app is, how members open it and what Mezon passes to it.
---

# Channel apps

A channel app is your website, shown in a clan as a channel. Members open it from Mezon. When a member launches it, Mezon adds signed data about that member to the URL, so your server knows who the member is without a separate login.

There is no SDK to install: a channel app is a normal website. You need only the app's **Token** from the developer portal, on your server, to check the signed data.

This page describes the Mezon web app, version 2.1.5. How the desktop and phone apps open channel apps was not checked.

## How members open your app

After you [create the app and install it in a clan](../../quick-start/creating-mezon-app.md), it appears as a channel in the clan's channel list.

| How the member opens it | What loads | Signed member data |
|---|---|---|
| Selects the app's channel | Your app's URL, inside the channel view | No |
| Clicks **Launch App** under the app's channel, or the app in the clan's app list | Your app's URL in a new 900 × 700 browser window, with `data`, `clanId` and `clanName` added | Yes, in `data` |
| Clicks a link to the app channel in a message, with a `code` parameter | Your app's URL inside Mezon, with `code` and an optional path added | No |

## What the launch URL contains

When a member clicks **Launch App**, Mezon opens:

```text
https://app.example.com/?data=WEB_APP_DATA&clanId=CLAN_ID&clanName=CLAN_NAME
```

| Parameter | Meaning |
|---|---|
| `data` | The signed member data (URL-encoded). See [Check who opened your app](./channel-app-auth-flow.mdx). |
| `clanId` | The id of the clan the app was opened from. |
| `clanName` | The clan's name, when known. |

`clanId` and `clanName` are not signed. Trust only what is inside `data`, after your server has checked it.

## Links that open your app

A link in a message of this form opens your app channel:

```text
https://mezon.ai/chat/clans/CLAN_ID/channels/APP_CHANNEL_ID?code=CODE&subpath=/orders/42
```

Mezon loads your app's URL with `/orders/42` added to the path and `?code=CODE` in the query. Without `code`, the link only opens the channel. Use the code to tell your app what to show; it is not signed.

## What you need to build

1. A website at the URL you registered. The member sees it in Mezon.
2. A server endpoint that receives `data`, checks the signature with your app's token, and starts the member's session in your app.

Both steps are on the next page: [Check who opened your app](./channel-app-auth-flow.mdx).

## Related

- [Create a channel app](../../quick-start/creating-mezon-app.md)
- [Channel app examples](./usage-and-examples.md)
