---
sidebar_label: Commands & interactions
sidebar_position: 3
description: First-class CommandService, InteractionRouter with InteractionActorTrust security model, CollectorService, and typed message builders in Mezon.Net.Sdk 1.11.0.
---

# Commands, interactions & builders

`Mezon.Net.Sdk` ships first-class subsystems for prefix commands (`CommandService`), component routing (`InteractionRouter`), multi-step flows (`CollectorService`), and typed message serialization (`Mezon.Net.Sdk.Builders`).

## 1. Prefix commands (`CommandService`)

`CommandService` (`Mezon.Net.Sdk.Commands`) parses incoming plain text from `ChannelMessageReceived`, runs optional middleware and authorization checks, enforces per-user cooldowns, and dispatches handlers off the socket dispatch lane.

```csharp
using Mezon.Net.Sdk.Commands;

var commands = new CommandService("!", CommandCasePolicy.IgnoreCase)
{
    IgnoreBots = true, // default: ignores messages from client.BotId
};

// Optional middleware (logging, metrics, error reporting)
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
    .Require(ctx => ctx.Clan is not null); // clan channels only

client.UseCommands(commands);
```

- `CommandRegistration` supports `.WithAlias(...)`, `.WithCooldown(TimeSpan)`, `.Require(predicate)`, and `.RequireAsync(asyncPredicate)`.
- Customize `commands.CooldownStore` (`ICommandCooldownStore`) if you need shared cooldowns across multiple bot pods.

## 2. Interactive routing (`InteractionRouter`)

`InteractionRouter` (`Mezon.Net.Sdk.Interactions`) routes button clicks (`OnButton`) and dropdown selections (`OnSelect`) using either **exact** custom IDs or trailing wildcard **prefix** patterns (`"order_*"`). Exact routes take precedence; among prefix routes, the longest prefix wins.

```csharp
using Mezon.Net.Sdk.Interactions;

var router = new InteractionRouter();

// Exact button route with one-shot lock and expiration
router.OnButton("confirm_restart", async ctx =>
    {
        await ctx.Channel.SendTextAsync($"Restart triggered by {ctx.User.Id}");
    })
    .OneShot()
    .ExpiresAfter(TimeSpan.FromMinutes(2));

// Prefix route for dropdown selections requiring a server-authenticated actor
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

### Understanding `InteractionActorTrust`

:::danger Security boundary: Button clicks vs. Dropdown selections
Mezon's realtime backend handles actor identity differently for buttons versus dropdowns, and `Mezon.Net.Sdk` models this explicitly via `InteractionActorTrust`:

| Interaction Event | `ActorTrust` value | Server behavior | Implication for `.RequireServerAuthenticatedActor()` and `.WithOwner()` |
| --- | --- | --- | --- |
| `MessageButtonClicked` (`ButtonInteraction`) | `InteractionActorTrust.ClientSupplied` | Server forwards `user_id` **as sent by the client** without overwriting it from the session | Calling `.RequireServerAuthenticatedActor()` on a button route **always rejects** with `InteractionExecutionResult.Unauthorized`. Calling `.WithOwner(userId)` on a button filters accidental clicks only — it is **not** a cryptographic security boundary. |
| `DropdownBoxSelected` (`SelectInteraction`) | `InteractionActorTrust.ServerAuthenticated` | Server overwrites `user_id` with the **authenticated session user** | `.RequireServerAuthenticatedActor()` passes, and `.WithOwner(userId)` is server-enforced. |

Never authorize sensitive actions (such as Mezon Dong payouts, role grants, or destructive admin commands) solely on `MessageButtonClicked.UserId`. Use a server-authenticated interaction, a command message (where `ChannelMessage.SenderId` is server-authenticated), or an independent confirmation flow.
:::

One-shot routes (`OneShot()`) are claimed and removed atomically under a lock inside `InteractionRouter.ClaimRoute`, preventing duplicate concurrent executions.

## 3. Multi-step collectors (`CollectorService`)

`CollectorService` (`Mezon.Net.Sdk.Collectors`) lets a command await follow-up messages or component clicks within a timeout or idle window:

```csharp
using Mezon.Net.Sdk.Collectors;

var collectors = new CollectorService();
client.UseCollectors(collectors);

// Inside a command handler: wait up to 30 seconds for the author's reply
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

Use `CollectComponentAsync(new ComponentCollectorOptions { ChannelId = ..., MessageId = ..., ComponentId = ..., Timeout = ... })` to await button or select responses for a specific prompt message. Note that collected `ButtonInteraction` items carry `ActorTrust == InteractionActorTrust.ClientSupplied`, while `SelectInteraction` items carry `ServerAuthenticated`.

## 4. Typed message builders (`Mezon.Net.Sdk.Builders`)

Never hand-concatenate JSON strings like `"{\"t\":\"hi\"}"`. Use the typed builders under `Mezon.Net.Sdk.Builders` so serialization matches Mezon's wire codec exactly:

- **`MessageContentBuilder`**: Text (`SetText`), markdown spans (`AddMarkdown`, `AddBold`, `AddPre`), channel hashtags (`AddHashtag`), custom emojis (`AddEmoji`), links (`AddLink`, `AddVoiceLink`, `AddYoutubeLink`), embeds (`AddEmbed`), action rows (`AddActionRow`), polls (`SetPoll`), call logs (`SetCallLog`), and forward-compatible extensions (`SetExtension`).
- **`MessageEmbedBuilder`** / **`InteractiveBuilder`**: Rich cards with title, description, fields, images, inputs, selects, radios, and date pickers.
- **`ButtonBuilder`**: Action row button definitions.
- **`MessagePollBuilder`** & **`MessageCallLogBuilder`**: Structured poll and call-log payloads.

```csharp
using Mezon.Net.Client;
using Mezon.Net.Sdk.Builders;

var content = new MessageContentBuilder()
    .SetText("Deploy v1.11.0 complete!")
    .AddMarkdown("b", start: 0, end: 14) // "Deploy v1.11.0"
    .Build();

await channel.SendAsync(content);
```

## Related

- [Interactive messages](../../interactive-features/interactive-messages.mdx) — wire format for embeds, forms, buttons, and selects.
- [Caching & performance](./caching-and-performance.md) — keeping command and interaction handlers off the hot dispatch path.
- [API reference](./api-reference.md) — complete `MezonClient` and entity methods.
