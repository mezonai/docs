---
sidebar_position: 2
sidebar_label: Tích hợp MCP
description: Kết nối trợ lý AI lập trình vào máy chủ MCP tích hợp sẵn trong Mezon Desktop (123 công cụ) hoặc tự dựng MCP server cho bot bằng mezon-sdk 2.8.68.
---

# Tích hợp Model Context Protocol (MCP)

Mezon hỗ trợ **Model Context Protocol (MCP)** theo hai hướng rõ ràng:

1. **Máy chủ MCP tích hợp trong Mezon Desktop (khuyên dùng cho trợ lý AI & IDE):** Được tích hợp trực tiếp trong ứng dụng Mezon Desktop (Rust/GPUI, crate `mezon-mcp` + `mezon-cli`). Cung cấp **123 công cụ** (59 công cụ chỉ đọc, 64 công cụ ghi) qua Streamable HTTP cục bộ (`/mcp`) hoặc `stdio`, vận hành dựa trên phiên người dùng đang đăng nhập trên máy tính.
2. **Máy chủ MCP bot không giao diện (headless):** Tự chạy một MCP server Node.js đăng nhập bằng tài khoản bot qua `mezon-sdk` `2.8.68`.

---

## 1. Máy chủ MCP tích hợp trong Mezon Desktop

Khi ứng dụng Mezon Desktop đang mở và đã đăng nhập, bộ lệnh CLI `mezon mcp` cho phép điều khiển máy chủ MCP cục bộ và mở cầu nối `stdio` tiêu chuẩn cho các trợ lý AI (Claude Desktop, Cursor, Antigravity, VS Code, v.v.).

### Tham chiếu CLI (`mezon-cli`)

| Lệnh | Mô tả |
|---|---|
| `mezon mcp start [--read-only] [--port <PORT>]` | Khởi chạy máy chủ MCP Streamable HTTP cục bộ (`/mcp`) bên trong Mezon Desktop đang chạy. Mặc định dùng cổng loopback ngẫu nhiên và kiểm tra origin nội bộ. |
| `mezon mcp status` | Hiển thị trạng thái chạy, cổng, URL và chế độ chỉ đọc của máy chủ MCP. |
| `mezon mcp stop` | Dừng máy chủ MCP HTTP đang chạy. |
| `mezon mcp tools [--read-only]` | Liệt kê các công cụ MCP khả dụng (59 công cụ chỉ đọc khi bật `--read-only`; tổng cộng 123 công cụ ở chế độ đầy đủ). |
| `mezon mcp call <tool_name> --args '<JSON>'` | Gọi trực tiếp một công cụ MCP từ terminal (hữu ích cho script tự động hoặc QA). |
| `mezon mcp stdio [--read-only]` | Chạy cầu nối MCP `stdio` tiêu chuẩn chuyển tiếp lời gọi công cụ vào ứng dụng Mezon Desktop đang chạy. |

### Kết nối với trợ lý AI qua `stdio`

Thêm cấu hình sau vào tệp thiết lập MCP của trình khách AI. Nên bắt đầu với cờ `--read-only` để trợ lý chỉ đọc clan, kênh, luồng, lịch sử tin nhắn và kết quả tìm kiếm mà không tự ý gửi hay thay đổi dữ liệu:

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

Chỉ bỏ `--read-only` khi bạn chủ động cho phép trợ lý gửi tin nhắn, thả cảm xúc, tạo kênh/danh mục hoặc thao tác giao diện.

### Nhóm công cụ tích hợp (123 công cụ)

| Nhóm | Ví dụ công cụ chỉ đọc (`write: false`) | Ví dụ công cụ ghi (`write: true`) |
|---|---|---|
| **Phiên & sức khỏe** | `get_app_info`, `ping`, `get_connection_status`, `get_account`, `get_current_context` | `set_user_status` |
| **Clan, kênh & thành viên** | `list_clans`, `list_channels`, `list_dm_channels`, `list_categories`, `list_channel_members`, `list_friends`, `search_users`, `get_member_list`, `list_banned_users` | `create_clan`, `create_category`, `create_channel`, `mute_channel` |
| **Tin nhắn, tìm kiếm & luồng** | `list_messages`, `get_message`, `search_messages`, `list_threads`, `list_pinned_messages`, `list_loaded_messages`, `get_scroll_state` | `reply_begin`, `jump_to_message`, `jump_to_present`, `open_topic`, `topic_submit` |
| **Điều khiển UI & chẩn đoán** | `open_panel`, `open_image_viewer`, `open_pdf_viewer`, `member_menu_state`, `channel_menu_state`, `tour_state` | `member_menu_pick`, `channel_menu_pick`, `clan_menu_pick`, `tour_start` |

:::info Phiên người dùng đầy đủ so với giới hạn của bot
Vì MCP của Mezon Desktop chạy qua phiên ứng dụng máy tính đã đăng nhập của bạn, các công cụ đọc như `list_messages`, `search_messages` và `list_channel_members` có quyền truy cập toàn bộ kênh bạn được xem — khác với bot độc lập vốn không được gọi `ListChannelMessages`.
:::

---

## 2. Tự xây dựng MCP server cho bot (`mezon-sdk` 2.8.68)

:::warning Hiện trạng kho mã `mezon-mcp` độc lập
Kho mã `mezon-mcp` độc lập hiện là một **bản thử nghiệm cũ** khóa phiên bản `mezon-sdk ^2.7.84`: khởi tạo `new MezonClient(token)` thiếu cấu hình `{ botId, token }`, import đường dẫn nội bộ `dist/cjs/...` và truy cập `clan.channels.cache` đã bị gỡ ở `2.8.x`. Không nên triển khai nguyên trạng kho này — hãy dùng mẫu chuẩn trên `mezon-sdk` `2.8.68` bên dưới.
:::

### Mẫu MCP server bot tối giản (`mezon-sdk` 2.8.68)

Lưu ý bot vẫn tuân theo [danh sách API cho phép của bot](../core-concepts/permissions-and-api-access.md): bot có thể liệt kê clan/kênh, gửi tin nhắn, tạo bình chọn và nhận tin nhắn thời gian thực khi đang chạy, nhưng không thể đọc lịch sử tin nhắn qua `ListChannelMessages`.

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
  "Liệt kê tất cả các clan mà bot đang tham gia",
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
  "Gửi tin nhắn văn bản tới một kênh Mezon",
  {
    channelId: z.string().describe("Snowflake ID của kênh đích"),
    text: z.string().min(1).max(4000).describe("Nội dung tin nhắn"),
  },
  async ({ channelId, text }) => {
    const channel = await client.channels.fetch(channelId);
    const sent = await channel.send({ t: text });
    return {
      content: [{ type: "text", text: `Đã gửi tin nhắn ${sent.id} vào kênh ${channelId}` }],
    };
  },
);

async function main() {
  await client.login();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mezon Bot MCP server đang chạy trên stdio");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

:::tip Không ghi log ra `stdout` trong MCP server `stdio`
Kênh truyền `stdio` của MCP dành riêng `stdout` cho các khung JSON-RPC. Mọi log chẩn đoán phải ghi ra `console.error(...)` (`stderr`).
:::

## Liên quan

- [Sự kiện vòng đời AI Agent](./ai-agent-events.md)
- [Quyền hạn và phạm vi truy cập API](../core-concepts/permissions-and-api-access.md)
- [Bắt đầu nhanh JavaScript/TypeScript bot SDK](../bot-sdks/javascript/quickstart.md)
