---
sidebar_position: 3
---

# Core Concepts

Understanding these core concepts will help you effectively use the `mezon-sdk`.

## MezonClient

The **`MezonClient` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/client/MezonClient.ts)]** is the primary interface for interacting with the Mezon platform. It extends Node.js's `EventEmitter` to provide real-time event handling capabilities. The client encapsulates all the necessary functionalities, including:

- **Connection management** via `SocketManager` for WebSocket communications
- **Authentication handling** through `SessionManager` for session management and token authentication
- **API calls** through an internal `MezonApi` instance for REST API operations
- **Real-time event handling** via `EventManager` and `SocketManager` for live updates
- **Data structure access** including channels, messages, users, and clans through cached managers
- **Local data caching** using `CacheManager` for performance optimization
- **Message persistence** via `MessageDatabase` using SQLite for offline capabilities
- **Rate limiting** through `AsyncThrottleQueue` for managing outgoing requests
- **Direct messaging** support with dedicated DM channel management

### Key Properties and Methods

- **`login()`**: Authenticates the client and establishes connections
- **`createDMchannel(userId)`**: Creates direct message channels with users
- **Event listeners**: Comprehensive set of `on*` methods for real-time events like messages, channel updates, user actions, and more
- **Friend management**: Methods for adding, accepting, and listing friends
- **`closeSocket()`**: Properly closes WebSocket connections and resets managers

## Authentication (Sessions)

- **`SessionManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/manager/session_manager.ts)]**: Handles the complete authentication lifecycle:
  - **Token-based authentication** using API keys to obtain session tokens (JWT)
  - **Session management** including storage and retrieval of active sessions
  - **API integration** coordinates with `MezonApi` for authentication requests
  - **Automatic session handling** for all authorized API calls and WebSocket communication

- **`Session` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/session.ts)]**: Represents an authenticated user session containing:
  - **User credentials** including tokens and user identification (`user_id`)
  - **Server endpoints** dynamic API URL resolution from authentication response
  - **Token management** with expiration and refresh logic
  - **Connection parameters** used for establishing WebSocket connections

### Authentication Flow

The `MezonClient.login()` process involves:
1. **Initial authentication** with temporary API client using bot ID and token
2. **Dynamic endpoint resolution** parsing `api_url` from session response for optimal routing
3. **Manager initialization** setting up all SDK components (API client, session, socket, channel, event managers)
4. **MMN/ZK initialization** setting up zero-knowledge proof system for secure token transfers:
   - Generates ephemeral key pair for transaction signing
   - Retrieves wallet address for the bot
   - Obtains zero-knowledge proofs for privacy-preserving transactions
5. **WebSocket connection** establishing real-time communication channel
6. **DM channel initialization** loading existing direct message channels
7. **Ready state emission** signaling successful authentication and setup completion

The SDK automatically handles:
- Server-side routing and load balancing through dynamic endpoint resolution
- Secure token transfer infrastructure with zero-knowledge proofs
- Automatic nonce management for transactions
- Optimal connection paths for real-time communication

## Real-time Communication (Sockets)

- **`SocketManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/manager/socket_manager.ts)]**: Establishes and maintains the WebSocket connection to the Mezon server for real-time events and messaging. It handles connection, disconnection, reconnection logic, and message serialization/deserialization using Protocol Buffers via `WebSocketAdapterPb`. The manager integrates with the message queue system and database for reliable message handling.

- **`DefaultSocket` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/socket.ts)]**: A lower-level socket implementation used by managers.

- **Real-time Events**: The SDK provides extensive real-time event support through the `MezonClient`'s event listener methods:
  - **Message Events**: `onChannelMessage()`, `onMessageReaction()`, `onMessageButtonClicked()`
  - **Channel Events**: `onChannelCreated()`, `onChannelUpdated()`, `onChannelDeleted()`
  - **User Events**: `onUserChannelAdded()`, `onUserChannelRemoved()`, `onAddClanUser()`, `onUserClanRemoved()`
  - **Social Events**: `onGiveCoffee()`, `onTokenSend()`, `onNotification()`
  - **Voice Events**: `onVoiceStartedEvent()`, `onVoiceEndedEvent()`, `onVoiceJoinedEvent()`, `onVoiceLeavedEvent()`
  - **Streaming Events**: `onStreamingJoinedEvent()`, `onStreamingLeavedEvent()`
  - **Role Events**: `onRoleEvent()`, `onRoleAssign()`
  - **Interactive Events**: `onDropdownBoxSelected()`, `onQuickMenuEvent()`, `onWebrtcSignalingFwd()`
  
  These events are defined in `src/constants/enum.ts` and allow for comprehensive real-time application development.

