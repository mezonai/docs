---
sidebar_position: 4
---

# Cách dùng và ví dụ

Dưới đây là các ví dụ minh họa cách dùng các tính năng phổ biến của `mezon-sdk`.
Tất cả ví dụ giả định bạn đã cài đặt và import `MezonClient` cùng các kiểu cần thiết.

```typescript
import { MezonClient } from "mezon-sdk";
```

## Khởi tạo Client

`MezonClient` là điểm vào chính. Bạn khởi tạo nó bằng đối tượng cấu hình chứa thông tin xác thực bot.

```typescript
import { MezonClient } from "mezon-sdk";

// Initialize with bot credentials (required)
const client = new MezonClient({
  botId: 'YOUR_BOT_ID',
  token: 'YOUR_BOT_TOKEN',
  // Optional configuration with defaults
  host: 'gw.mezon.ai', // Gateway host
  port: '443', // Connection port
  useSSL: true, // Use secure connection (HTTPS/WSS)
  timeout: 7000, // Request timeout in milliseconds
  mmnApiUrl: 'https://dong.mezon.ai/mmn-api/', // MMN API for token transfers
  zkApiUrl: 'https://dong.mezon.ai/zk-api/' // ZK API for zero-knowledge proofs
});

// Listen for ready event after successful login
client.on("ready", async () => {
  console.log(`Client authenticated and ready!`);
  console.log(`Client ID: ${client.clientId}`);
  
  // Access cached clans and channels
  console.log(`Connected to ${client.clans.cache?.size || 0} clans.`);
  
  // Example: Fetch a channel
  try {
    const channel = await client.channels.fetch("channel_id");
    console.log(`Channel: ${channel.name} (ID: ${channel.id})`);
  } catch (error) {
    console.error("Error fetching channel:", error);
  }
});

// Login to establish connection
client.login().then((sessionData) => {
  console.log("Login successful:", JSON.parse(sessionData));
}).catch((error) => {
  console.error("Login failed:", error);
});
```

### Tìm Clan và Kênh

```typescript
// Function to find a clan by ID or name
async function findClan(client: MezonClient, clanId?: string): Promise<Clan> {
  if (!clanId) {
    // If no clan specified, list available clans
    const clanEntries = Array.from(client.clans.cache?.entries() || []);
    if (clanEntries.length === 1) {
      return clanEntries[0][1]; // Return the only clan
    }
    
    const clanList = clanEntries
      .map(([id, clan]) => `"${clan.name}" (${id})`)
      .join(', ');
    throw new Error(
      `Multiple clans available. Please specify clan ID. Available clans: ${clanList}`,
    );
  }

  // Try to get from cache first
  const clan = client.clans.get(clanId);
  if (clan) return clan;

  // Try to fetch if not in cache
  try {
    return await client.clans.fetch(clanId);
  } catch (error) {
    // Search by name in cached clans
    const clanEntries = Array.from(client.clans.cache?.entries() || []);
    const matchingClans = clanEntries.filter(([id, clan]) => 
      clan.name?.toLowerCase() === clanId.toLowerCase()
    );

    if (matchingClans.length === 0) {
      const availableClans = clanEntries
        .map(([id, clan]) => `"${clan.name}" (${id})`)
        .join(', ');
      throw new Error(
        `Clan "${clanId}" not found. Available clans: ${availableClans}`,
      );
    }
    if (matchingClans.length > 1) {
      const clanList = matchingClans
        .map(([id, clan]) => `${clan.name} (ID: ${id})`)
        .join(', ');
      throw new Error(
        `Multiple clans found with name "${clanId}": ${clanList}. Please specify the clan ID.`,
      );
    }
    return matchingClans[0][1];
  }
}
```

