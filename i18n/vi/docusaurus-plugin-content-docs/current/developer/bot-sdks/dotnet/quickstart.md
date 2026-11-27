---
sidebar_label: Bắt đầu nhanh
sidebar_position: 2
description: Tạo bot Mezon bằng C# với Mezon.Net.Sdk 1.11.0 theo mô hình ứng dụng console tối giản hoặc Generic Host DI với AddMezonClient().
---

# Bắt đầu nhanh với .NET (C#)

Cài đặt **`Mezon.Net.Sdk` `1.11.0`** và chạy bot trả lời `!ping`, xử lý lỗi bằng `MezonApiException` và tắt tiến trình gọn gàng.

## Điều kiện cần có

- **.NET 8 SDK** trở lên (hỗ trợ `.NET 6`, `.NET 8`, `.NET 9`, `.NET 10` và `.NET Standard 2.1`).
- Một bot đã tạo trên Developer Portal và thêm vào clan — xem [Tạo bot](../../getting-started/create-a-bot.md).

## Cách A: Bot console tối giản

1. Tạo dự án console và thêm gói `Mezon.Net.Sdk`:

```bash
dotnet new console -n MyMezonBot
cd MyMezonBot
dotnet add package Mezon.Net.Sdk --version 1.11.0
```

2. Thay nội dung `Program.cs`:

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

3. Thiết lập biến môi trường và chạy bot:

```bash
export MEZON_BOT_ID="YOUR_BOT_ID"
export MEZON_BOT_TOKEN="YOUR_BOT_TOKEN"
dotnet run
```

Gõ `!ping` trong một kênh của clan; bot sẽ trả lời `Pong!`.

## Cách B: Dependency Injection (`AddMezonClient`)

Với ASP.NET Core hoặc .NET Generic Host worker service, đăng ký `MezonClient` dưới dạng singleton bằng `services.AddMezonClient(...)` và quản lý vòng đời trong một `BackgroundService`:

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

## Gửi tin nhắn & bắt lỗi `MezonApiException`

Khi máy chủ từ chối yêu cầu (chẳng hạn gọi API bị chặn với bot hoặc thiếu quyền trong kênh), SDK ném ngoại lệ `MezonApiException` (namespace `Mezon.Net.Core`):

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

## Bước tiếp theo

- [Lệnh, tương tác & builder](./commands-and-interactions.md) — bí danh lệnh, cooldown, middleware, nút bấm, danh sách chọn và `InteractionActorTrust`.
- [Bộ đệm & hiệu năng](./caching-and-performance.md) — làn phân phối có thứ tự và bộ đệm L1/L2/L3.
- [Tham chiếu API](./api-reference.md) — danh mục đầy đủ bề mặt `MezonClient` và các sự kiện.
