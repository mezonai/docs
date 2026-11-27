---
sidebar_position: 2
sidebar_label: MCP integration
description: Connect AI coding assistants to Mezon Desktop's built-in MCP server (123 tools) or build a custom headless MCP server on mezon-sdk 2.8.68.
---

# Model Context Protocol (MCP) integration

Mezon supports the **Model Context Protocol (MCP)** through two distinct models:

1. **Mezon Desktop In-App MCP Server (recommended for AI assistants & IDEs):** Built directly into the Rust/GPUI Mezon Desktop app (`mezon-mcp` + `mezon-cli`). Exposes **123 tools** (59 read-only, 64 write) over localhost Streamable HTTP (`/mcp`) or `stdio`, acting through your already signed-in desktop session.
2. **Custom headless Bot MCP Server:** Run a standalone Node.js MCP server authenticated as a Mezon bot using `mezon-sdk` `2.8.68`.

---

## 1. Mezon Desktop In-App MCP Server

With the Mezon Desktop app running and signed in, the `mezon mcp` CLI manages the local MCP server and exposes a standard `stdio` proxy for AI coding assistants (Claude Desktop, Cursor, Antigravity, VS Code, etc.).

### CLI reference (`mezon-cli`)

| Command | Description |
|---|---|
| `mezon mcp start [--read-only] [--port <PORT>]` | Start the localhost Streamable HTTP MCP server (`/mcp`) inside the running Mezon Desktop app. Defaults to an ephemeral loopback port; enforces local-origin checks. |
| `mezon mcp status` | Print whether the MCP server is running, its bound port, URL, and read-only state. |
| `mezon mcp stop` | Stop the running in-app MCP HTTP server. |
| `mezon mcp tools [--read-only]` | List registered MCP tools (59 read tools when `--read-only` is set; 123 total otherwise). |
| `mezon mcp call <tool_name> --args '<JSON>'` | Invoke a single MCP tool directly from the terminal (for scripting or QA). |
| `mezon mcp stdio [--read-only]` | Run a standard MCP `stdio` bridge that forwards tool calls to the running Mezon Desktop app. |

### Connecting an AI assistant (`stdio`)

Add Mezon Desktop to your AI client's MCP configuration file. Start with `--read-only` so the assistant can read clans, channels, threads, message history, and search results without mutating chats:

```json
{
  "mcpServers": {
    "mezon": {
      "command": "mezon",
      "args": ["mcp", "stdio", "--read-only"]
    }
  }
}
```

Remove `--read-only` only when you intentionally want the assistant to send messages, react, manage channels/categories, or drive UI interactions.

### Tool categories (123 built-in tools)

| Category | Example read tools (`write: false`) | Example write tools (`write: true`) |
|---|---|---|
| **Session & health** | `get_app_info`, `ping`, `get_connection_status`, `get_account`, `get_current_context` | `set_user_status` |
| **Clans, channels & members** | `list_clans`, `list_channels`, `list_dm_channels`, `list_categories`, `list_channel_members`, `list_friends`, `search_users`, `get_member_list`, `list_banned_users` | `create_clan`, `create_category`, `create_channel`, `mute_channel` |
| **Messages, search & threads** | `list_messages`, `get_message`, `search_messages`, `list_threads`, `list_pinned_messages`, `list_loaded_messages`, `get_scroll_state` | `reply_begin`, `jump_to_message`, `jump_to_present`, `open_topic`, `topic_submit` |
| **UI & diagnostic controls** | `open_panel`, `open_image_viewer`, `open_pdf_viewer`, `member_menu_state`, `channel_menu_state`, `tour_state` | `member_menu_pick`, `channel_menu_pick`, `clan_menu_pick`, `tour_start` |

:::info Full user session vs. bot allowlist
Because Mezon Desktop MCP executes through your authenticated desktop client, read tools such as `list_messages`, `search_messages`, and `list_channel_members` have full access to your visible channels—unlike headless bots, which cannot call `ListChannelMessages`.
:::

---

## 2. Building a headless Bot MCP server (`mezon-sdk` 2.8.68)

:::warning Status of the standalone `mezon-mcp` repository
The standalone `mezon-mcp` repository is an **outdated prototype** pinned to `mezon-sdk ^2.7.84`. It instantiates `new MezonClient(token)` without the required `{ botId, token }` config object, imports internal `dist/cjs/...` paths, and reads legacy `clan.channels.cache` fields that no longer exist in `2.8.x`. Do **not** deploy it as-is—use the modern `mezon-sdk` `2.8.68` pattern below instead.
:::

### Minimal bot MCP server template (`mezon-sdk` 2.8.68)

Remember that bots are bound by the [bot API allowlist](../core-concepts/permissions-and-api-access.md): they can list clans/channels, send messages, create polls, and observe live incoming messages while connected, but cannot fetch historical messages via `ListChannelMessages`.

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MezonClient } from "mezon-sdk";
import { z } from "zod";

const client = new MezonClient({
  botId: process.env.MEZON_BOT_ID!,
  token: process.env.MEZON_BOT_TOKEN!,
});

const server = new McpServer({
  name: "mezon-bot-mcp",
  version: "1.0.0",
});

server.tool(
  "list-clans",
  "List all Mezon clans the bot belongs to",
  {},
  async () => {
    const clans = Array.from(client.clans.values()).map((c) => ({
      id: c.id,
      name: c.name,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(clans, null, 2) }],
    };
  },
);

server.tool(
  "send-channel-message",
  "Send a text message to a Mezon channel",
  {
    channelId: z.string().describe("Target channel snowflake ID"),
    text: z.string().min(1).max(4000).describe("Message text"),
  },
  async ({ channelId, text }) => {
    const channel = await client.channels.fetch(channelId);
    const sent = await channel.send({ t: text });
    return {
      content: [{ type: "text", text: `Sent message ${sent.id} to channel ${channelId}` }],
    };
  },
);

async function main() {
  await client.login();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mezon Bot MCP server listening on stdio");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

:::tip Never write logs to `stdout` in a `stdio` MCP server
Standard `stdio` MCP transports reserve `stdout` exclusively for JSON-RPC frames. Always write diagnostic logs to `console.error(...)` (`stderr`).
:::

## Related

- [AI agent lifecycle events](./ai-agent-events.md)
- [Permissions and API access](../core-concepts/permissions-and-api-access.md)
- [JavaScript/TypeScript bot SDK quickstart](../bot-sdks/javascript/quickstart.md)