```typescript
// Function to find a channel by ID or name within a clan
async function findChannel(client: MezonClient, channelId: string, clanId?: string): Promise<TextChannel> {
  const clan = await findClan(client, clanId);

  // First try to fetch by ID
  try {
    const channel = await client.channels.fetch(channelId);
    if (channel.clan.id === clan.id) {
      return channel;
    }
  } catch {
    // If fetching by ID fails, search by name in the specified clan
    const channelEntries = Array.from(clan.channels.cache?.entries() || []);
    const matchingChannels = channelEntries.filter(([id, channel]) => 
      channel.name?.toLowerCase() === channelId.toLowerCase() ||
      channel.name?.toLowerCase() === channelId.toLowerCase().replace('#', '')
    );

    if (matchingChannels.length === 0) {
      const availableChannels = channelEntries
        .map(([id, channel]) => `"#${channel.name}" (${id})`)
        .join(', ');
      throw new Error(
        `Channel "${channelId}" not found in clan "${clan.name}". Available channels: ${availableChannels}`,
      );
    }
    if (matchingChannels.length > 1) {
      const channelList = matchingChannels
        .map(([id, channel]) => `#${channel.name} (${id})`)
        .join(', ');
      throw new Error(
        `Multiple channels found with name "${channelId}" in clan "${clan.name}": ${channelList}. Please specify the channel ID.`,
      );
    }
    return matchingChannels[0][1];
  }
  throw new Error(
    `Channel "${channelId}" not found in clan "${clan.name}"`,
  );
}
```

## Xác thực

### Đăng nhập bằng Token

Phương thức `MezonClient.login()` xử lý toàn bộ luồng xác thực, bao gồm phân giải endpoint động và thiết lập kết nối WebSocket.

```typescript
async function authenticateClient() {
  const client = new MezonClient("<YOUR_BOT_TOKEN>");
  
  try {
    // Login handles authentication, endpoint resolution, and connection setup
    const sessionData = await client.login();
    console.log("Authentication successful!");
    console.log("Session data:", JSON.parse(sessionData));
    
    // The client will emit 'ready' event when fully initialized
    return client;
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
}

// Usage
authenticateClient().then(client => {
  console.log("Client ready for use");
}).catch(error => {
  console.error("Failed to authenticate client:", error);
});
```

### Đăng xuất và Dọn dẹp

```typescript
async function cleanupClient(client: MezonClient) {
  try {
    // Close WebSocket connection and reset managers
    client.closeSocket();
    console.log("Client disconnected successfully.");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

// Usage:
// await cleanupClient(client);
```

## Làm việc với Kênh

### Lấy Kênh

`MezonClient` cung cấp truy cập có cache tới kênh qua trình quản lý cache `channels`. Bạn có thể lấy kênh theo ID.

```typescript
async function getChannel(client: MezonClient, channelId: string) {
  try {
    // Fetch channel by ID (automatically cached)
    const channel = await client.channels.fetch(channelId);
    console.log(`Channel: ${channel.name} (ID: ${channel.id})`);
    console.log(`Type: ${channel.channel_type}, Private: ${channel.is_private}`);
    console.log(`Clan: ${channel.clan.name}`);
    return channel;
  } catch (error) {
    console.error(`Failed to fetch channel ${channelId}:`, error);
    throw error;
  }
}
```

**Tham số**

- `channelId`: Chuỗi đại diện định danh duy nhất của kênh.

**Giá trị trả về**

- `channel`: Đối tượng `TextChannel` với các phương thức gửi tin nhắn, quản lý lịch sử tin nhắn và truy cập thuộc tính kênh.

### Gửi Tin nhắn tới Kênh

Khi đã có đối tượng `TextChannel`, bạn có thể gửi tin nhắn với nhiều loại nội dung và tùy chọn.

```typescript
import { ChannelMessageContent, ApiMessageMention, ApiMessageAttachment } from 'mezon-sdk';

// Basic text message
async function sendBasicMessage(channel: TextChannel, text: string) {
  try {
    const content: ChannelMessageContent = {
      t: text // 't' property contains the text content
    };
    
    const response = await channel.send(content);
    console.log(`Message sent! Response:`, response);
    return response;
  } catch (error) {
    console.error(`Failed to send message to channel ${channel.id}:`, error);
    throw error;
  }
}

// Message with mentions and attachments
async function sendAdvancedMessage(
  channel: TextChannel, 
  text: string, 
  userIds: string[] = [],
  attachmentUrls: string[] = []
) {
  try {
    const content: ChannelMessageContent = {
      t: text
    };

    // Create mentions
    const mentions: ApiMessageMention[] = userIds.map(userId => ({
      user_id: userId,
      // Add position markers if needed
      s: 0, // start position in text
      e: text.length // end position in text
    }));

    // Create attachments
    const attachments: ApiMessageAttachment[] = attachmentUrls.map(url => ({
      url: url,
      filename: url.split('/').pop() || 'attachment',
      filetype: 'image/png' // Adjust based on actual file type
    }));

    const response = await channel.send(
      content,
      mentions.length > 0 ? mentions : undefined,
      attachments.length > 0 ? attachments : undefined,
      false, // mention_everyone
      false, // anonymous_message
      undefined, // topic_id
      0 // code - default message type
    );

    console.log(`Advanced message sent! Response:`, response);
    return response;
  } catch (error) {
    console.error(`Failed to send advanced message:`, error);
    throw error;
  }
}

// Send ephemeral message (only visible to specific user)
async function sendEphemeralMessage(
  channel: TextChannel,
  receiverId: string,
  content: ChannelMessageContent,
  replyToMessageId?: string
) {
  try {
    const response = await channel.sendEphemeral(
      receiverId,
      content,
      replyToMessageId
    );
    console.log(`Ephemeral message sent to ${receiverId}`);
    return response;
  } catch (error) {
    console.error(`Failed to send ephemeral message:`, error);
    throw error;
  }
}
```

**Tham số cho `channel.send()`:**

- `content`: `ChannelMessageContent` - Đối tượng nội dung tin nhắn
- `mentions?`: `ApiMessageMention[]` - Mảng mention người dùng
- `attachments?`: `ApiMessageAttachment[]` - Mảng tệp đính kèm
- `mention_everyone?`: `boolean` - Có mention mọi người trong kênh hay không
- `anonymous_message?`: `boolean` - Có gửi ẩn danh hay không
- `topic_id?`: `string` - Định danh chủ đề/thread
- `code?`: `number` - Mã loại tin nhắn (mặc định: 0)

## Làm việc với Tin nhắn

Class `Message` cho phép bạn tương tác với tin nhắn hiện có trong kênh.

### Lấy Tin nhắn

Bạn có thể lấy tin nhắn từ cache tin nhắn của kênh hoặc từ cơ sở dữ liệu cục bộ.

```typescript
async function getMessage(channel: TextChannel, messageId: string) {
  try {
    // Fetch message from channel's cache (will load from DB if not in cache)
    const message = await channel.messages.fetch(messageId);
    
    console.log(`Message ID: ${message.id}`);
    console.log(`Sender: ${message.sender_id}`);
    console.log(`Content:`, message.content);
    console.log(`Created:`, new Date(message.create_time_seconds! * 1000));
    
    return message;
  } catch (error) {
    console.error(`Failed to fetch message ${messageId}:`, error);
    throw error;
  }
}
```

**Tham số**

- `messageId`: Chuỗi đại diện định danh duy nhất của tin nhắn.

**Giá trị trả về**

- `message`: Đối tượng `Message` với các phương thức trả lời, cập nhật, xóa và reaction.

### Trả lời Tin nhắn

Bạn có thể trả lời tin nhắn hiện có, tạo tham chiếu tới tin nhắn gốc.

```typescript
import { ChannelMessageContent } from 'mezon-sdk';

async function replyToMessage(originalMessage: Message, replyText: string) {
  try {
    const content: ChannelMessageContent = {
      t: replyText
    };
    
    const response = await originalMessage.reply(content);
    console.log(`Replied to message ${originalMessage.id}`);
    return response;
  } catch (error) {
    console.error(`Failed to reply to message ${originalMessage.id}:`, error);
    throw error;
  }
}

// Reply with mentions and attachments
async function replyWithExtras(
  originalMessage: Message, 
  replyText: string,
  mentionUserIds: string[] = [],
  attachments: ApiMessageAttachment[] = []
) {
  try {
    const content: ChannelMessageContent = {
      t: replyText
    };

    const mentions: ApiMessageMention[] = mentionUserIds.map(userId => ({
      user_id: userId
    }));

    const response = await originalMessage.reply(
      content,
      mentions.length > 0 ? mentions : undefined,
      attachments.length > 0 ? attachments : undefined,
      false, // mention_everyone
      false, // anonymous_message
      undefined, // topic_id (will use original message's topic)
      0 // code
    );

    console.log(`Reply sent with ${mentions.length} mentions and ${attachments.length} attachments`);
    return response;
  } catch (error) {
    console.error(`Failed to send reply with extras:`, error);
    throw error;
  }
}
```

**Tham số cho `message.reply():`**

- `content`: `ChannelMessageContent` - Nội dung trả lời
- `mentions?`: `ApiMessageMention[]` - Người dùng cần mention trong trả lời
- `attachments?`: `ApiMessageAttachment[]` - Tệp đính kèm
- `mention_everyone?`: `boolean` - Có mention mọi người hay không
- `anonymous_message?`: `boolean` - Có trả lời ẩn danh hay không
- `topic_id?`: `string` - Topic ID (mặc định là topic của tin nhắn gốc)
- `code?`: `number` - Mã loại tin nhắn

Trả lời tự động bao gồm tham chiếu tới tin nhắn gốc, hiển thị thông tin và nội dung người gửi ban đầu.

### Cập nhật Tin nhắn

Bạn có thể cập nhật tin nhắn mà bot đã gửi (thường chỉ tin nhắn của chính bot mới được cập nhật).

```typescript
async function updateMessage(message: Message, newText: string) {
  try {
    const newContent: ChannelMessageContent = {
      t: newText
    };
    
    const response = await message.update(newContent);
    console.log(`Message ${message.id} updated successfully`);
    return response;
  } catch (error) {
    console.error(`Failed to update message ${message.id}:`, error);
    throw error;
  }
}

// Update with mentions and attachments
async function updateMessageWithExtras(
  message: Message,
  newText: string,
  mentions: ApiMessageMention[] = [],
  attachments: ApiMessageAttachment[] = []
) {
  try {
    const newContent: ChannelMessageContent = {
      t: newText
    };
    
    const response = await message.update(
      newContent,
      mentions,
      attachments,
      message.topic_id // Keep the same topic_id
    );
    
    console.log(`Message ${message.id} updated with ${mentions.length} mentions and ${attachments.length} attachments`);
    return response;
  } catch (error) {
    console.error(`Failed to update message with extras:`, error);
    throw error;
  }
}
```

**Tham số cho `message.update()`:**

- `content`: `ChannelMessageContent` - Nội dung tin nhắn mới
- `mentions?`: `ApiMessageMention[]` - Mention đã cập nhật
- `attachments?`: `ApiMessageAttachment[]` - Tệp đính kèm đã cập nhật  
- `topic_id?`: `string` - Topic ID (mặc định là topic của tin nhắn gốc)

:::note
Thường chỉ tin nhắn do bot gửi mới được cập nhật. Thao tác cập nhật giữ nguyên ID và timestamp gốc nhưng thay đổi nội dung.
:::

### Reaction Tin nhắn

Bạn có thể thêm hoặc gỡ emoji reaction khỏi tin nhắn.

```typescript
import { ReactMessagePayload } from 'mezon-sdk';

async function addReaction(message: Message, emoji: string, emojiId: string = '') {
  try {
    const reactData: ReactMessagePayload = {
      emoji_id: emojiId || emoji, // Use emoji as ID if no specific ID provided
      emoji: emoji,
      count: 1, // This will be managed by the server
      action_delete: false // false to add reaction, true to remove
    };

    const response = await message.react(reactData);
    console.log(`Added reaction ${emoji} to message ${message.id}`);
    return response;
  } catch (error) {
    console.error(`Failed to add reaction to message ${message.id}:`, error);
    throw error;
  }
}

async function removeReaction(message: Message, emoji: string, emojiId: string = '') {
  try {
    const reactData: ReactMessagePayload = {
      emoji_id: emojiId || emoji,
      emoji: emoji,
      count: 1,
      action_delete: true // true to remove the reaction
    };

    const response = await message.react(reactData);
    console.log(`Removed reaction ${emoji} from message ${message.id}`);
    return response;
  } catch (error) {
    console.error(`Failed to remove reaction from message ${message.id}:`, error);
    throw error;
  }
}

// Toggle reaction (add if not present, remove if present)
async function toggleReaction(message: Message, emoji: string, emojiId: string = '') {
  try {
    // Check if user already reacted with this emoji
    const existingReaction = message.reactions?.find(r => 
      r.emoji === emoji && r.sender_id === this.client.clientId
    );

    if (existingReaction) {
      return await removeReaction(message, emoji, emojiId);
    } else {
      return await addReaction(message, emoji, emojiId);
    }
  } catch (error) {
    console.error(`Failed to toggle reaction:`, error);
    throw error;
  }
}
```

**Tham số cho `message.react()`:**

- `dataReactMessage`: Đối tượng `ReactMessagePayload` chứa:
  - `emoji_id`: `string` - Định danh duy nhất của emoji (có thể trùng emoji cho reaction đơn giản)
  - `emoji`: `string` - Ký tự emoji (ví dụ: '👍', '❤️', '😂')
  - `count`: `number` - Số lượng reaction (do máy chủ quản lý, thường đặt là 1)
  - `action_delete?`: `boolean` - `true` để gỡ reaction, `false` để thêm (mặc định: false)
  - `id?`: `string` - ID reaction tùy chọn để theo dõi

**Ví dụ dùng phổ biến:**
```typescript
// Add thumbs up
await addReaction(message, '👍');

// Add custom emoji (if you have the emoji ID)
await addReaction(message, ':custom_emoji:', 'custom_emoji_id_123');

// Remove a reaction
await removeReaction(message, '👍');
```

### Xóa Tin nhắn

Bạn có thể xóa tin nhắn mà bot đã gửi (thường chỉ tin nhắn của chính bot mới được xóa).

```typescript
async function deleteMessage(message: Message) {
  try {
    const response = await message.delete();
    console.log(`Message ${message.id} deleted successfully`);
    return response;
  } catch (error) {
    console.error(`Failed to delete message ${message.id}:`, error);
    throw error;
  }
}

// Delete with confirmation
async function deleteMessageWithConfirmation(message: Message, confirmationText?: string) {
  try {
    if (confirmationText) {
      console.log(`Deleting message: "${confirmationText}"`);
    }
    
    const response = await message.delete();
    console.log(`Message ${message.id} has been deleted`);
    
    // The message will be removed from the channel and cache
    return response;
  } catch (error) {
    console.error(`Failed to delete message ${message.id}:`, error);
    throw error;
  }
}

// Example usage in a command handler
async function handleDeleteCommand(message: Message) {
  // Only delete if the message was sent by the bot
  if (message.sender_id === this.client.clientId) {
    await deleteMessage(message);
  } else {
    console.log("Cannot delete messages from other users");
  }
}
```

**Tham số:**
- Không có — phương thức `delete()` không yêu cầu tham số

**Giá trị trả về:**
- Trả về đối tượng phản hồi xác nhận việc xóa

**Lưu ý:** 
- Thường chỉ tin nhắn do bot gửi mới được xóa
- Tin nhắn đã xóa bị gỡ khỏi kênh và cache cục bộ
- Việc xóa là vĩnh viễn và không thể hoàn tác

### Tin nhắn Tương tác {#interactive-messages}

Mezon SDK cung cấp công cụ mạnh để tạo tin nhắn tương tác với nút, form và thành phần phong phú. Để biết tài liệu chi tiết về tin nhắn tương tác, xem [Hướng dẫn Tin nhắn Tương tác](../../mezon-topics/interactive-message).

**Ví dụ nhanh:**

```typescript
import { InteractiveBuilder, ButtonBuilder, EButtonMessageStyle } from "mezon-sdk";

async function sendInteractiveForm(channel: TextChannel) {
  // Create an interactive form
  const form = new InteractiveBuilder("Registration Form")
    .setDescription("Please fill out the form below")
    .addInputField("username", "Username", "Enter your username")
    .addInputField("email", "Email", "your@email.com", { type: "email" })
    .addSelectField("country", "Country", [
      { label: "United States", value: "us" },
      { label: "United Kingdom", value: "uk" },
      { label: "Canada", value: "ca" }
    ])
    .build();

  // Create action buttons
  const buttons = new ButtonBuilder()
    .addButton("submit", "Submit", EButtonMessageStyle.PRIMARY)
    .addButton("cancel", "Cancel", EButtonMessageStyle.SECONDARY)
    .build();

  // Send the interactive message
  await channel.send({
    embed: [form],
    components: buttons
  });
}

// Handle button clicks
client.onMessageButtonClicked((event) => {
  console.log("Button clicked:", event.id);
  // Handle the action
});
```

Để xem thêm ví dụ và tài liệu đầy đủ về:
- Xây dựng form với trường nhập liệu
- Tạo dropdown select và radio button
- Thêm date picker và animation
- Xử lý tương tác người dùng
- Thực hành tốt cho tin nhắn tương tác

Xem [Hướng dẫn Tin nhắn Tương tác](../../mezon-topics/interactive-message) đầy đủ.

## Làm việc với Người dùng

Class `User` cung cấp phương thức tương tác với người dùng trên nền tảng Mezon, bao gồm nhắn tin trực tiếp và chuyển token.

### Lấy Người dùng

Người dùng được cache trong clan. Dùng clan ID "0" cho thao tác DM hoặc clan ID cụ thể cho dữ liệu người dùng theo clan.

```typescript
async function getUser(client: MezonClient, userId: string, clanId: string = "0") {
  try {
    // Get the clan (use "0" for DM operations)
    const clan = client.clans.get(clanId);
    if (!clan) {
      throw new Error(`Clan ${clanId} not found`);
    }

    // Fetch user from clan's user cache
    const user = await clan.users.fetch(userId);
    console.log(`User: ${user.display_name || user.username || user.id}`);
    console.log(`Avatar: ${user.avartar}`);
    console.log(`Clan Nick: ${user.clan_nick}`);
    console.log(`DM Channel ID: ${user.dmChannelId}`);
    
    return user;
  } catch (error) {
    console.error(`Failed to fetch user ${userId}:`, error);
    throw error;
  }
}

// Get user from DM context (most common for bot interactions)
async function getDMUser(client: MezonClient, userId: string) {
  return await getUser(client, userId, "0"); // "0" is the DM clan
}
```

**Tham số:**

- `userId`: String - Định danh duy nhất của người dùng
- `clanId`: String - Clan ID ("0" cho thao tác DM)

**Giá trị trả về:**

- `user`: Đối tượng `User` với phương thức nhắn tin trực tiếp, chuyển token và truy cập thông tin người dùng.

### Gửi Tin nhắn Trực tiếp

Bạn có thể gửi tin nhắn trực tiếp qua phương thức `User.sendDM()`, tự động xử lý tạo kênh DM.

```typescript
import { ChannelMessageContent, TypeMessage } from 'mezon-sdk';

async function sendDMToUser(
  client: MezonClient,
  recipientUserId: string,
  messageText: string
) {
  try {
    // Get user from DM clan (clan "0")
    const dmClan = client.clans.get('0');
    if (!dmClan) {
      throw new Error('DM clan not available');
    }
    
    const user = await dmClan.users.fetch(recipientUserId);
    
    const content: ChannelMessageContent = {
      t: messageText
    };
    
    const response = await user.sendDM(content);
    console.log(`DM sent to user ${recipientUserId}`);
    return response;
  } catch (error) {
    console.error(`Failed to send DM to user ${recipientUserId}:`, error);
    throw error;
  }
}

// Send DM with special message type
async function sendSpecialDM(
  client: MezonClient,
  recipientUserId: string,
  content: ChannelMessageContent,
  messageType: TypeMessage = TypeMessage.Chat
) {
  try {
    const dmClan = client.clans.get('0');
    if (!dmClan) {
      throw new Error('DM clan not available');
    }
    
    const user = await dmClan.users.fetch(recipientUserId);
    const response = await user.sendDM(content, messageType);
    
    console.log(`Special DM sent to ${recipientUserId} with type ${messageType}`);
    return response;
  } catch (error) {
    console.error(`Failed to send special DM:`, error);
    throw error;
  }
}

// Create DM channel manually (usually not needed as sendDM handles this)
async function createDMChannel(client: MezonClient, userId: string) {
  try {
    const dmChannel = await client.createDMchannel(userId);
    if (dmChannel) {
      console.log(`DM channel created: ${dmChannel.channel_id}`);
      return dmChannel;
    }
  } catch (error) {
    console.error(`Failed to create DM channel with user ${userId}:`, error);
    throw error;
  }
}
```

**Tính năng chính:**
- **Tự động tạo kênh DM**: Phương thức `sendDM()` tự tạo kênh DM nếu chưa có
- **Hỗ trợ loại tin nhắn**: Bạn có thể chỉ định loại tin nhắn khác nhau bằng enum `TypeMessage`
- **Nội dung linh hoạt**: Hỗ trợ nội dung phong phú qua interface `ChannelMessageContent`

**Ví dụ sử dụng:**
```typescript
// Simple text DM
await sendDMToUser(client, 'user123', 'Hello! This is a direct message.');

// DM with token transfer message type
await sendSpecialDM(client, 'user123', { t: 'Payment received!' }, TypeMessage.SendToken);
```

## Làm việc với Clan

Class `Clan` đại diện server/cộng đồng trên nền tảng Mezon và cung cấp truy cập kênh, người dùng cùng thao tác theo clan.

### Lấy Dữ liệu Clan

Clan được cache tự động khi client kết nối. Bạn có thể truy cập từ cache của client.

```typescript
async function getClanInfo(client: MezonClient, clanId: string) {
  try {
    // Get clan from cache
    let clan = client.clans.get(clanId);

    if (!clan) {
      // Try to fetch if not in cache
      try {
        clan = await client.clans.fetch(clanId);
      } catch (fetchError) {
        console.log(`Clan ${clanId} not found or not accessible`);
        return null;
      }
    }

    console.log(`Clan Name: ${clan.name}`);
    console.log(`Clan ID: ${clan.id}`);
    
    // Load channels if not already loaded
    await clan.loadChannels();
    
    console.log(`Channels: ${clan.channels.cache?.size || 0}`);
    console.log(`Users: ${clan.users.cache?.size || 0}`);

    // List channels in the clan
    const channelEntries = Array.from(clan.channels.cache?.entries() || []);
    channelEntries.forEach(([channelId, channel]) => {
      console.log(`  - Channel: ${channel.name} (ID: ${channelId})`);
      console.log(`    Type: ${channel.channel_type}, Private: ${channel.is_private}`);
    });

    return clan;
  } catch (error) {
    console.error(`Failed to get info for clan ${clanId}:`, error);
    return null;
  }
}

// List all available clans
function listAllClans(client: MezonClient) {
  console.log("Available Clans:");
  const clanEntries = Array.from(client.clans.cache?.entries() || []);
  
  if (clanEntries.length === 0) {
    console.log("  No clans available");
    return;
  }

  clanEntries.forEach(([clanId, clan]) => {
    console.log(`  - ${clan.name} (ID: ${clanId})`);
  });
}

// Get the DM "clan" (special clan with ID "0")
function getDMClan(client: MezonClient) {
  const dmClan = client.clans.get("0");
  if (dmClan) {
    console.log("DM Clan available for direct messaging");
    console.log(`DM Users: ${dmClan.users.cache?.size || 0}`);
    return dmClan;
  } else {
    console.log("DM Clan not available");
    return null;
  }
}

// Wait for client to be ready and list clans
client.on("ready", async () => {
  console.log("Client ready, listing clans:");
  listAllClans(client);
  
  // Get info for the first available clan
  const clanEntries = Array.from(client.clans.cache?.entries() || []);
  if (clanEntries.length > 0 && clanEntries[0][0] !== "0") {
    await getClanInfo(client, clanEntries[0][0]);
  }
  
  // Check DM functionality
  getDMClan(client);
});
```

### Thuộc tính và Phương thức Clan

```typescript
// Access clan properties
function exploreClan(clan: Clan) {
  console.log("Clan Properties:");
  console.log(`  ID: ${clan.id}`);
  console.log(`  Name: ${clan.name}`);
  console.log(`  Welcome Channel: ${clan.welcome_channel_id}`);
  
  // Access cached collections
  console.log(`  Channels Cache Size: ${clan.channels.cache?.size || 0}`);
  console.log(`  Users Cache Size: ${clan.users.cache?.size || 0}`);
  
  // Get client ID (bot's user ID)
  const clientId = clan.getClientId();
  console.log(`  Client ID: ${clientId}`);
}
```

**Tính năng chính:**
- **Cache tự động**: Clan được cache sau khi đăng nhập
- **Quản lý kênh**: Truy cập mọi kênh clan qua `clan.channels`
- **Quản lý người dùng**: Truy cập thành viên clan qua `clan.users`
- **Hỗ trợ DM**: Clan đặc biệt với ID "0" xử lý nhắn tin trực tiếp
- **Tải động**: Kênh có thể tải theo nhu cầu qua `loadChannels()`

## Xử lý Sự kiện {#handling-events}

`MezonClient` cung cấp xử lý sự kiện toàn diện qua các phương thức lắng nghe sự kiện chuyên dụng. Mọi sự kiện được xử lý và cache tự động phù hợp.

### Lắng nghe Tin nhắn

```typescript
import { ChannelMessage } from 'mezon-sdk';

// Listen to all channel messages
client.onChannelMessage(async (message: ChannelMessage) => {
  console.log(`New message from ${message.username} in channel ${message.channel_id}`);
  console.log(`Content: ${message.content?.t}`);
  console.log(`Clan: ${message.clan_id}, Sender: ${message.sender_id}`);

  // Basic auto-reply bot
  if (
    message.sender_id !== client.clientId &&
    message.content?.t?.toLowerCase() === "!hello"
  ) {
    // Get the channel and reply
    try {
      const channel = await client.channels.fetch(message.channel_id);
      await channel.send({
        t: `Hello there, ${message.username || message.display_name}!`
      });
    } catch (error) {
      console.error("Failed to send reply:", error);
    }
  }

  // Handle mentions
  if (message.mentions?.some(mention => mention.user_id === client.clientId)) {
    console.log("Bot was mentioned in the message!");
  }
});

// Listen to message reactions
client.onMessageReaction((reaction) => {
  console.log(`Reaction ${reaction.emoji} added to message ${reaction.message_id}`);
  console.log(`By user: ${reaction.sender_id}`);
});
```

### Lắng nghe Sự kiện Kênh

```typescript
import { ChannelCreatedEvent, ChannelUpdatedEvent, ChannelDeletedEvent } from 'mezon-sdk';

// Listen to channel creation
client.onChannelCreated((event: ChannelCreatedEvent) => {
  console.log(`New channel created: ${event.channel_label} (ID: ${event.channel_id})`);
  console.log(`Type: ${event.channel_type}, Clan: ${event.clan_id}`);
});

// Listen to channel updates
client.onChannelUpdated((event: ChannelUpdatedEvent) => {
  console.log(`Channel updated: ${event.channel_label} (ID: ${event.channel_id})`);
  
  // Handle thread activation
  if (event.channel_type === ChannelType.CHANNEL_TYPE_THREAD && event.status === 1) {
    console.log("Thread was activated");
  }
});

// Listen to channel deletion
client.onChannelDeleted((event: ChannelDeletedEvent) => {
  console.log(`Channel deleted: ${event.channel_id} from clan ${event.clan_id}`);
});
```

### Lắng nghe Sự kiện Người dùng

```typescript
import { 
  UserChannelAddedEvent, 
  UserChannelRemoved, 
  AddClanUserEvent,
  UserClanRemovedEvent 
} from 'mezon-sdk';

// Listen to users added to channels
client.onUserChannelAdded((event: UserChannelAddedEvent) => {
  console.log(`Users added to channel ${event.channel_desc.channel_id}`);
  
  // Check if bot was added to the channel
  const botAdded = event.users?.some(user => user.user_id === client.clientId);
  if (botAdded) {
    console.log("Bot was added to a new channel!");
  }
});

// Listen to users added to clan
client.onAddClanUser((event: AddClanUserEvent) => {
  console.log(`User ${event.user.username} joined clan ${event.clan_id}`);
  
  if (event.user.user_id === client.clientId) {
    console.log("Bot joined a new clan!");
  }
});

// Listen to user removal from clan
client.onUserClanRemoved((event: UserClanRemovedEvent) => {
  console.log(`${event.user_ids.length} users removed from clan ${event.clan_id}`);
});
```

### Sự kiện Xã hội và Tương tác

```typescript
import { 
  TokenSentEvent, 
  GiveCoffeeEvent, 
  MessageButtonClicked,
  DropdownBoxSelected 
} from 'mezon-sdk';

// Listen to token transfers
client.onTokenSend((event: TokenSentEvent) => {
  console.log(`Token transfer: ${event.amount} from ${event.sender_id} to ${event.receiver_id}`);
  console.log(`Note: ${event.note}`);
});

// Listen to coffee giving events
client.onGiveCoffee((event: GiveCoffeeEvent) => {
  console.log("Someone gave coffee!");
});

// Listen to button clicks on interactive messages
client.onMessageButtonClicked((event: MessageButtonClicked) => {
  console.log(`Button clicked on message ${event.message_id}`);
  console.log(`Button ID: ${event.button_id}, User: ${event.user_id}`);
});

// Listen to dropdown selections
client.onDropdownBoxSelected((event: DropdownBoxSelected) => {
  console.log(`Dropdown selected on message ${event.message_id}`);
  console.log(`Selected values:`, event.values);
});
```

### Sự kiện Thoại và Video

```typescript
import { 
  VoiceStartedEvent, 
  VoiceJoinedEvent, 
  StreamingJoinedEvent,
  WebrtcSignalingFwd 
} from 'mezon-sdk';

// Listen to voice events
client.onVoiceStartedEvent((event: VoiceStartedEvent) => {
  console.log("Voice session started");
});

client.onVoiceJoinedEvent((event: VoiceJoinedEvent) => {
  console.log("User joined voice channel");
});

// Listen to streaming events
client.onStreamingJoinedEvent((event: StreamingJoinedEvent) => {
  console.log(`User ${event.user_id} joined streaming in clan ${event.clan_id}`);
});

// Listen to WebRTC signaling (for direct calls)
client.onWebrtcSignalingFwd((event: WebrtcSignalingFwd) => {
  console.log("WebRTC signaling event received");
});
```

### Sự kiện Thông báo

```typescript
import { Notifications, RoleEvent, RoleAssignedEvent } from 'mezon-sdk';

// Listen to notifications (including friend requests)
client.onNotification((event: Notifications) => {
  console.log(`Received ${event.notifications?.length || 0} notifications`);
  
  event.notifications?.forEach(notification => {
    if (notification.code === -2) {
      console.log("Friend request received");
    }
  });
});

// Listen to role events
client.onRoleEvent((event: RoleEvent) => {
  console.log("Role event occurred");
});

client.onRoleAssign((event: RoleAssignedEvent) => {
  console.log("Role assigned to user");
});
```

**Tính năng chính:**
- **Cache tự động**: Sự kiện tự cập nhật cache cục bộ
- **An toàn kiểu**: Mọi sự kiện được gõ kiểu đúng bằng interface TypeScript
- **Thiết lập đơn giản**: Chỉ cần gọi phương thức để đăng ký trình lắng nghe
- **Phủ sóng toàn diện**: Sự kiện cho tin nhắn, kênh, người dùng, thoại, tương tác xã hội và hơn thế nữa

## Tính năng Xã hội

### Chuyển Token

Mezon SDK hỗ trợ gửi tiền ảo/token giữa người dùng.

```typescript
import { TokenSentEvent, SendTokenData } from 'mezon-sdk';

// Send tokens to a user
async function sendTokensToUser(
  client: MezonClient,
  recipientUserId: string,
  amount: number,
  note: string = ""
) {
  try {
    const tokenData: APISentTokenRequest = {
      receiver_id: recipientUserId,
      amount: amount,
      note: note,
      sender_name: "Bot Name", // Optional sender display name
      extra_attribute: "" // Optional additional metadata
    };

    const response = await client.sendToken(tokenData);
    
    if (response.ok) {
      console.log(`✅ Sent ${amount} tokens to ${recipientUserId}`);
      console.log(`Transaction hash: ${response.tx_hash}`);
    } else {
      console.error(`❌ Token transfer failed: ${response.error}`);
    }
    
    return response;
  } catch (error) {
    console.error("Failed to send tokens:", error);
    throw error;
  }
}

// Send tokens via User object
async function sendTokensViaUser(user: User, amount: number, note: string = "") {
  try {
    const sendTokenData: SendTokenData = {
      amount: amount,
      note: note,
      extra_attribute: ""
    };

    const response = await user.sendToken(sendTokenData);
    console.log(`Sent ${amount} tokens to user ${user.id}`);
    return response;
  } catch (error) {
    console.error("Failed to send tokens via user:", error);
    throw error;
  }
}

// Example usage
client.on("ready", async () => {
  // Send 1000 tokens to a user
  await sendTokensToUser(client, "user123", 1000, "Payment for services");
});
```

### Quản lý Bạn bè

SDK cung cấp phương thức quản lý quan hệ bạn bè.

```typescript
// Get list of friends
async function getFriends(client: MezonClient, limit: number = 50) {
  try {
    const friends = await client.getListFriends(limit);
    console.log(`Found ${friends?.friends?.length || 0} friends`);
    
    friends?.friends?.forEach(friend => {
      console.log(`Friend: ${friend.user?.username} (${friend.user?.id})`);
      console.log(`Status: ${friend.state}`);
    });
    
    return friends;
  } catch (error) {
    console.error("Failed to get friends list:", error);
    throw error;
  }
}

// Add a friend by username
async function addFriend(client: MezonClient, username: string) {
  try {
    const response = await client.addFriend(username);
    console.log(`Friend request sent to ${username}`);
    return response;
  } catch (error) {
    console.error(`Failed to add friend ${username}:`, error);
    throw error;
  }
}

// Accept a friend request
async function acceptFriendRequest(client: MezonClient, userId: string, username: string) {
  try {
    const response = await client.acceptFriend(userId, username);
    console.log(`Accepted friend request from ${username}`);
    return response;
  } catch (error) {
    console.error(`Failed to accept friend request from ${username}:`, error);
    throw error;
  }
}

// Handle friend request notifications
client.onNotification((event) => {
  event.notifications?.forEach(async (notification) => {
    if (notification.code === -2) {
      // This is a friend request
      const content = JSON.parse(notification.content || "{}");
      console.log(`Friend request from: ${content.username}`);
      
      // Auto-accept friend requests (optional)
      try {
        await acceptFriendRequest(client, notification.sender_id!, content.username);
      } catch (error) {
        console.error("Failed to auto-accept friend request:", error);
      }
    }
  });
});
```

### Thành phần Tin nhắn Tương tác

Xử lý các phần tử tương tác trong tin nhắn như nút và dropdown.

```typescript
import { 
  MessageButtonClicked, 
  DropdownBoxSelected, 
  QuickMenuEvent 
} from 'mezon-sdk';

// Handle button clicks
client.onMessageButtonClicked((event: MessageButtonClicked) => {
  console.log(`Button clicked: ${event.button_id}`);
  console.log(`Message: ${event.message_id}, User: ${event.user_id}`);
  
  // Respond to specific button clicks
  switch (event.button_id) {
    case 'approve':
      console.log("Approval button clicked");
      break;
    case 'reject':
      console.log("Reject button clicked");
      break;
    default:
      console.log(`Unknown button: ${event.button_id}`);
  }
});

// Handle dropdown selections
client.onDropdownBoxSelected((event: DropdownBoxSelected) => {
  console.log(`Dropdown selection in message ${event.message_id}`);
  console.log(`Selected values:`, event.values);
  console.log(`Selectbox ID: ${event.selectbox_id}`);
});

// Handle quick menu events
client.onQuickMenuEvent((event: QuickMenuEvent) => {
  console.log("Quick menu event triggered");
});
```

### Ví dụ Bot Hoàn chỉnh

Dưới đây là ví dụ hoàn chỉnh kết hợp nhiều tính năng:

```typescript
import { MezonClient, ChannelMessage, TypeMessage } from 'mezon-sdk';

async function createBot() {
  const client = new MezonClient("YOUR_BOT_TOKEN");

  // Handle ready event
  client.on("ready", async () => {
    console.log("Bot is ready!");
    console.log(`Client ID: ${client.clientId}`);
    
    // List available clans
    const clanEntries = Array.from(client.clans.cache?.entries() || []);
    console.log(`Connected to ${clanEntries.length} clans`);
  });

  // Handle messages
  client.onChannelMessage(async (message: ChannelMessage) => {
    // Ignore bot's own messages
    if (message.sender_id === client.clientId) return;

    const content = message.content?.t || "";
    console.log(`Message from ${message.username}: ${content}`);

    // Command handling
    if (content.startsWith("!")) {
      const channel = await client.channels.fetch(message.channel_id);
      
      if (content === "!ping") {
        await channel.send({ t: "Pong! 🏓" });
      }
      
      else if (content === "!hello") {
        await channel.send({ 
          t: `Hello ${message.display_name || message.username}! 👋` 
        });
      }
      
      else if (content.startsWith("!dm ")) {
        const dmMessage = content.substring(4);
        try {
          const dmClan = client.clans.get("0");
          const user = await dmClan!.users.fetch(message.sender_id);
          await user.sendDM({ t: dmMessage });
          await channel.send({ t: "DM sent! 📩" });
        } catch (error) {
          await channel.send({ t: "Failed to send DM ❌" });
        }
      }
    }
  });

  // Handle token transfers
  client.onTokenSend((event) => {
    console.log(`Token transfer: ${event.amount} tokens`);
    console.log(`From: ${event.sender_id} to ${event.receiver_id}`);
    console.log(`Note: ${event.note}`);
  });

  // Handle friend requests
  client.onNotification(async (event) => {
    for (const notification of event.notifications || []) {
      if (notification.code === -2) {
        const content = JSON.parse(notification.content || "{}");
        console.log(`Friend request from: ${content.username}`);
        
        // Auto-accept friend requests
        try {
          await client.acceptFriend(notification.sender_id!, content.username);
          console.log(`Accepted friend request from ${content.username}`);
        } catch (error) {
          console.error("Failed to accept friend request:", error);
        }
      }
    }
  });

  // Start the bot
  try {
    await client.login();
    console.log("Bot logged in successfully!");
  } catch (error) {
    console.error("Failed to login:", error);
  }

  return client;
}

// Run the bot
createBot().catch(console.error);
```
