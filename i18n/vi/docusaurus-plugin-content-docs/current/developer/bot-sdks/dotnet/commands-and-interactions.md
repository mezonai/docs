---
sidebar_label: Lệnh & tương tác
sidebar_position: 3
description: Hệ thống CommandService, InteractionRouter với mô hình tin cậy InteractionActorTrust, CollectorService và các builder tin nhắn có kiểu trong Mezon.Net.Sdk 1.11.0.
---

# Lệnh, tương tác & bộ dựng tin nhắn

`Mezon.Net.Sdk` tích hợp sẵn các phân hệ chuyên biệt cho lệnh tiền tố (`CommandService`), định tuyến thành phần tương tác (`InteractionRouter`), thu thập luồng nhiều bước (`CollectorService`) và tuần tự hóa tin nhắn có kiểu (`Mezon.Net.Sdk.Builders`).

## 1. Lệnh tiền tố (`CommandService`)

`CommandService` (`Mezon.Net.Sdk.Commands`) phân tích văn bản thuần từ sự kiện `ChannelMessageReceived`, chạy middleware và bộ lọc quyền tùy chọn, áp đặt thời gian chờ (cooldown) theo từng người dùng và thực thi handler tách khỏi làn phân phối socket.

```csharp
using Mezon.Net.Sdk.Commands;

var commands = new CommandService("!", CommandCasePolicy.IgnoreCase)
{
    IgnoreBots = true, // mặc định: bỏ qua tin nhắn từ chính client.BotId
};

// Middleware tùy chọn (ghi log, đo lường, báo lỗi)
commands.Use(async (ctx, next) =>
{
    Console.WriteLine($"[{ctx.CommandName}] by {ctx.Author.Id} in {ctx.Channel.Id}");
    await next(ctx);
});

commands.AddCommand("roll", async ctx =>
    {
        var max = ctx.Args.Count > 0 && int.TryParse(ctx.Args[0], out var n) ? n : 6;
        var result = Random.Shared.Next(1, Math.Max(2, max + 1));
        await ctx.ReplyTextAsync($"Rolled **{result}** (1..{max})");
    })
    .WithAlias("dice", "r")
    .WithCooldown(TimeSpan.FromSeconds(5))
    .Require(ctx => ctx.Clan is not null); // chỉ chạy trong kênh clan

client.UseCommands(commands);
```

- `CommandRegistration` hỗ trợ `.WithAlias(...)`, `.WithCooldown(TimeSpan)`, `.Require(predicate)` và `.RequireAsync(asyncPredicate)`.
- Thay thế `commands.CooldownStore` (`ICommandCooldownStore`) nếu bạn cần chia sẻ cooldown giữa nhiều pod bot.

## 2. Định tuyến tương tác (`InteractionRouter`)

`InteractionRouter` (`Mezon.Net.Sdk.Interactions`) định tuyến lượt bấm nút (`OnButton`) và chọn danh sách (`OnSelect`) theo ID **khớp chính xác** hoặc mẫu **tiền tố** có dấu `*` ở cuối (`"order_*"`). Tuyến khớp chính xác được ưu tiên trước; trong các tuyến tiền tố, tiền tố dài nhất thắng.

```csharp
using Mezon.Net.Sdk.Interactions;

var router = new InteractionRouter();

// Tuyến nút khớp chính xác, chạy một lần và có hạn hết hiệu lực
router.OnButton("confirm_restart", async ctx =>
    {
        await ctx.Channel.SendTextAsync($"Restart triggered by {ctx.User.Id}");
    })
    .OneShot()
    .ExpiresAfter(TimeSpan.FromMinutes(2));

// Tuyến tiền tố cho danh sách chọn yêu cầu tác nhân do máy chủ xác thực
router.OnSelect("region_*", async ctx =>
    {
        var selected = (SelectInteraction)ctx.Interaction;
        await ctx.Channel.SendTextAsync(
            $"Region set to {string.Join(", ", selected.Values)} by {ctx.User.Id}");
    })
    .WithOwner(initiatorUserId)
    .RequireServerAuthenticatedActor();

router.OnUnknown(async ctx =>
{
    await ctx.Channel.SendEphemeralTextAsync("This control has expired.", ctx.User.Id);
});

client.UseInteractions(router);
```

### Hiểu rõ `InteractionActorTrust`

:::danger Ranh giới bảo mật: Nút bấm khác với Danh sách chọn
Máy chủ thời gian thực của Mezon xử lý danh tính người thao tác khác nhau giữa nút bấm và danh sách chọn, và `Mezon.Net.Sdk` thể hiện rõ điều này qua `InteractionActorTrust`:

