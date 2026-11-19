---
sidebar_label: What you can build
sidebar_position: 1
description: The ways to build on Mezon (bots, channel apps, webhooks and OAuth2) and what each one can do.
---

# What you can build on Mezon

Mezon has four ways to build on it. This page says what each one does and where to start.

| You want to | Use | Needs |
|---|---|---|
| Answer messages, run commands, post forms and buttons | [A bot](#bots) | A bot in the developer portal and a program that stays running |
| Show your website inside a clan, with the Mezon user already known | [A channel app](#channel-apps) | An app in the developer portal and a website |
| Post a message from another system (CI, monitoring, a form) | [A webhook](#webhooks) | A webhook URL from a channel or clan, and one HTTP request |
| Let people sign in to your website with Mezon | [OAuth2](#oauth2) | An app in the developer portal with a redirect URI |

## Bots

A bot is a separate Mezon account that your program controls. You create it in the developer portal, which gives you a **Bot ID** and a **Token**. Your program logs in with both and stays connected.

What a bot can do:

- Read the messages of the channels it can see, and reply, edit, delete and react.
- Send direct messages, and ephemeral messages that only the chosen members see.
- Send [interactive messages](../mezon-topics/interactive-message.mdx) with buttons, input fields and selects, and handle the clicks.
- Create polls, list channels, voice channel members and roles, and update roles.
- Publish video to a [stream channel](../mezon-topics/streaming-channel.mdx).

A bot works only in the clans it was added to. Someone with the **Manage Clan** permission adds it with the bot's install link. Bots may call only some server APIs: see [What bots are allowed to do](../mezon-sdk/bot-api-access.md).

There are two SDKs:

- [`mezon-sdk`](../mezon-sdk/integration-bot-sdk/overview.md) for JavaScript and TypeScript on Node.js.
- [`Mezon.Net.Sdk`](../mezon-sdk/dotnet-sdk.md) for C# and other .NET languages.

Start with [Create a bot](./creating-mezon-bot.md).

## Channel apps

A channel app is your website, opened from a channel of a clan. When a member launches it, Mezon adds signed data about that member to your website's URL. Your server checks the signature and knows who the member is, without a separate login.

You do not need an SDK: a channel app is a normal website. Someone with the **Manage Channels** permission installs it, and it appears as a channel in the clan.

Start with [Create a channel app](./creating-mezon-app.md), then read [Channel apps overview](../mezon-sdk/channel-app-sdk/overview.md).

## Webhooks

A webhook is a URL that posts to Mezon. Your program sends one HTTP `POST` with a JSON body, and no login. Webhooks only send messages into Mezon; they do not tell your program about events in Mezon.

- A [channel webhook](../webhooks/channel-webhook.mdx) posts a message to one channel.
- A [clan webhook](../webhooks/clan-webhook.mdx) sends a message to one member of the clan, as an inbox notification.

## OAuth2

[OAuth2](../mezon-topics/oauth2.mdx) lets people sign in to your website with their Mezon account. You get their Mezon user id, username, display name and avatar.

## Related

- [Mezon developer portal](https://mezon.ai/developers/applications)
- [`mezon-sdk` on npm](https://www.npmjs.com/package/mezon-sdk)
- [`Mezon.Net.Sdk` on NuGet](https://www.nuget.org/packages/Mezon.Net.Sdk)
