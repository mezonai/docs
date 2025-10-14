---
sidebar_position: 4
---

# Usage and Examples

Below are examples demonstrating how to use common features of the `mezon-sdk`.
All examples assume you have installed and imported the `MezonClient` and other necessary types.

```typescript
import { MezonClient } from "mezon-sdk";
```

## Initializing the Client

The `MezonClient` is the main entry point. You need to provide a token and optionally configure connection details.

```typescript
import { MezonClient } from "mezon-sdk";

// Initialize with token and optional connection parameters
const client = new MezonClient(
  "<YOUR_BOT_TOKEN>", // Your bot or application token
  "gw.mezon.ai", // Default host - usually you don't need to change this
  "443", // Default port
  true, // Use SSL (true for HTTPS/WSS)
  7000 // Timeout in milliseconds
);

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

### Find Clan and Channel

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

## Authentication

### Login with Token

The `MezonClient.login()` method handles the complete authentication flow, including dynamic endpoint resolution and establishing WebSocket connections.

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

### Logout and Cleanup

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

## Working with Channels

### Fetching a Channel

The `MezonClient` provides cached access to channels through the `channels` cache manager. You can fetch channels by their ID.

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

**Parameters**

- `channelId`: A string representing the unique identifier of the channel.

**Return Value**

- `channel`: A `TextChannel` object with methods for sending messages, managing message history, and accessing channel properties.

### Send a Message to a Channel

Once you have a `TextChannel` object, you can send messages with various content types and options.

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

**Parameters for `channel.send()`:**

- `content`: `ChannelMessageContent` - The message content object
- `mentions?`: `ApiMessageMention[]` - Array of user mentions
- `attachments?`: `ApiMessageAttachment[]` - Array of file attachments
- `mention_everyone?`: `boolean` - Whether to mention everyone in channel
- `anonymous_message?`: `boolean` - Whether to send anonymously
- `topic_id?`: `string` - Topic/thread identifier
- `code?`: `number` - Message type code (default: 0)

## Working with Messages

The `Message` class allows you to interact with existing messages within channels.

### Fetching a Message

You can retrieve messages from a channel's message cache or from the local database.

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

**Parameters**

- `messageId`: A string representing the unique identifier of the message.

**Return Value**

- `message`: A `Message` object with methods for replying, updating, deleting, and reacting to the message.

### Replying to a Message

You can reply to existing messages, which creates a reference to the original message.

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

**Parameters for `message.reply():`**

- `content`: `ChannelMessageContent` - The reply content
- `mentions?`: `ApiMessageMention[]` - Users to mention in the reply
- `attachments?`: `ApiMessageAttachment[]` - Files to attach
- `mention_everyone?`: `boolean` - Whether to mention everyone
- `anonymous_message?`: `boolean` - Whether to reply anonymously
- `topic_id?`: `string` - Topic ID (defaults to original message's topic)
- `code?`: `number` - Message type code

The reply automatically includes a reference to the original message, showing the original sender's information and content.

### Updating a Message

You can update existing messages that your bot has sent (typically only your own messages can be updated).

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

**Parameters for `message.update()`:**

- `content`: `ChannelMessageContent` - The new message content
- `mentions?`: `ApiMessageMention[]` - Updated mentions
- `attachments?`: `ApiMessageAttachment[]` - Updated attachments  
- `topic_id?`: `string` - Topic ID (defaults to original message's topic)

:::note
Only messages sent by your bot can typically be updated. The update preserves the original message ID and timestamp but changes the content.
:::

### Reacting to a Message

You can add or remove emoji reactions from messages.

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
      r.emoji === emoji && r.sender_id === message.channel.clan.getClientId()
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

**Parameters for `message.react()`:**

- `dataReactMessage`: `ReactMessagePayload` object containing:
  - `emoji_id`: `string` - Unique identifier for the emoji (can be same as emoji for simple reactions)
  - `emoji`: `string` - The emoji character (e.g., '👍', '❤️', '😂')
  - `count`: `number` - Reaction count (managed by server, usually set to 1)
  - `action_delete?`: `boolean` - `true` to remove reaction, `false` to add (default: false)
  - `id?`: `string` - Optional reaction ID for tracking

**Common Usage Examples:**
```typescript
// Add thumbs up
await addReaction(message, '👍');

