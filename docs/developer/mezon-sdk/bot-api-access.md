---
sidebar_position: 4
sidebar_label: What bots can do
description: The server APIs a Mezon bot may call, and what a bot cannot do.
---

# What bots are allowed to do

Mezon gives bots a smaller set of server APIs than people have. This page lists them, as of November 2026, for both SDKs.

## How the limit works

A bot talks to Mezon over one socket. On that socket it sends two kinds of requests:

- **Realtime messages:** sending a message, replying, ephemeral messages and reactions. Bots can send these.
- **API calls:** everything else, such as listing channels or creating a poll. A bot may call only the APIs in the table below. Any other API call answers **"Permission denied."** with code **403**.

## APIs a bot may call

| API | What it does | `mezon-sdk` (JavaScript) |
|---|---|---|
| ListClanDescs | List the bot's clans | Used by `login()` |
| ListChannelDescs | List a clan's channels | `clan.loadChannels()`, `clan.reloadChannels()` |
| ListChannelDetail | Read one channel | `client.channels.fetch(id)` |
| CreateChannelDesc | Create a channel, including a direct message channel | `client.users.fetch(id)` (opens a direct message) |
| ListChannelVoiceUsers | List members in voice channels | `clan.listChannelVoiceUsers()` |
| ListRoles | List a clan's roles | `clan.listRoles()` |
| CreateRole | Create a role | No method in 2.8.66 |
| UpdateRole | Change a role | `clan.updateRole()` |
| GetRoleOfUserInTheClan | Read a member's roles | No method in 2.8.66 |
| ListFriends, AddFriends | Friend list and friend requests | No method in 2.8.66 |
| AddQuickMenuAccess, UpdateQuickMenuAccess, DeleteQuickMenuAccess | Manage the bot's quick menu entries | `client.addQuickMenuAccess()`, `client.deleteQuickMenuAccess()` |
| GenerateMeetToken | Get a meeting token | `client.generateMeetToken()` |
| SendChannelMessage, UpdateChannelMessage, DeleteChannelMessage | Send, edit and delete messages | `message.update()`, `message.delete()` |
| CreatePoll, ClosePoll, GetPoll | Polls | `client.createPoll()`, `client.closePoll()`, `client.getPoll()` |
| GenerateCDNSignature | Get a CDN signature for a channel | `client.generateCDNSignature()` |
| GetStreamPlayback | Get a grant to publish to a stream channel | `client.getStreamPlayback()` |

## What a bot cannot do

Because of the limit, a bot cannot, among others:

- list all members of a clan (ListClanUsers);
- read the message history of a channel (ListChannelMessages). A bot sees only the messages that arrive while it runs;
- list the members of a role (ListRoleUsers);
- list quick menu entries (ListQuickMenuAccess);
- upload files. To show an image, send a link to a file that is already online, as an attachment URL.

In the [.NET SDK](./dotnet-sdk.md), the methods for these APIs are marked `[Obsolete]` and throw `MezonApiException` when a bot calls them.

## Other limits

- A bot works only in the clans it was added to, and sees only the channels it can access. Private channels need the bot as a member.
- Adding a bot to a clan needs the **Manage Clan** permission.

## Related

- [JavaScript/TypeScript bot SDK](./integration-bot-sdk/overview.md)
- [.NET bot SDK](./dotnet-sdk.md)
