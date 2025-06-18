<div id="top">

<!-- HEADER STYLE: BANNER -->
<div align="center">
<img src="https://mezon.ai/assets/preview.png" alt="Mezon">

<!-- BADGES -->
<!-- local repository, no metadata badges. -->

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/JSON-000000.svg?style=plastic&logo=JSON&logoColor=white" alt="JSON">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=plastic&logo=npm&logoColor=white" alt="npm">
<img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=plastic&logo=Prettier&logoColor=black" alt="Prettier">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=plastic&logo=JavaScript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/Nodemon-76D04B.svg?style=plastic&logo=Nodemon&logoColor=white" alt="Nodemon">
<br>
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=plastic&logo=TypeScript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/tsnode-3178C6.svg?style=plastic&logo=ts-node&logoColor=white" alt="tsnode">
<img src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=plastic&logo=ESLint&logoColor=white" alt="ESLint">
<img src="https://img.shields.io/badge/Jest-C21325.svg?style=plastic&logo=Jest&logoColor=white" alt="Jest">

</div>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Core Concepts](#core-concepts)
  - [MezonClient](#mezonclient)
  - [Authentication (Sessions)](#authentication-sessions)
  - [Real-time Communication (Sockets)](#real-time-communication-sockets)
  - [Channels](#channels)
  - [Messages](#messages)
  - [Events](#events)
  - [Clans \& Users](#clans--users)
  - [Caching and Data Management](#caching-and-data-management)
- [Usage / API Examples](#usage--api-examples)
  - [Initializing the Client](#initializing-the-client)
    - [Find clan and channel](#find-clan-and-channel)
  - [Authentication](#authentication)
    - [Login with Token](#login-with-token)
    - [Logout](#logout)
  - [Working with Channels](#working-with-channels)
    - [Initiating a Channel](#initiating-a-channel)
    - [Send a Message to a Channel](#send-a-message-to-a-channel)
  - [Working with Messages](#working-with-messages)
    - [Initiating a Message](#initiating-a-message)
    - [Replying to a Message](#replying-to-a-message)
    - [Updating a Message](#updating-a-message)
    - [Reacting to a Message](#reacting-to-a-message)
    - [Deleting a Message](#deleting-a-message)
  - [Handling Events](#handling-events)
    - [Listening to New Messages](#listening-to-new-messages)
    - [Listening to Channel Updates](#listening-to-channel-updates)
  - [Working with Users](#working-with-users)
    - [Sending a Direct Message](#sending-a-direct-message)
  - [Working with Clans](#working-with-clans)
    - [Fetching Clan Data](#fetching-clan-data)
- [API Reference (Key Components)](#api-reference-key-components)
  - [MezonClient (`MezonClient.ts`)](#mezonclient-mezonclientts)
  - [Session (`session.ts`, `session_manager.ts`)](#session-sessionts-session_managerts)
  - [TextChannel (`TextChannel.ts`)](#textchannel-textchannelts)
  - [Message (`Message.ts`)](#message-messagets)
  - [User (`User.ts`)](#user-userts)
  - [Clan (`Clan.ts`)](#clan-clants)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

`mezon-sdk` is a powerful TypeScript SDK providing a robust client-side interface for interacting with the Mezon platform, enabling real-time communication and efficient data management for applications and bots.

**Why `mezon-sdk`?**

This project simplifies Mezon applications and bots development by providing a comprehensive and well-structured TypeScript library. The core features include:

- **🟢 Real-time Communication:** Leverages WebSockets for instant, bidirectional communication with the Mezon server, ensuring low-latency interactions.
- **🔵 Comprehensive API:** Offers a complete set of methods for interacting with all aspects of the Mezon service, including authentication, channel management, and message handling.
- **🟡 Type Safety:** Built with TypeScript and enforced strict type checking, minimizing runtime errors and improving code maintainability.
- **🔴 Efficient Message Handling:** Employs asynchronous queues and caching mechanisms to optimize performance, even under high message volume.
- **🟣 Modular Design:** Well-structured and modular architecture, featuring distinct managers for sessions, sockets, channels, and events, promotes easy extension, maintenance, and integration into existing projects.
- **🟠 Robust Error Handling:** Includes comprehensive error handling throughout the codebase, ensuring application stability and a better user experience.
- **⚙️ Data Persistence:** Integrates with SQLite for local message storage, allowing for offline access and improved performance.

---

## Features

|      | Component         | Details                                                                                                                                                                                                                                                                               |
| :--- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ⚙️    | **Architecture**  | <ul><li>Modular, with components like `MezonClient`, `SessionManager`, `SocketManager`, `ChannelManager`, `EventManager`.</li><li>Event-driven for real-time updates.</li><li>Utilizes an API client for HTTP requests and a WebSocket adapter for real-time communication.</li></ul> |
| 🔩    | **Code Quality**  | <ul><li>Uses TypeScript for type safety.</li><li>Employs ESLint and Prettier for linting and formatting.</li><li>Jest and Jest-Cucumber for testing.</li></ul>                                                                                                                        |
| 📄    | **Documentation** | <ul><li>Comprehensive (This document).</li><li>Generated Protocol Buffer definitions for API and real-time messages.</li></ul>                                                                                                                                                        |
| 🔌    | **Integrations**  | <ul><li>Uses `ws` for WebSocket communication.</li><li>`better-sqlite3` for local SQLite database interaction (e.g., `MessageDatabase.ts`).</li><li>Protocol Buffers for efficient data serialization (`realtime.ts`, `struct.ts`).</li><li>Base64 for data encoding.</li></ul>       |
| 🧩    | **Modularity**    | <ul><li>Organized into managers, structures, API layers, and utility functions.</li><li>Clear separation of concerns (e.g., API interaction, socket management, data structures).</li></ul>                                                                                           |
| 🧪    | **Testing**       | <ul><li>Uses Jest and Jest-Cucumber.</li><li>Configuration in `jest.config.js`.</li></ul>                                                                                                                                                                                             |
| ⚡️    | **Performance**   | <ul><li>`AsyncThrottleQueue` for rate-limiting and managing asynchronous tasks.</li><li>`CacheManager` for efficient data retrieval.</li><li>SQLite for optimized local data access.</li></ul>                                                                                        |
| 🛡️    | **Security**      | <ul><li>Session management with JWTs (`session.ts`).</li><li>HTTPS and WSS by default.</li><li>Base64 encoding for certain data transformations.</li></ul>                                                                                                                            |
| 📦    | **Dependencies**  | <ul><li>Core: `ws`, `better-sqlite3`, `js-base64`.</li><li>Development: TypeScript, ESLint, Prettier, Jest, Nodemon, ts-node.</li></ul>                                                                                                                                               |
| 🚀    | **Scalability**   | <ul><li>Client-side scalability aided by efficient data management and asynchronous operations.</li><li>Server-side scalability depends on Mezon platform architecture. SQLite usage is for local client caching, not server-side primary storage.</li></ul>                          |

**Note:** This table is based on information from the project structure and file summaries.

---

## Project Structure

```sh
└── mezon-sdk/
    ├── jest.config.js
    ├── nodemon.json
    ├── package.json
    ├── README.md
    ├── src
    │   ├── api
    │   │   └── api.ts
    │   ├── api.ts
    │   ├── client.ts
    │   ├── constants
    │   │   ├── enum.ts
    │   │   └── index.ts
    │   ├── google
    │   │   └── protobuf
    │   │       ├── struct.ts
    │   │       ├── timestamp.ts
    │   │       └── wrappers.ts
    │   ├── index.ts
    │   ├── interfaces
    │   │   ├── api.ts
    │   │   ├── client.ts
    │   │   ├── index.ts
    │   │   └── socket.ts
    │   ├── message-socket-events
    │   │   ├── base_event.ts
    │   │   ├── index.ts
    │   │   ├── user_channel_added.ts
    │   │   └── user_channel_updated.ts
    │   ├── mezon-client
    │   │   ├── client
    │   │   │   └── MezonClient.ts
    │   │   ├── manager
    │   │   │   ├── channel_manager.ts
    │   │   │   ├── event_manager.ts
    │   │   │   ├── session_manager.ts
    │   │   │   └── socket_manager.ts
    │   │   ├── structures
    │   │   │   ├── Clan.ts
    │   │   │   ├── Message.ts
    │   │   │   ├── TextChannel.ts
    │   │   │   └── User.ts
    │   │   └── utils
    │   │       ├── AsyncThrottleQueue.ts
    │   │       ├── CacheManager.ts
    │   │       └── Collection.ts
    │   ├── rtapi
    │   │   └── realtime.ts
    │   ├── session.ts
    │   ├── socket.ts
    │   ├── sqlite
    │   │   └── MessageDatabase.ts
    │   ├── utils
    │   │   ├── format_message_input.ts
    │   │   ├── generate_reply_message.ts
    │   │   ├── helper.ts
    │   │   └── stack.ts
    │   ├── utils.ts
    │   ├── web_socket_adapter.ts
    │   └── web_socket_adapter_pb.ts
    ├── tsconfig.esm.json
    └── tsconfig.json
```

## Getting Started

### Prerequisites

In order to work with the library and the Mezon API in general, you must first create a **[Mezon Bot](./mezon-bot-docs.md)** account.

To use the `mezon-sdk`, you'll need the following installed on your system:

- **Node.js**: (Version 18.x or higher recommended)
- **npm** (Node Package Manager, typically comes with Node.js) or **Yarn**
- **TypeScript**: (Version 4.x or higher recommended, if you are working with the SDK's source or want full type support in your project)

### Installation

1.  **Clone the repository (if you need to build from source):**
    If you are contributing or need the latest unreleased changes:

    ```sh
    git clone <your-fork-url-or-original-repo-url>/mezon-js.git
    cd mezon-js/packages/mezon-sdk
    ```

    For using as a package, you would typically install it via npm after it's published:

    ```sh
    npm install mezon-sdk
    # or
    yarn add mezon-sdk
    ```

2.  **Install dependencies (if building from source):**
    Navigate to the `mezon-sdk` directory:

    ```sh
    cd path/to/mezon-sdk
    ```

    Install the dependencies:

    ```sh
    npm install
    # or
    yarn install
    ```

3.  **Build the SDK (if building from source):**
    The `package.json` specifies build scripts. Typically:
    ```sh
    npm run build
    # or
    yarn build
    ```
    This will compile the TypeScript code into JavaScript, usually in a `dist` directory, as configured in `tsconfig.json` and `tsconfig.esm.json`.

> [!NOTE]
> Installation instructions will depend on the target environment (e.g., npm for Node.js, CDN for browser). Please refer to the specific installation guide for your platform.

---

## Core Concepts

Understanding these core concepts will help you effectively use the `mezon-sdk`.

### MezonClient

The **`MezonClient` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/client/MezonClient.ts)]** is the primary interface for interacting with the Mezon platform. It encapsulates all the necessary functionalities, including:

- Connection management (WebSocket).
- Authentication handling via `SessionManager`.
- API calls through an internal `MezonAPI` instance.
- Real-time event handling via `EventManager` and `SocketManager`.
- Access to data structures like channels, messages, users, and clans.
- Management of local data caching (`CacheManager`) and message persistence (`MessageDatabase`).

### Authentication (Sessions)

- **`SessionManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/manager/session_manager.ts)]**: Manages user sessions. It handles login using an API key (or other credentials) to obtain a session token (JWT).

- **`Session` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/session.ts)]**: Represents an authenticated user session, storing tokens and user information. It includes logic for token expiration and refresh.
  The SDK automatically uses the active session for authorized API calls and WebSocket communication.

### Real-time Communication (Sockets)

- **`SocketManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/manager/session_manager.ts)]**: Establishes and maintains the WebSocket connection to the Mezon server for real-time events and messaging. It handles connection, disconnection, reconnection logic, and message serialization/deserialization (potentially using Protocol Buffers via `WebSocketAdapterPb` or JSON via `WebSocketAdapterText`).

- **`DefaultSocket` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/socket.ts)]**: A lower-level socket implementation used by managers.

- **Real-time Events**: The SDK allows you to listen for various real-time events like new messages, channel updates, user presence changes, etc. These are defined in `src/constants/enum.ts`.

### Channels

- **`ChannelManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/manager/channel_manager.ts)]**: Manages channel-related operations, especially for Direct Message (DM) channels. It can create, fetch, and manage DM channels.

- **`TextChannel` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/structures/TextChannel.ts)]**: Represents a text-based communication channel (e.g., a clan channel or a DM). It provides methods for sending messages, fetching message history, and interacting with channel properties. Channels can be of different types (e.g., text, voice), as defined in `src/constants/enum.ts`.

### Messages

- **`Message` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/structures/Message.ts)]**: Represents a single message within a channel. It contains the message content, sender information, timestamp, attachments, reactions, and other metadata. The `Message` class provides methods to reply to, update, delete, and react to messages.

- **Message Formatting**: Utilities like `format_message_input.ts` and `generate_reply_message.ts` ensure consistent message structures.

- **Message Persistence**: `MessageDatabase.ts` uses SQLite to store messages locally, enabling features like offline viewing or faster history loading.

### Events

- **`EventManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/manager/event_manager.ts)]**: A system for emitting and listening to custom client-side and server-pushed events. This allows different parts of your application (or your bot) to react to occurrences within the Mezon platform or the SDK itself.

- **Socket Events (`src/message-socket-events/`)**: Specific handlers for socket events like `user_channel_added` or `user_channel_updated`.

### Clans & Users

- **`Clan` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/structures/Clan.ts)]**: Represents a clan (or group/community) on the Mezon platform. It can contain multiple channels, members (users), roles, and other clan-specific data. The SDK allows interaction with clan APIs for fetching details, managing members, etc.

- **`User` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/structures/User.ts)]**: Represents a user on the Mezon platform. It includes user details (ID, username, avatar, etc.) and provides methods for user-specific actions like sending direct messages or fetching user-related data.

### Caching and Data Management

- **`CacheManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/utils/CacheManager.ts)]**: Provides a generic caching layer to store frequently accessed data (e.g., user profiles, channel details) in memory, reducing the need for repeated API calls and improving performance. It often uses a Least Recently Used (LRU) strategy.

- **`AsyncThrottleQueue` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/utils/AsyncThrottleQueue.ts)]**: Manages outgoing requests or tasks by queuing them and processing them at a controlled rate. This is crucial for avoiding rate limits imposed by the server and ensuring smooth operation under load.

- **`Collection` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/utils/Collection.ts)]**: An enhanced `Map` utility for managing collections of data objects (like users, channels, messages) with convenient methods for filtering, mapping, and finding items.

---

## Usage / API Examples

Below are examples demonstrating how to use common features of the `mezon-sdk`.
All examples assume you have installed and imported the `MezonClient` and other necessary types.

```typescript
import { MezonClient } from "mezon-sdk";
```

### Initializing the Client

The `MezonClient` is the main entry point. You'll need to configure it with details like the server URL and other options.

```typescript
const client = new MezonClient({
  token: "<YOUR_BOT_TOKEN>", // Your bot or application token
  host: "your-mezon-server.com", // Replace with your Mezon server host
  port: 443, // Default port, adjust if necessary
  useSSL: true, // Use true for WSS/HTTPS
  timeout: 5000,
});

// Handle connection errors
client.on("error", (error) => {
  console.error("Mezon Client Error:", error);
});

client.on("disconnect", (reason) => {
  console.log("Disconnected from Mezon:", reason);
  // Implement custom reconnection logic or UI updates if needed
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user?.username}!`);
  console.log(`Connected to ${client.clans.size} clans.`);

  // Client is ready, you can now perform actions
  // Example: Fetch message in channel
  try {
    const channel = await client.channels.fetch("channel_id");
    console.log(`Fetched ${channel.messages.size} channel messages.`);
  } catch (error) {
    console.error("Error fetching channel messages:", error);
  }
});
```

#### Find clan and channel

```typescript
async findClan(clanId?: string): Promise<Clan> {
  if (!clanId) {
    // If no clan specified and bot is only in one clan, use that
    if (this.client.clans.size === 1) {
      return this.client.clans.first();
    }
    // List available clans
    const clanList = Array.from(this.client.clans.values())
      .map((g) => `"${g.name}"`)
      .join(', ');
    throw new Error(
      `Bot is in multiple servers. Please specify server name or ID. Available servers: ${clanList}`,
    );
  }

  // Try to fetch by ID first
  try {
    const clan = await this.client.clans.fetch(clanId);
    if (clan) return clan;
  } catch {
    // If ID fetch fails, search by name
    const clans = this.client.clans.filter(
      (g) => g.name.toLowerCase() === clanId.toLowerCase(),
    );

    if (clans.size === 0) {
      const availableClans = Array.from(this.client.clans.values())
        .map((g) => `"${g.name}"`)
        .join(', ');
      throw new Error(
        `Clan "${clanId}" not found. Available servers: ${availableClans}`,
      );
    }
    if (clans.size > 1) {
      const clanList = clans.map((g) => `${g.name} (ID: ${g.id})`).join(', ');
      throw new Error(
        `Multiple servers found with name "${clanId}": ${clanList}. Please specify the server ID.`,
      );
    }
    return clans.first();
  }
  throw new Error(`Clan "${clanId}" not found`);
}
```

```typescript
async findChannel(channelId: string, clanId?: string): Promise<TextChannel> {
  const clan = await this.findClan(clanId);

  // First try to fetch by ID
  try {
    const channel = await this.client.channels.fetch(channelId);
    if (channel instanceof TextChannel && channel.clan.id === clan.id) {
      return channel;
    }
  } catch {
    // If fetching by ID fails, search by name in the specified clan
    const channels = clan.channels.cache.filter(
      (channel): channel is TextChannel =>
        channel instanceof TextChannel &&
        (channel.name?.toLowerCase() === channelId.toLowerCase() ||
          channel.name?.toLowerCase() ===
            channelId.toLowerCase().replace('#', '')),
    );

    if (channels.size === 0) {
      const availableChannels = clan.channels.cache
        .filter((c): c is TextChannel => c instanceof TextChannel)
        .map((c) => `"#${c.name}"`)
        .join(', ');
      throw new Error(
        `Channel "${channelId}" not found in server "${clan.name}". Available channels: ${availableChannels}`,
      );
    }
    if (channels.size > 1) {
      const channelList = channels
        .map((c) => `#${c.name} (${c.id})`)
        .join(', ');
      throw new Error(
        `Multiple channels found with name "${channelId}" in server "${clan.name}": ${channelList}. Please specify the channel ID.`,
      );
    }
    return channels.first();
  }
  throw new Error(
    `Channel "${channelId}" is not a text channel or not found in server "${clan.name}"`,
  );
}
```

### Authentication

#### Login with Token

Login is typically handled during client initialization if an `token` is provided. The `SessionManager` handles this. If you need to explicitly login or re-login:

```typescript
async function loginUser(client: MezonClient, token: string) {
  try {
    const session = await client.login(token);
    console.log("Login successful! User ID:", session.userId);
    // The client should now be in a 'ready' state or emit a 'ready' event
    // If not automatically handled by login, you might need to explicitly connect the socket:
    // await client.socket.connect(session);
  } catch (error) {
    console.error("Login failed:", error);
  }
}

// Call login if not done automatically via constructor
// loginUser(client, '<YOUR_BOT_TOKEN>');
```

_Note: The `MezonClient` suggests that authentication using an API key might be initiated when the `MezonClient` is instantiated or connects. The 'ready' event often signifies successful authentication and connection._

#### Logout

```typescript
async function logoutUser(client: MezonClient) {
  try {
    await client.closeSocket();
    console.log("Logout successful.");
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

// To logout:
// await logoutUser(client);
```

### Working with Channels

#### Initiating a Channel

The `channel` object provides methods for interacting with specific channels on the Mezon platform. The `fetch` method allows you to retrieve a reference to a channel using its unique identifier.

```typescript
const channel = client.channels.fetch(channel_id);
```

**Parameters**

- `channel_id`: A string or number representing the unique identifier of the channel you want to interact with.

**Return Value**

- `channel`: An `TextChannel` object representing the specified channel. This object will likely have methods for performing actions within the channel, such as sending messages, retrieving members, etc. The exact methods available on the channel object will be detailed in further documentation.

#### Send a Message to a Channel

Once you have a `TextChannel` object (either a DM channel or a clan channel), you can send messages.

```typescript
import { ChannelMessageContent } from 'mezon-sdk';

const content: ChannelMessageContent = {};
const message = await channel.send(content);
```

**Parameters**

- `content`: The content of the message. This can be a simple string or a more complex object conforming to the `ChannelMessageContent` interface.

- `mentions (optional)`: An array of `ApiMessageMention` objects, specifying which users are mentioned in the message.

- `attachments (optional)`: An array of `ApiMessageAttachment` objects, representing any files or media attached to the message.

- `mention_everyone (optional)`: A boolean indicating whether the message should trigger a notification for everyone in the channel.

- `anonymous_message (optional)`: A boolean indicating if the message should be sent anonymously.

- `topic_id (optional)`: A string representing the ID of the topic this message is associated with, if applicable.

- `code (optional)`: A number that can be used for special purposes by the application.

**Return Value**

- A `Promise` that resolves with the result of the `socketManager.writeChatMessage` call. The exact structure of the resolved value depends on the socket manager's implementation but typically contains information about the sent message, such as its server-assigned ID and timestamp.

Here are some sample code snippets for the `send` function:

```typescript
async function sendMessage(channel: TextChannel, content: string) {
  try {
    const message = await channel.send({
      t: content,
    });

    console.log(`Message sent! ID: ${message.message_id}`);
  } catch (error) {
    console.error(`Failed to send message to channel ${channel.id}:`, error);
  }
}

// OR

async function sendMessage(channel: TextChannel, content: ChannelMessageContent) {
  try {
    const message = await channel.send(content);
    console.log(`Message sent! ID: ${message.message_id}`);
  } catch (error) {
    console.error(`Failed to send message to channel ${channel.id}:`, error);
  }
}
```

A `TextChannel` might also have parameters for mentions, attachments, embeds, etc. (refer to `IMessageInput` from `interfaces/client.ts`).
Example for sending with mentions and attachments:

```typescript
async function sendMessageWithAttachment(channel: TextChannel, content: string, attachmentUrl: string) {
  try {
    const content: ChannelMessageContent = {};

    const mentions: Array<ApiMessageMention> = [
      {
        user_id: '<USER_ID>', // Replace with actual user ID
        channel_id: '<CHANNEL_ID>', // Replace with actual channel ID
      },
    ];

    const attachments: Array<ApiMessageAttachment> = [
      {
        url: 'https://example.com/image.png', // Replace with actual image URL
        filename: 'image', // Optional: specify filename
        filetype: 'image/png', // Optional: specify file type
      },
    ];

    const message = await channel.send(
      content,
      mentions,
      attachments
    );

    console.log(`Message with mention and attachment sent! ID: ${message.message_id}`);
  } catch (error) {
    console.error(`Failed to send message with mention and attachment:`, error);
  }
}
```

### Working with Messages

The `Message` class (`src/mezon-client/structures/Message.ts`) allows you to interact with existing messages.

#### Initiating a Message

The `fetch` method allows you to retrieve a reference to a message using its unique identifier and the channel it belongs to.

```typescript
const channel = await client.channels.fetch(channel_id);

const message = await channel.messages.fetch(message_id);
```

**Parameters**

- `message_id`: A string representing the unique identifier of the message you want to interact with.

**Return Value**

- `message`: An `Message` object representing the specified message. This object will likely have methods for performing actions within the message, such as reply, update, delete message, etc. The exact methods available on the message object will be detailed in further documentation.

#### Replying to a Message

Once you have a `TextChannel` object (either a DM channel or a clan channel), you can send messages.

```typescript
import { ChannelMessageContent } from 'mezon-sdk';

const content: ChannelMessageContent = {};
const replyResponse = await message.reply(content);
```

**Parameters**

- `content`: The content of the message. This can be a simple string or a more complex object conforming to the `ChannelMessageContent` interface.

- `mentions (optional)`: An array of `ApiMessageMention` objects, representing users mentioned in the reply.

- `attachments (optional)`: An array of `ApiMessageAttachment` objects, representing any files attached to the reply.

- `mention_everyone (optional)`: A boolean indicating whether the message should trigger a notification for everyone in the channel.

- `anonymous_message (optional)`: A boolean value that indicates whether the reply should be sent anonymously.

- `topic_id (optional)`: A string representing the unique identifier of the topic this reply belongs to. If not provided, it defaults to the topic of the original message.

- `code (optional)`: A number that can be used for special purposes by the application.

**Return Value**

- `ChannelMessageAck`: An acknowledgement received in response to sending a message on a chat channel.

The `generate_reply_message.ts` utility is likely used internally by this method.

Sample code snippets for the `reply` function:

```typescript
async function replyToMessage(originalMessage: Message, replyContent: string) {
  try {
    const reply = await originalMessage.reply({ t: replyContent });
    console.log(
      `Replied to message ${originalmessage.message_id}. New message ID: ${reply.id}`
    );
  } catch (error) {
    console.error(`Failed to reply to message ${originalmessage.message_id}:`, error);
  }
}

// Example (assuming `receivedMessage` is a Message instance from an event):
// await replyToMessage(receivedMessage, 'Thanks for your message!');
```

#### Updating a Message

This function updates an existing message with new content.

```typescript
async function updateMessage(message: Message, newContent: string) {
  try {
    const updatedMessage = await message.update({ t: newContent });
    console.log(
      `Message ${message.message_id} updated. New content: ${updatedMessage.content}`
    );
  } catch (error) {
    console.error(`Failed to update message ${message.message_id}:`, error);
  }
}

// Example (assuming `myMessage` is a Message instance that your bot sent):
// await updateMessage(myMessage, 'This is the edited content.');
```

**Parameters**

- `content`: The content of the new message. This can be a simple string or a more complex object conforming to the `ChannelMessageContent` interface.

- `topic_id (optional)`: A string representing the unique identifier of the topic this message is in. If not provided, it defaults to the topic of the original message.

**Return Value**

- `ChannelMessageAck`: An acknowledgement received in response to sending a message on a chat channel.

#### Reacting to a Message

This function adds or removes a reaction from the message.

```typescript
async function reactToMessage(message: Message, emoji: string) {
  try {

    const reactData: ReactMessagePayload = {
      emoji_id: ':like:', // Replace with actual emoji ID or custom reaction
      emoji: '👍', // Replace with actual emoji or custom reaction
      count: 1,
    };

    const reactResponse = await message.react(reactData);
    console.log(`Reacted to message ${message.message_id} with ${reactData.emoji}.`);
  } catch (error) {
    console.error(`Failed to react to message ${message.message_id}:`, error);
  }
}

// Example:
// await reactToMessage(receivedMessage, '👍');
```

**Parameters**

- `dataReactMessage`: A `ReactMessagePayload` object containing the details of the reaction. This object includes:

    - `id`: A string representing the unique identifier of the reaction.

    - `emoji_id`: A string representing the unique identifier of the emoji.

    - `emoji`: The emoji character or object itself.

    - `count`: A number indicating the total count for this reaction.

    - `action_delete` (optional): A boolean value that, if true, indicates the reaction should be removed. Defaults to false.

**Return Value**

- `ApiMessageReaction`: An object that specifies which messages are reacted to in the channel..

#### Deleting a Message

This function deletes the message.

```typescript
async function deleteMessage(message: Message) {
  try {
    await message.delete();
    console.log(`Message ${message.message_id} deleted.`);
  } catch (error) {
    console.error(`Failed to delete message ${message.message_id}:`, error);
  }
}

// Example:
// await deleteMessage(myMessage);
```
**Parameters**

- This function does not take any parameters.

**Return Value**

- `ChannelMessageAck`: An acknowledgement received in response to deleting a message on a chat channel.

### Handling Events

The `EventManager` and `SocketManager` allow you to listen to various real-time events. Event names are typically defined in `src/constants/enum.ts` (e.g., `MezonEventSocket`).

#### Listening to New Messages

```typescript
// Using client.on('eventName', listener) which is a common pattern via EventManager
client.on(MezonEventSocket.MESSAGE_CREATE, (message: Message) => {
  console.log(
    `New message from ${message.author?.username} in channel ${message.channelId}: ${message.content}`
  );

  // Basic auto-reply bot
  if (
    message.author?.id !== client.user?.id &&
    message.content.toLowerCase() === "!hello"
  ) {
    message.reply({ content: `Hello there, ${message.author?.username}!` });
  }
});

// Event name might also be more generic like 'message' or 'messageCreate'
// client.on('messageCreate', (message: Message) => { ... });
```

_Note: The exact event names (`MezonEventSocket.MESSAGE_CREATE` or other variants) should be checked from `src/constants/enum.ts` or the SDK's exposed constants._

#### Listening to Channel Updates

```typescript
client.on(
  MezonEventSocket.CHANNEL_UPDATE,
  (oldChannel: TextChannel | any, newChannel: TextChannel) => {
    console.log(`Channel ${newChannel.id} was updated.`);
    // console.log('Old name:', oldChannel?.name, 'New name:', newChannel.name); // Property access depends on what's passed
  }
);

client.on(MezonEventSocket.USER_CHANNEL_ADDED, (eventData: any) => {
  // Type from user_channel_added.ts
  console.log("User channel added event:", eventData);
  // const { channel, userIds } = eventData;
  // if (userIds.includes(client.user.id)) {
  //    console.log(`I was added to channel ${channel.id}`);
  // }
});

// client.on('channelUpdate', (channel: TextChannel) => {
//   console.log(`Channel updated: ${channel.name} (ID: ${channel.id})`);
// });
```

### Working with Users

The `User` structure (`src/mezon-client/structures/User.ts`) provides information about users.

#### Sending a Direct Message

This is usually done by first getting or creating a DM channel with the user, then sending a message to that channel (see "Create a Direct Message (DM) Channel" and "Send a Message to a Channel").

```typescript
async function sendDMToUser(
  client: MezonClient,
  recipientUserId: string,
  messageContent: string
) {
  try {
    // User objects might have a helper method or you use the channel manager
    const user = await client.users.fetch(recipientUserId); // Assuming client.users cache/manager
    if (!user) {
      console.error(`User ${recipientUserId} not found.`);
      return;
    }

    // The User object might have a method like:
    // const dmChannel = await user.createDM();
    // await dmChannel.send(messageContent);
    // OR, use the channel manager as shown before:
    const dmChannel = await client.channels.createDMChannel(recipientUserId);
    if (dmChannel) {
      await dmChannel.send({ content: messageContent });
      console.log(`DM sent to user ${recipientUserId}`);
    }
  } catch (error) {
    console.error(`Failed to send DM to user ${recipientUserId}:`, error);
  }
}

// Example:
// await sendDMToUser(client, '<TARGET_USER_ID>', 'Hello from the bot!');
```

The `User.ts` summary mentions "manages user interactions, including direct messaging".

### Working with Clans

The `Clan` structure (`src/mezon-client/structures/Clan.ts`) allows interaction with clans.

#### Fetching Clan Data

Clans are likely cached on the client after connection, or can be fetched.

```typescript
async function getClanInfo(client: MezonClient, clanId: string) {
  try {
    // Clans might be in a collection: client.clans
    let clan = client.clans.get(clanId);

    if (!clan) {
      // If not in cache, a fetch method might exist on the client or clan manager
      // clan = await client.clans.fetch(clanId); // Hypothetical fetch method
      // Or it's part of MezonAPI exposed through the client:
      // const clanData = await client.api.getClan(clanId);
      // clan = new Clan(client, clanData); // And then instantiated
      console.log(
        `Clan ${clanId} not found in cache, fetching might be needed or check clan ID.`
      );
      return;
    }

    console.log(`Clan Name: ${clan.name}`);
    console.log(`Clan ID: ${clan.id}`);
    console.log(`Member Count: ${clan.memberCount}`); // Assuming such properties exist
    console.log(`Channels: ${clan.channels.cache.size}`); // Assuming channels are a collection

    // Listing text channels in a clan
    clan.channels.getTextChannels().forEach((channel) => {
      // Assuming method getTextChannels() exists
      console.log(`  - Text Channel: ${channel.name} (ID: ${channel.id})`);
    });
  } catch (error) {
    console.error(`Failed to get info for clan ${clanId}:`, error);
  }
}

// Example:
// if (client.ready) { // ensure client is ready
//   const firstClan = client.clans.first(); // From Collection utility
//   if (firstClan) {
//     await getClanInfo(client, firstClan.id);
//   }
// }
```

---

## API Reference (Key Components)

This section provides a brief overview of the primary classes and structures in the `mezon-sdk`. For detailed type information, refer to the TypeScript definitions within the SDK source (`src/interfaces/` and `src/mezon-client/structures/`).

### MezonClient (`MezonClient.ts`)

The main client class.

**Key Properties (inferred):**

- `user: User | null`: The currently logged-in user (bot).
- `sessionManager: SessionManager`: Manages authentication and session data.
- `socketManager: SocketManager`: Manages the WebSocket connection.
- `channelManager: ChannelManager` (or `channels`): Manages channels, especially DMs.
- `eventManager: EventManager` (or uses `EventEmitter` pattern via `on`, `emit`): Handles events.
- `api: MezonAPI`: Instance for making direct API calls.
- `clans: Collection<string, Clan>`: Cached clans the client is part of.
- `users: CacheManager<User>` (or `Collection<string, User>`): Cached users.
- `messageDb: MessageDatabase`: Interface to the local SQLite message store.
- `options: MezonClientOptions`: The options the client was constructed with.

**Key Methods (inferred):**

- `constructor(options: MezonClientOptions)`: Initializes the client.
- `login(apiKey: string): Promise<Session>`: Logs in the user/bot. (Often handled by constructor).
- `logout(): Promise<void>`: Logs out the current session.
- `connect(): Promise<void>`: Establishes the connection (if not automatic).
- `disconnect(): Promise<void>`: Closes the connection.
- `on(event: string | MezonEventSocket, listener: (...args: any[]) => void): this`: Listens for events.
- `emit(event: string | MezonEventSocket, ...args: any[]): boolean`: Emits an event.
- `destroy(): Promise<void>`: Cleans up the client instance.

### Session (`session.ts`, `session_manager.ts`)

Represents an authenticated session.

**Key Properties (inferred from `session.ts`):**

- `token: string`: The main authentication token (JWT).
- `refreshToken: string | null`: Token for refreshing the session.
- `userId: string`: ID of the authenticated user.
- `username: string`: Username of the authenticated user.
- `expiresAt: number`: Timestamp when the token expires.
- `isExpired(): boolean`: Checks if the session token has expired.

**SessionManager Methods (inferred from `session_manager.ts`):**

- `login(apiKey: string): Promise<Session>`: Authenticates and creates a session.
- `logout(): Promise<void>`: Invalidates the current session.
- `getSession(): Session | null`: Retrieves the current session.

### TextChannel (`TextChannel.ts`)

Represents a text-based communication channel.

**Key Properties (inferred):**

- `id: string`: The unique ID of the channel.
- `name: string`: The name of the channel.
- `type: ChannelType`: The type of channel (e.g., text, voice, DM).
- `clanId: string | null`: ID of the clan this channel belongs to (if not a DM).
- `messages: CacheManager<Message>` (or `Collection<string, Message>`): Cached messages for this channel.
- `lastMessageId: string | null`: The ID of the last message sent in this channel.

**Key Methods (inferred):**

- `send(messageData: IMessageInput): Promise<Message>`: Sends a message to the channel. (`IMessageInput` from `interfaces/client.ts` would define `content`, `attachments`, `mentions`, etc.)
- `fetchMessages(options?: { limit?: number; before?: string; after?: string }): Promise<Collection<string, Message>>`: Fetches a list of messages.
- `delete(): Promise<void>`: Deletes the channel (if permissions allow).
- `update(data: Partial<ChannelData>): Promise<TextChannel>`: Updates channel properties.

### Message (`Message.ts`)

Represents a message in a channel.

**Key Properties (inferred):**

- `id: string`: Unique ID of the message.
- `channelId: string`: ID of the channel this message belongs to.
- `author: User | null`: The user who sent the message.
- `content: string`: The text content of the message.
- `timestamp: number` (or `Date`): When the message was sent.
- `editedTimestamp: number | null`: When the message was last edited.
- `attachments: IAttachment[]`: Array of attachments.
- `mentions: IUserMention[]`: Array of user mentions.
- `reactions: IReaction[]`: Array of reactions on the message.
- `replyToMessageId: string | null`: If this message is a reply, the ID of the original message.

**Key Methods (inferred):**

- `reply(messageData: IMessageInput): Promise<Message>`: Sends a reply to this message.
- `update(messageData: Partial<IMessageInput>): Promise<Message>`: Edits the message (if sender).
- `delete(): Promise<void>`: Deletes the message (if sender or has permissions).
- `react(emoji: string): Promise<void>`: Adds a reaction to the message.
- `removeReaction(emoji: string): Promise<void>`: Removes a reaction.
- `pin(): Promise<void>`: Pins the message.
- `unpin(): Promise<void>`: Unpins the message.

### User (`User.ts`)

Represents a user.

**Key Properties (inferred):**

- `id: string`: Unique ID of the user.
- `username: string`: User's display name.
- `avatarUrl: string | null`: URL to the user's avatar.
- `isBot: boolean`: Whether the user is a bot.
- `status: string`: User's presence status (e.g., online, offline).

**Key Methods (inferred):**

- `createDM(): Promise<TextChannel>`: Creates or fetches a DM channel with this user.
- `send(messageData: IMessageInput): Promise<Message>`: Shortcut to create DM and send message.
- `fetchProfile(): Promise<User>`: Fetches updated profile information.
- _(Other user-specific actions like transfer tokens, as mentioned in summary)_

### Clan (`Clan.ts`)

Represents a clan or community.

**Key Properties (inferred):**

- `id: string`: Unique ID of the clan.
- `name: string`: Name of the clan.
- `iconUrl: string | null`: URL to the clan's icon.
- `ownerId: string`: ID of the clan owner.
- `memberCount: number`: Number of members in the clan.
- `channels: CacheManager<TextChannel | VoiceChannel>` (or `ClanChannelManager`): Collection of channels within the clan.
- `members: CacheManager<User>` (or `ClanMemberManager`): Collection of members in the clan.
- `roles: Collection<string, Role>`: Roles within the clan.

**Key Methods (inferred):**

- `fetchChannels(): Promise<Collection<string, TextChannel | VoiceChannel>>`: Fetches/updates the clan's channel list.
- `fetchMembers(): Promise<Collection<string, User>>`: Fetches/updates the clan's member list.
- `fetchMember(userId: string): Promise<User | null>`: Fetches a specific member.
- `leave(): Promise<void>`: Makes the client leave the clan.
- _(Other clan management functions like update roles, list voice channel users etc. as per summary)_

---

## Testing

Mezon-sdk uses the **Jest** testing framework, with Jest-Cucumber for behavior-driven development (BDD) style tests. The configuration can be found in `jest.config.js`.

To run the test suite:

**Using [npm](https://www.npmjs.com/):**

````sh
npm test```

**Using [yarn](https://yarnpkg.com/):**
```sh
yarn test
````

This command will execute all tests defined within the `src` directory (or as specified in the Jest configuration), providing feedback on the SDK's integrity and functionality.

---

## Contributing

Contributions are welcome! Here's how you can help:

- **💬 [Join the Discussions](https://mezon.ai/)**: Share your insights, provide feedback, or ask questions. 
- **🐛 [Report Issues](https://github.com/mezonai/mezon-js/issues)**: Submit bugs found or log feature requests for the `mezon-sdk` project.
- **💡 [Submit Pull Requests](https://github.com/mezonai/mezon-js/pulls)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1.  **Fork the Repository**: Start by forking the project repository to your GitHub/GitLab account.
2.  **Clone Locally**: Clone the forked repository to your local machine.
    ```sh
    git clone F:\MEZON\mezon-js\packages\mezon-sdk
    # Or: git clone <your-fork-url>
    ```
3.  **Create a New Branch**: Always work on a new branch, giving it a descriptive name (e.g., `feature/add-cool-thing` or `fix/resolve-bug-123`).
    ```sh
    git checkout -b feature/new-awesome-feature
    ```
4.  **Make Your Changes**: Develop and test your changes locally. Ensure your code adheres to the project's linting and style guidelines (ESLint, Prettier).
5.  **Commit Your Changes**: Commit with a clear and descriptive message.
    ```sh
    git commit -m 'feat: Implemented new awesome feature for XYZ'
    ```
6.  **Push to Your Fork**: Push the changes to your forked repository.
    ```sh
    git push origin feature/new-awesome-feature
    ```
7.  **Submit a Pull Request**: Create a Pull Request (PR) against the main branch of the original `mezon-sdk` repository. Clearly describe the changes and their motivations in the PR description. Link any relevant issues.
8.  **Review**: Your PR will be reviewed by maintainers. Address any feedback or requested changes. Once approved, it will be merged. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com/mezonai/mezon-js/graphs/contributors">
      <img src="https://github.com/huybuidoanquang/MEZON/blob/main/images/contributor-graph.png">
   </a>
</p>
</details>

---

## License

Mezon-sdk is protected under the [LICENSE](https://choosealicense.com/licenses) License. For more details, refer to the `LICENSE` file in the repository. _(Specify the actual license, e.g., MIT, Apache 2.0, if known. If not, create a LICENSE file in the repo.)_

---

## Acknowledgments

- Credit `contributors`, `inspiration`, `references`, etc.
- Thanks to all developers who have contributed to the libraries and tools used in this project.
- The Mezon community for their feedback and support.

<div align="right">

[![][back-to-top]](#top)

</div>

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