// Add custom emoji (if you have the emoji ID)
await addReaction(message, ':custom_emoji:', 'custom_emoji_id_123');

// Remove a reaction
await removeReaction(message, '👍');
```

### Deleting a Message

You can delete messages that your bot has sent (typically only your own messages can be deleted).

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
  if (message.sender_id === message.channel.clan.getClientId()) {
    await deleteMessage(message);
  } else {
    console.log("Cannot delete messages from other users");
  }
}
```

**Parameters:**
- None - the `delete()` method doesn't require any parameters

**Return Value:**
- Returns a response object confirming the deletion

**Note:** 
- Only messages sent by your bot can typically be deleted
- Deleted messages are removed from the channel and local cache
- The deletion is permanent and cannot be undone

## Working with Users

The `User` class provides methods for interacting with users on the Mezon platform, including direct messaging and token transfers.

### Fetching a User

Users are cached within clans. Use clan ID "0" for DM operations or the specific clan ID for clan-specific user data.

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

**Parameters:**

- `userId`: String - The unique identifier of the user
- `clanId`: String - The clan ID ("0" for DM operations)

**Return Value:**

- `user`: A `User` object with methods for direct messaging, token transfers, and user information access.

### Sending a Direct Message

You can send direct messages to users through the `User.sendDM()` method, which automatically handles DM channel creation.

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

**Key Features:**
- **Automatic DM Channel Creation**: The `sendDM()` method automatically creates a DM channel if one doesn't exist
- **Message Type Support**: You can specify different message types using the `TypeMessage` enum
- **Content Flexibility**: Supports rich content through the `ChannelMessageContent` interface

**Usage Examples:**
```typescript
// Simple text DM
await sendDMToUser(client, 'user123', 'Hello! This is a direct message.');

// DM with token transfer message type
await sendSpecialDM(client, 'user123', { t: 'Payment received!' }, TypeMessage.SendToken);
```

## Working with Clans

The `Clan` class represents servers/communities on the Mezon platform and provides access to channels, users, and clan-specific operations.

### Fetching Clan Data

Clans are automatically cached when the client connects. You can access them from the client's cache.

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

### Clan Properties and Methods

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

**Key Features:**
- **Automatic Caching**: Clans are cached after login
- **Channel Management**: Access to all clan channels through `clan.channels`
- **User Management**: Access to clan members through `clan.users`
- **DM Support**: Special clan with ID "0" handles direct messaging
- **Dynamic Loading**: Channels can be loaded on-demand via `loadChannels()`

## Handling Events

The `MezonClient` provides comprehensive event handling through dedicated event listener methods. All events are automatically handled and cached appropriately.

### Listening to Messages

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

### Listening to Channel Events

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

### Listening to User Events

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

### Social and Interactive Events

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

### Voice and Video Events

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

### Notification Events

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

**Key Features:**
- **Automatic Caching**: Events automatically update local caches
- **Type Safety**: All events are properly typed with TypeScript interfaces
- **Easy Setup**: Simple method calls to register event listeners
- **Comprehensive Coverage**: Events for messages, channels, users, voice, social interactions, and more

## Social Features

### Token Transfers

The Mezon SDK supports sending virtual currency/tokens between users.

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
    const tokenData: TokenSentEvent = {
      receiver_id: recipientUserId,
      amount: amount,
      note: note,
      extra_attribute: "" // Optional additional data
    };

    const response = await client.sendToken(tokenData);
    console.log(`Sent ${amount} tokens to ${recipientUserId}`);
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

### Friend Management

The SDK provides methods for managing friend relationships.

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

### Interactive Message Components

Handle interactive elements in messages like buttons and dropdowns.

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

### Complete Bot Example

Here's a complete example that combines multiple features:

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
