---
sidebar_position: 3
sidebar_label: SDK bot cho .NET
description: Viết bot Mezon bằng C# với gói NuGet Mezon.Net.Sdk.
---

# SDK bot cho .NET

`Mezon.Net.Sdk` là gói NuGet để viết bot Mezon bằng C# và các ngôn ngữ .NET khác. SDK đăng nhập bằng ID Bot và token, phát sự kiện khi có tin nhắn mới và hoạt động khác, và gửi tin nhắn trả lời.

Trang này mô tả **Mezon.Net.Sdk 1.11.0**, phiên bản trên NuGet vào tháng 11 năm 2026.

## Các gói

| Gói | Dùng để |
|---|---|
| `Mezon.Net.Sdk` | SDK bot. Gói này kéo theo `Mezon.Net.Client`, `Mezon.Net.Transport`, `Mezon.Net.Core` và `Mezon.Net.Mmn`. |
| `Mezon.Net.Sdk.Caching.Redis`, `Mezon.Net.Sdk.Caching.Sqlite` | Tùy chọn, nơi lưu bộ nhớ đệm của SDK. |
| `Mezon.Net.Sdk.Sfu` | Tùy chọn, cho phòng thoại. |

SDK hỗ trợ .NET Standard 2.1, .NET 6, .NET 8, .NET 9 và .NET 10. Trên .NET Standard 2.1 không có phần `Mezon.Net.Mmn` (Mezon Đồng).

## Viết bot trả lời !ping

Bạn cần một bot có **ID Bot** và **Token**, đã được thêm vào một clan: xem [Tạo bot](../quick-start/creating-mezon-bot.md).

1. Tạo dự án console và thêm gói:

   ```bash
   dotnet new console -n MyMezonBot
   cd MyMezonBot
   dotnet add package Mezon.Net.Sdk --version 1.11.0
   ```

2. Thay nội dung `Program.cs` bằng:

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

3. Đặt thông tin xác thực và chạy bot:

   ```bash
   export MEZON_BOT_ID="YOUR_BOT_ID"
   export MEZON_BOT_TOKEN="YOUR_BOT_TOKEN"
   dotnet run
   ```

Gõ `!ping` trong một kênh của clan. Bot trả lời `pong`.

`CommandService` đọc các tin nhắn bắt đầu bằng tiền tố và gọi lệnh tương ứng. Để tự xử lý mọi tin nhắn, hãy đăng ký sự kiện `client.ChannelMessageReceived`.

## Gửi tin nhắn vào kênh

```csharp
var channel = await client.GetChannelAsync(channelId);
await channel.SendTextAsync("Hello from my bot");
```

Trong SDK này, ID là giá trị kiểu `long`.

## Lỗi

Khi máy chủ từ chối một lệnh gọi, SDK báo lỗi `MezonApiException` (namespace `Mezon.Net.Core`). Thuộc tính `RawCode` chứa mã của máy chủ, ví dụ 403.

Bot chỉ được gọi một số API máy chủ: xem [Bot được phép làm gì](./bot-api-access.md). Các phương thức SDK cho những API còn lại, như `ListClanUsersAsync`, `ListChannelMessagesAsync`, `ListRoleUsersAsync` và các phương thức tải tệp đính kèm, được đánh dấu `[Obsolete]`, nên trình biên dịch cảnh báo bạn trước khi bot gọi chúng.

## Kênh phát trực tiếp {#stream-channels}

`GetStreamPlaybackAsync` xin quyền phát video vào kênh phát trực tiếp. SDK không có mã xử lý video: bạn phát bằng thư viện WebRTC của riêng mình. Xem [Kênh phát trực tiếp](../mezon-topics/streaming-channel.mdx).

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

## Liên quan

- [`Mezon.Net.Sdk` trên NuGet](https://www.nuget.org/packages/Mezon.Net.Sdk)
- [SDK bot cho JavaScript/TypeScript](./integration-bot-sdk/overview.md)
