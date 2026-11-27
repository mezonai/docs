---
sidebar_position: 1
sidebar_label: Sự kiện AI Agent
description: Đăng ký nhận sự kiện AIAgentEnabledEvent thời gian thực và luồng Server-Sent Events (SSE) vòng đời phòng trong mezon-sdk và Mezon.Net.Sdk.
---

# Sự kiện vòng đời AI Agent

Mezon gửi thông báo vòng đời AI voice-agent qua hai kênh bổ trợ nhau:

1. **Socket thời gian thực (`AIAgentEnabledEvent`, trường Envelope `94`):** Phát trực tiếp trên socket chính của bot mỗi khi AI agent được bật/tắt trong một phòng thoại hoặc kênh.
2. **Luồng SSE siêu dữ liệu Agent (`GET <agentEventUrl>/api/sse/metadata?appid=<botId>&token=<token>`):** Kết nối Server-Sent Events dài hạn đẩy các sự kiện vòng đời phòng có cấu trúc (`room_started`, `room_ended` và `room_summary_done`).

## Danh mục sự kiện

| Loại sự kiện / Envelope | Kênh truyền | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | Thời điểm phát |
|---|---|---|---|---|
| `AIAgentEnabledEvent` (Envelope `94`) | Socket thời gian thực | `onAIAgentEnableEvent` | `AIAgentEnabled` | Khi bật/tắt AI agent trong kênh |
| `room_started` | SSE (`api/sse/metadata`) | `onAIAgentSessionStarted` | `AgentSessionStarted` | Phiên AI agent bắt đầu trong phòng |
| `room_ended` | SSE (`api/sse/metadata`) | `onAIAgentSessionEnded` | `AgentSessionEnded` | Phiên AI agent kết thúc trong phòng |
| `room_summary_done` | SSE (`api/sse/metadata`) | `onAIAgentSessionSummaryDone` | `AgentSessionSummaryDone` | Bản tóm tắt sau phiên đã xử lý xong |

## Đăng ký trong TypeScript (`mezon-sdk`)

Cấu hình URL gốc của agent SSE gateway qua `agentEventUrl`, đăng ký các listener sự kiện, đăng nhập rồi gọi `client.connectMezonAgentSSE()`. Trên Node.js, `mezon-sdk` tự dùng gói `eventsource` đi kèm và tự động nối lại với exponential backoff (khởi điểm 3 giây, trần 30 giây + jitter).

```ts
import { MezonClient } from "mezon-sdk";

const client = new MezonClient({
  botId: process.env.MEZON_BOT_ID!,
  token: process.env.MEZON_BOT_TOKEN!,
  agentEventUrl: process.env.MEZON_AGENT_SSE_URL!, // vd "https://your-agent-gateway.example.com"
});

client.onAIAgentEnableEvent((event) => {
  console.log("Trạng thái bật AI agent thay đổi:", event);
});

client.onAIAgentSessionStarted((event) => {
  console.log("Phiên bắt đầu:", event.room.room_id, event.room.room_name, event.metadata);
});

client.onAIAgentSessionEnded((event) => {
  console.log("Phiên kết thúc:", event.room.room_id, event.timestamp);
});

client.onAIAgentSessionSummaryDone(async (event) => {
  console.log("Đã có bản tóm tắt cho phòng:", event.room.room_id, event.metadata);
});

await client.login();
client.connectMezonAgentSSE();
```

## Đăng ký trong C# (`Mezon.Net.Sdk`)

Trong `Mezon.Net.Sdk`, kết nối SSE của agent là **tùy chọn bật thủ công** (`MezonClientOptions.AgentEventUrl` mặc định là `""`). Gán `AgentEventUrl`, đăng ký các sự kiện có kiểu rồi gọi `ConnectAgentSseAsync()`:

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
    Console.WriteLine("Đã nhận sự kiện bật AI agent");
    return Task.CompletedTask;
};

client.AgentSessionStarted += evt =>
{
    Console.WriteLine($"Phòng bắt đầu: {evt.RawResponse}");
    return Task.CompletedTask;
};

client.AgentSessionEnded += evt =>
{
    Console.WriteLine($"Phòng kết thúc: {evt.RawResponse}");
    return Task.CompletedTask;
};

client.AgentSessionSummaryDone += evt =>
{
    Console.WriteLine($"Tóm tắt hoàn tất: {evt.RawResponse}");
    return Task.CompletedTask;
};

await client.LoginAsync();
await client.ConnectAgentSseAsync();
```

## Cấu trúc payload SSE (`RoomMetadataEvent`)

Mỗi frame `data:` SSE chứa một đối tượng JSON theo lược đồ `RoomMetadataEvent`:

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
    "summary": "Các đầu việc đã thống nhất..."
  }
}
```

:::warning Bảo mật URL SSE và token
Cả hai SDK xác thực luồng SSE bằng cách truyền `appid` và `token` qua tham số query trên `/api/sse/metadata`. Luôn dùng HTTPS (`https://...`), không ghi log toàn bộ URL SSE và luôn cấu hình `agentEventUrl` tường minh trong môi trường thực tế.
:::

## Liên quan

- [Tích hợp MCP](./mcp-integration.md)
- [Khái niệm & Token Voice SFU](../media-voice-and-streaming/voice-sfu/concepts-and-tokens.md)
- [Tham chiếu sự kiện](../reference/events-reference.md)
