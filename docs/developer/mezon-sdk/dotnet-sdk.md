---
sidebar_position: 3
sidebar_label: .NET bot SDK
description: Write a Mezon bot in C# with the Mezon.Net.Sdk NuGet package.
---

# .NET bot SDK

`Mezon.Net.Sdk` is the NuGet package for Mezon bots in C# and other .NET languages. It logs in with the bot's Bot ID and token, raises events for new messages and other activity, and sends messages back.

This page describes **Mezon.Net.Sdk 1.11.0**, the version on NuGet in November 2026.

## Packages

| Package | Use |
|---|---|
| `Mezon.Net.Sdk` | The bot SDK. It brings in `Mezon.Net.Client`, `Mezon.Net.Transport`, `Mezon.Net.Core` and `Mezon.Net.Mmn`. |
| `Mezon.Net.Sdk.Caching.Redis`, `Mezon.Net.Sdk.Caching.Sqlite` | Optional stores for the SDK's caches. |
| `Mezon.Net.Sdk.Sfu` | Optional, for voice rooms. |

The SDK targets .NET Standard 2.1, .NET 6, .NET 8, .NET 9 and .NET 10. On .NET Standard 2.1 the `Mezon.Net.Mmn` part (Mezon Dong) is not included.

## Write a bot that answers !ping

You need a bot with its **Bot ID** and **Token**, added to a clan: see [Create a bot](../quick-start/creating-mezon-bot.md).

1. Create a console project and add the package:

   ```bash
   dotnet new console -n MyMezonBot
   cd MyMezonBot
   dotnet add package Mezon.Net.Sdk --version 1.11.0
   ```

2. Replace `Program.cs` with:

   ```csharp
   using Mezon.Net.Sdk;
   using Mezon.Net.Sdk.Commands;

   var botId = long.Parse(Environment.GetEnvironmentVariable("MEZON_BOT_ID") ?? "0");
   var token = Environment.GetEnvironmentVariable("MEZON_BOT_TOKEN") ?? "";

   await using var client = new MezonClient(new MezonClientOptions(botId, token));

   var commands = new CommandService("!");
   commands.AddCommand("ping", ctx => ctx.ReplyTextAsync("pong"));
   client.UseCommands(commands);

   client.Ready += () =>
   {
       Console.WriteLine($"Bot {client.BotId} is ready");
       return Task.CompletedTask;
   };

   if (!await client.LoginAsync())
   {
       Console.Error.WriteLine("Login failed");
       return 1;
   }

   await Task.Delay(Timeout.Infinite);
   return 0;
   ```

3. Set the credentials and run the bot:

   ```bash
   export MEZON_BOT_ID="YOUR_BOT_ID"
   export MEZON_BOT_TOKEN="YOUR_BOT_TOKEN"
   dotnet run
   ```

Type `!ping` in a channel of your clan. The bot replies `pong`.

`CommandService` parses messages that start with the prefix and calls the matching command. To handle every message yourself, subscribe to `client.ChannelMessageReceived` instead.

## Send a message to a channel

```csharp
var channel = await client.GetChannelAsync(channelId);
await channel.SendTextAsync("Hello from my bot");
```

Ids are `long` values in this SDK.

## Errors

When the server refuses a call, the SDK throws `MezonApiException` (namespace `Mezon.Net.Core`). Its `RawCode` holds the server's code, for example 403.

Bots may call only some server APIs: see [What bots are allowed to do](./bot-api-access.md). The SDK methods for the other APIs, such as `ListClanUsersAsync`, `ListChannelMessagesAsync`, `ListRoleUsersAsync` and the attachment uploads, are marked `[Obsolete]`, so the compiler warns you before a bot calls them.

## Stream channels

`GetStreamPlaybackAsync` gets a grant to publish video to a stream channel. The SDK has no media code: you publish with your own WebRTC stack. See [Stream channels](../mezon-topics/streaming-channel.mdx).

```csharp
using Mezon.Net.Core;
using Mezon.Net.Models;

try
{
    var grant = await client.GetStreamPlaybackAsync(new GetStreamPlaybackParams(channelId, publish: true));
    // grant.Token and grant.WhipUrl go to your WHIP publisher; never log them.
    Console.WriteLine($"Grant valid until {grant.ExpiresAt}");
}
catch (MezonApiException ex)
{
    Console.Error.WriteLine($"Refused: {ex.RawCode} {ex.Message}");
}
```

## Related

- [`Mezon.Net.Sdk` on NuGet](https://www.nuget.org/packages/Mezon.Net.Sdk)
- [JavaScript/TypeScript bot SDK](./integration-bot-sdk/overview.md)