## Channels

- **`ChannelManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/manager/channel_manager.ts)]**: Manages channel-related operations with specialized support for Direct Message (DM) channels. Key functionalities include:
  - Creating and fetching DM channels
  - Initializing all DM channels during client setup via `initAllDmChannels()`
  - Managing channel state and metadata
  - Coordinating with `SocketManager` and `SessionManager` for real-time updates

- **`TextChannel` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/structures/TextChannel.ts)]**: Represents a text-based communication channel (e.g., clan channels, DM channels, or threads). It provides methods for:
  - Sending messages and managing message history
  - Interacting with channel properties and metadata
  - Integration with message persistence through `MessageDatabase`
  - Real-time message handling via the message queue system
  
  Channels support various types including text, voice, and threads as defined in `ChannelType` enum from `src/constants/enum.ts`. The `MezonClient` maintains channels through a `CacheManager` for efficient access and automatic fetching when needed.

## Messages

- **`Message` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/structures/Message.ts)]**: Represents a single message within a channel with comprehensive metadata including:
  - Message content, sender information, and timestamps
  - Attachments, reactions, mentions, and message references
  - Integration with the parent `TextChannel` and rate-limited messaging via `AsyncThrottleQueue`
  - Methods for message manipulation (reply, update, delete, react)

- **Message Initialization**: Messages are created through `MessageInitData` interface containing all necessary properties like `id`, `clan_id`, `channel_id`, `sender_id`, `content`, `reactions`, `mentions`, `attachments`, `references`, and `create_time_seconds`.

- **Message Formatting**: Utilities like `format_message_input.ts` and `generate_reply_message.ts` ensure consistent message structures across different message types including special handling for token transfers.

- **Message Persistence**: `MessageDatabase.ts` uses SQLite to store messages locally through the `saveMessage()` method, enabling features like:
  - Offline message viewing
  - Faster message history loading
  - Local message caching for improved performance
  - Message synchronization between sessions

- **Real-time Message Handling**: The `MezonClient` automatically handles incoming messages through `_initChannelMessageCache()` which creates `Message` instances and updates both in-memory caches and persistent storage.

## Events

- **`EventManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/manager/event_manager.ts)]**: A system for emitting and listening to custom client-side and server-pushed events. This allows different parts of your application (or your bot) to react to occurrences within the Mezon platform or the SDK itself.

- **Socket Events (`src/message-socket-events/`)**: Specific handlers for socket events like `user_channel_added` or `user_channel_updated`.

## Clans & Users

- **`Clan` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/structures/Clan.ts)]**: Represents a clan (server/community) on the Mezon platform containing:
  - Multiple channels accessible through the clan's channel collection
  - Member users with role-based permissions
  - Clan-specific metadata (ID, name, welcome channel)
  - Integration with `MezonApi`, `SocketManager`, and `MessageDatabase`
  - Dynamic channel loading via `loadChannels()` method
  - A special clan with ID "0" represents the DM space for direct messaging

- **`User` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/structures/User.ts)]**: Represents a user on the Mezon platform with comprehensive profile information:
  - **Basic Identity**: ID, username, display name, and avatar
  - **Clan-specific Data**: clan nickname (`clan_nick`) and clan avatar (`clan_avatar`) for different clan contexts
  - **DM Integration**: Associated DM channel ID for direct messaging capabilities
  - **User Actions**: Methods for user-specific operations like sending direct messages
  
  Users are managed through `UserInitData` interface and are automatically cached by clans. The `MezonClient` maintains user data across both clan contexts and the global DM space (clan "0"), allowing for consistent user interactions regardless of context.

- **User Management**: The client automatically handles user caching through `_initUserClanCache()` which:
  - Creates user instances for both clan and DM contexts
  - Maintains user data consistency across different clan memberships
  - Handles dynamic user loading from DM channel data
  - Updates user information from real-time message events

## Caching and Data Management

