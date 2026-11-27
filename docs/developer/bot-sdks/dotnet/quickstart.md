---
sidebar_label: Quickstart
sidebar_position: 2
description: Create a C# Mezon bot with Mezon.Net.Sdk 1.11.0 using either a minimal console app or Generic Host dependency injection with AddMezonClient().
---

# .NET (C#) quickstart

Install **`Mezon.Net.Sdk` `1.11.0`** and run a bot that responds to `!ping`, handles errors via `MezonApiException`, and shuts down cleanly.

## Prerequisites

- **.NET 8 SDK** or newer (`.NET 6`, `.NET 8`, `.NET 9`, `.NET 10`, and `.NET Standard 2.1` are all supported).
- A bot created in the Developer Portal and added to a clan — see [Create a bot](../../getting-started/create-a-bot.md).

## Option A: Minimal console bot

1. Create a console project and add `Mezon.Net.Sdk`:

```bash
dotnet new console -n MyMezonBot
cd MyMezonBot
dotnet add package Mezon.Net.Sdk --version 1.11.0
```

2. Replace `Program.cs`:

```csharp
using Mezon.Net.Core;
using Mezon.Net.Sdk;
using Mezon.Net.Sdk.Commands;

var botIdRaw = Environment.GetEnvironmentVariable("MEZON_BOT_ID")
    ?? throw new InvalidOperationException("MEZON_BOT_ID is required.");
var token = Environment.GetEnvironmentVariable("MEZON_BOT_TOKEN")
    ?? throw new InvalidOperationException("MEZON_BOT_TOKEN is required.");

var botId = long.Parse(botIdRaw);

await using var client = new MezonClient(new MezonClientOptions(botId, token));

var commands = new CommandService("!");
commands.AddCommand("ping", async ctx => await ctx.ReplyTextAsync("Pong!"));
client.UseCommands(commands);

client.Ready += () =>
{
    Console.WriteLine($"Bot {client.BotId} is ready in {client.Clans.Count} clan(s).");
    return Task.CompletedTask;
};

client.Log += log =>
{
    Console.WriteLine($"[{log.Severity}] {log.Source}: {log.Message}");
    return Task.CompletedTask;
};

using var cts = new CancellationTokenSource();
Console.CancelKeyPress += (_, e) =>
{
    e.Cancel = true;
    cts.Cancel();
};

if (!await client.LoginAsync(cts.Token))
{
    Console.Error.WriteLine("Login failed.");
    return 1;
}

try
{
    await Task.Delay(Timeout.Infinite, cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("Shutting down gracefully...");
}

return 0;
```

3. Export credentials and run:

```bash
export MEZON_BOT_ID="YOUR_BOT_ID"
export MEZON_BOT_TOKEN="YOUR_BOT_TOKEN"
dotnet run
```

Type `!ping` in a channel of your clan; the bot replies `Pong!`.

## Option B: Dependency Injection (`AddMezonClient`)

For ASP.NET Core or .NET Generic Host worker services, register `MezonClient` as a singleton using `services.AddMezonClient(...)` and manage its lifecycle in a `BackgroundService`:

```csharp
using Mezon.Net.Sdk;
using Mezon.Net.Sdk.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddMezonClient(options =>
{
    options.BotId = long.Parse(builder.Configuration["Mezon:BotId"]!);
    options.Token = builder.Configuration["Mezon:Token"]!;
    options.CacheCapacity = 1024;
});

builder.Services.AddHostedService<MezonBotWorker>();

await builder.Build().RunAsync();

public sealed class MezonBotWorker(MezonClient client) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var commands = new CommandService("!");
        commands.AddCommand("ping", ctx => ctx.ReplyTextAsync("Pong!"));
        client.UseCommands(commands);

        await client.LoginAsync(stoppingToken);
        await Task.Delay(Timeout.Infinite, stoppingToken);
    }
}
```

## Sending messages & handling `MezonApiException`

Server rejections (such as calling a blocked bot RPC or lacking channel permission) throw `MezonApiException` from `Mezon.Net.Core`:

```csharp
using Mezon.Net.Core;

try
{
    var channel = await client.GetChannelAsync(channelId);
    await channel.SendTextAsync("Hello from Mezon.Net.Sdk!");
}
catch (MezonApiException ex)
{
    Console.Error.WriteLine($"Mezon refused call (code {ex.RawCode}): {ex.Message}");
}
```

## Next steps

- [Commands, interactions & builders](./commands-and-interactions.md) — aliases, cooldowns, middleware, buttons, selects, and `InteractionActorTrust`.
- [Caching & performance](./caching-and-performance.md) — ordered dispatch lanes and L1/L2/L3 caching.
- [API reference](./api-reference.md) — full `MezonClient` surface and events.