| Sự kiện tương tác | Giá trị `ActorTrust` | Hành vi phía máy chủ | Tác động với `.RequireServerAuthenticatedActor()` và `.WithOwner()` |
| --- | --- | --- | --- |
| `MessageButtonClicked` (`ButtonInteraction`) | `InteractionActorTrust.ClientSupplied` | Máy chủ chuyển tiếp `user_id` **nguyên trạng do client gửi** mà không ghi đè từ phiên đăng nhập | Gọi `.RequireServerAuthenticatedActor()` trên tuyến nút bấm **luôn trả về `InteractionExecutionResult.Unauthorized`**. Gọi `.WithOwner(userId)` trên nút bấm chỉ lọc bấm nhầm — **không phải** ranh giới bảo mật mật mã. |
| `DropdownBoxSelected` (`SelectInteraction`) | `InteractionActorTrust.ServerAuthenticated` | Máy chủ thay `user_id` bằng **người dùng đã xác thực của phiên** | `.RequireServerAuthenticatedActor()` hợp lệ, và `.WithOwner(userId)` được máy chủ bảo đảm. |

Tuyệt đối không phê duyệt thao tác nhạy cảm (như chuyển Mezon Đồng, cấp quyền vai trò hoặc lệnh xóa dữ liệu) chỉ dựa trên `MessageButtonClicked.UserId`. Hãy dùng tương tác được máy chủ xác thực, lệnh tin nhắn (nơi `ChannelMessage.SenderId` do máy chủ xác thực), hoặc luồng xác nhận độc lập.
:::

Các tuyến chạy một lần (`OneShot()`) được kiểm tra và gỡ bỏ nguyên tử dưới một khóa trong `InteractionRouter.ClaimRoute`, ngăn chặn việc chạy trùng lặp khi có nhiều lượt bấm đồng thời.

## 3. Bộ thu thập nhiều bước (`CollectorService`)

`CollectorService` (`Mezon.Net.Sdk.Collectors`) cho phép một lệnh chờ tin nhắn tiếp theo hoặc lượt tương tác thành phần trong một khoảng timeout hoặc idle timeout:

```csharp
using Mezon.Net.Sdk.Collectors;

var collectors = new CollectorService();
client.UseCollectors(collectors);

// Trong handler lệnh: chờ tối đa 30 giây để người gửi trả lời
await ctx.ReplyTextAsync("Enter the ticket title (30s timeout):");

var reply = await collectors.CollectMessageAsync(new MessageCollectorOptions
{
    ChannelId = ctx.Channel.Id,
    UserId = ctx.Author.Id,
    Timeout = TimeSpan.FromSeconds(30),
    Max = 1,
});

if (reply.Items.Count > 0)
{
    await ctx.ReplyTextAsync($"Created ticket: {reply.Items[0].Content.Text}");
}
```

Dùng `CollectComponentAsync(new ComponentCollectorOptions { ChannelId = ..., MessageId = ..., ComponentId = ..., Timeout = ... })` để chờ lượt bấm nút hoặc chọn dropdown trên một tin nhắn cụ thể. Lưu ý các mục `ButtonInteraction` thu được mang `ActorTrust == InteractionActorTrust.ClientSupplied`, còn `SelectInteraction` mang `ServerAuthenticated`.

## 4. Bộ dựng tin nhắn có kiểu (`Mezon.Net.Sdk.Builders`)

Đừng bao giờ nối tay chuỗi JSON kiểu `"{\"t\":\"hi\"}"`. Hãy dùng các builder có kiểu trong `Mezon.Net.Sdk.Builders` để dữ liệu tuần tự hóa khớp tuyệt đối với chuẩn wire codec của Mezon:

- **`MessageContentBuilder`**: Văn bản (`SetText`), khoảng markdown (`AddMarkdown`, `AddBold`, `AddPre`), hashtag kênh (`AddHashtag`), emoji tùy chỉnh (`AddEmoji`), liên kết (`AddLink`, `AddVoiceLink`, `AddYoutubeLink`), thẻ embed (`AddEmbed`), hàng hành động (`AddActionRow`), bình chọn (`SetPoll`), nhật ký cuộc gọi (`SetCallLog`) và phần mở rộng tương thích tiến (`SetExtension`).
- **`MessageEmbedBuilder`** / **`InteractiveBuilder`**: Thẻ giàu nội dung với tiêu đề, mô tả, trường dữ liệu, ảnh, ô nhập, danh sách chọn, radio và chọn ngày.
- **`ButtonBuilder`**: Định nghĩa nút bấm cho hàng hành động.
- **`MessagePollBuilder`** & **`MessageCallLogBuilder`**: Dữ liệu cấu trúc cho bình chọn và nhật ký cuộc gọi.

```csharp
using Mezon.Net.Client;
using Mezon.Net.Sdk.Builders;

var content = new MessageContentBuilder()
    .SetText("Deploy v1.11.0 complete!")
    .AddMarkdown("b", start: 0, end: 14) // "Deploy v1.11.0"
    .Build();

await channel.SendAsync(content);
```

## Liên quan

- [Tin nhắn tương tác](../../interactive-features/interactive-messages.mdx) — cấu trúc dây cho thẻ embed, biểu mẫu, nút bấm và danh sách chọn.
- [Bộ đệm & hiệu năng](./caching-and-performance.md) — giữ handler lệnh và tương tác tách khỏi nhánh phân phối nóng.
- [Tham chiếu API](./api-reference.md) — toàn bộ phương thức của `MezonClient` và các thực thể.
