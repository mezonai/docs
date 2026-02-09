---
sidebar_position: 1
---

# Overview

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