- **`CacheManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/utils/CacheManager.ts)]**: Provides a sophisticated caching layer for frequently accessed data with automatic fetching capabilities:
  - **Generic caching** for any data type (clans, channels, users)
  - **Automatic fetching** via constructor-provided fetch functions (e.g., `_fetchClanFromAPI`, `_fetchChannelFromAPI`)
  - **Memory optimization** reducing repeated API calls and improving performance
  - **Integrated with MezonClient** through `this.clans` and `this.channels` cache managers
  - **Lazy loading** - data is fetched only when accessed via `fetch()` or `get()` methods

- **`AsyncThrottleQueue` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/utils/AsyncThrottleQueue.ts)]**: Critical component for managing outgoing requests and maintaining rate limits:
  - **Rate limiting** prevents server-imposed limits and ensures smooth operation
  - **Request queuing** manages high-volume messaging and API calls
  - **Used extensively** by MezonClient for message sending, API calls, and socket operations
  - **Background processing** handles queued tasks without blocking main application flow

- **`Collection` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/utils/Collection.ts)]**: An enhanced `Map` utility providing advanced data structure management:
  - **Extended Map functionality** with convenient methods for filtering, mapping, and finding items
  - **Used throughout SDK** for managing collections of users, channels, messages, and other entities
  - **Performance optimized** for frequent read/write operations on large datasets
  - **Type-safe** operations maintaining TypeScript compatibility

- **`MessageDatabase` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/sqlite/MessageDatabase.ts)]**: SQLite-based persistent storage system:
  - **Local message storage** for offline access and faster loading
  - **Automatic synchronization** with real-time events via `saveMessage()` method
  - **Integrated caching** works alongside in-memory caches for optimal performance
  - **Cross-session persistence** maintains message history between application restarts

## Social Features

The Mezon SDK provides comprehensive social interaction capabilities:

### Friend System
- **`getListFriends()`**: Retrieve friend lists with pagination support (`limit`, `state`, `cursor` parameters)
- **`addFriend(username)`**: Send friend requests to users by username
- **`acceptFriend(userId, username)`**: Accept incoming friend requests
- **Automatic friend request handling**: The client automatically processes friend requests through notification events

### Token Transfer System

The Mezon SDK provides comprehensive support for secure token transfers using the **Mezon Money Network (MMN)** with zero-knowledge proofs for enhanced privacy:

- **`sendToken(tokenEvent)`**: Send virtual currency/tokens between users with automatic ZK proof handling
- **`getEphemeralKeyPair()`**: Generate temporary key pairs for secure transaction signing
- **`getAddress(userId)`**: Retrieve wallet addresses for users
- **`getZkProofs(data)`**: Obtain zero-knowledge proofs for privacy-preserving transactions
- **`getCurrentNonce(userId)`**: Fetch current transaction nonce for proper sequencing
- **`onTokenSend()`**: Listen for token transfer events with automatic DM notifications

**Key Features:**
- **Privacy-preserving**: Uses zero-knowledge proofs to protect transaction details
- **Automatic initialization**: ZK infrastructure is set up during login process
- **Nonce management**: SDK automatically handles transaction sequencing
- **Decimal scaling**: Amounts are automatically scaled to the correct precision
- **Error handling**: Comprehensive error messages for failed transactions
- **Transaction receipts**: Returns transaction hash and status for verification

**Transaction Flow:**
1. SDK maintains ephemeral key pair, wallet address, and ZK proofs after login
2. When sending tokens, SDK fetches current nonce automatically
3. Transaction is signed with ephemeral private key
4. ZK proof is attached to protect sender/receiver privacy
5. Transaction is submitted to MMN and returns tx_hash if successful
6. Recipient automatically receives DM notification with transaction details

- **Coffee system**: Social interaction feature via `onGiveCoffee()` events for casual gifting

### Interactive Elements
- **Message buttons**: Support for interactive buttons in messages via `onMessageButtonClicked()`
- **Dropdown selections**: Handle user selections from dropdown menus via `onDropdownBoxSelected()`
- **Quick menus**: Support for quick action menus via `onQuickMenuEvent()`

### Voice and Video Features
- **Voice channels**: Complete voice session management with start, end, join, and leave events
- **WebRTC signaling**: Direct peer-to-peer communication support via `onWebrtcSignalingFwd()`
- **Streaming support**: Live streaming capabilities with join/leave event handling