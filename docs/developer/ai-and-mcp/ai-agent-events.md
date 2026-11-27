---
sidebar_position: 1
sidebar_label: AI agent events
description: Subscribe to realtime AIAgentEnabledEvent and Server-Sent Events (SSE) room lifecycle callbacks in mezon-sdk and Mezon.Net.Sdk.
---

# AI agent lifecycle events

Mezon delivers AI voice-agent lifecycle notifications over two complementary channels:

1. **Realtime socket (`AIAgentEnabledEvent`, Envelope field `94`):** Emitted over the bot's primary Mezon socket whenever an AI agent is enabled or toggled on a voice room/channel.
2. **Agent Metadata SSE stream (`GET <agentEventUrl>/api/sse/metadata?appid=<botId>&token=<token>`):** A long-lived Server-Sent Events stream delivering structured room lifecycle events (`room_started`, `room_ended`, and `room_summary_done`).

## Event catalog

| Event type / Envelope | Transport | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | When fired |
|---|---|---|---|---|
| `AIAgentEnabledEvent` (Envelope `94`) | Realtime socket | `onAIAgentEnableEvent` | `AIAgentEnabled` | AI agent toggled on a channel |
| `room_started` | SSE (`api/sse/metadata`) | `onAIAgentSessionStarted` | `AgentSessionStarted` | Agent session started in a room |
| `room_ended` | SSE (`api/sse/metadata`) | `onAIAgentSessionEnded` | `AgentSessionEnded` | Agent session ended in a room |
| `room_summary_done` | SSE (`api/sse/metadata`) | `onAIAgentSessionSummaryDone` | `AgentSessionSummaryDone` | Post-session summary generated and ready |

## Subscribing in TypeScript (`mezon-sdk`)

Pass your agent SSE gateway base URL in `agentEventUrl`, register your event listeners, log in, and call `client.connectMezonAgentSSE()`. In Node.js, `mezon-sdk` automatically uses its bundled `eventsource` polyfill and reconnects with exponential backoff (3 s base, capped at 30 s + jitter).

```ts
import { MezonClient } from "mezon-sdk";

const client = new MezonClient({
  botId: process.env.MEZON_BOT_ID!,
  token: process.env.MEZON_BOT_TOKEN!,
  agentEventUrl: process.env.MEZON_AGENT_SSE_URL!, // e.g. "https://your-agent-gateway.example.com"
});

client.onAIAgentEnableEvent((event) => {
  console.log("AI agent enable state changed:", event);
});

client.onAIAgentSessionStarted((event) => {
  console.log("Session started:", event.room.room_id, event.room.room_name, event.metadata);
});

client.onAIAgentSessionEnded((event) => {
  console.log("Session ended:", event.room.room_id, event.timestamp);
});

client.onAIAgentSessionSummaryDone(async (event) => {
  console.log("Summary ready for room:", event.room.room_id, event.metadata);
});

await client.login();
client.connectMezonAgentSSE();
```

## Subscribing in C# (`Mezon.Net.Sdk`)

In `Mezon.Net.Sdk`, agent SSE is **opt-in** (`MezonClientOptions.AgentEventUrl` defaults to `""`). Set `AgentEventUrl`, subscribe to the typed session events, and invoke `ConnectAgentSseAsync()`:

```csharp
using Mezon.Net.Sdk;

var options = new MezonClientOptions(botId, token)
{
    AgentEventUrl = Environment.GetEnvironmentVariable("MEZON_AGENT_SSE_URL")
        ?? "https://your-agent-gateway.example.com",
};

await using var client = new MezonClient(options);

client.AIAgentEnabled += () =>
{
    Console.WriteLine("AI agent enabled event received");
    return Task.CompletedTask;
};

client.AgentSessionStarted += evt =>
{
    Console.WriteLine($"Room started: {evt.RawResponse}");
    return Task.CompletedTask;
};

client.AgentSessionEnded += evt =>
{
    Console.WriteLine($"Room ended: {evt.RawResponse}");
    return Task.CompletedTask;
};

client.AgentSessionSummaryDone += evt =>
{
    Console.WriteLine($"Summary done: {evt.RawResponse}");
    return Task.CompletedTask;
};

await client.LoginAsync();
await client.ConnectAgentSseAsync();
```

## SSE payload schema (`RoomMetadataEvent`)

Each SSE `data:` frame carries a JSON object conforming to `RoomMetadataEvent`:

```json
{
  "event_id": "evt_01J...",
  "event_type": "room_summary_done",
  "timestamp": "2026-11-27T08:30:00Z",
  "room": {
    "room_id": "1840655869123456789",
    "room_name": "weekly-standup"
  },
  "metadata": {
    "summary": "Action items agreed..."
  }
}
```

:::warning Protect your agent SSE URL and token
Both SDKs authenticate the SSE request by passing `appid` and `token` as query parameters on `/api/sse/metadata`. Always use HTTPS (`https://...`), never log the full SSE URL, and configure `agentEventUrl` explicitly in production environments.
:::

## Related

- [MCP integration](./mcp-integration.md)
- [Voice SFU concepts & tokens](../media-voice-and-streaming/voice-sfu/concepts-and-tokens.md)
- [Events reference](../reference/events-reference.md)
