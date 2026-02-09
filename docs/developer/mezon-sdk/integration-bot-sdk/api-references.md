---
sidebar_position: 5
---

# API References

This section provides a brief overview of the primary classes and structures in the `mezon-sdk`. For detailed type information, refer to the TypeScript definitions within the SDK source (`src/interfaces/` and `src/mezon-client/structures/`).

## MezonClient (`MezonClient.ts`)

The primary class for interacting with the Mezon API and real-time events. It manages the connection, data caching, and event handling.

### **Key Properties**

| Property         | Type                               | Description                                                            |
| :--------------- | :--------------------------------- | :--------------------------------------------------------------------- |
| `token`          | `string`                           | The authentication token for the client.                               |
| `clientId`       | `string` \| `undefined`            | The ID of the logged-in client (bot/user), set after authentication.   |
| `host`           | `string`                           | The hostname of the Mezon server.                                      |
| `useSSL`         | `boolean`                          | Indicates if the connection uses SSL/TLS.                               |
| `port`           | `string`                           | The port used for the connection.                                       |
| `loginBasePath`  | `string` \| `undefined`            | The base path used for initial authentication.                          |
| `timeout`        | `number`                           | **Read-only.** The timeout in milliseconds for API requests.            |
| `clans`          | `CacheManager<string, Clan>`       | A cache manager for all clans the client has access to.                |
| `channels`       | `CacheManager<string, TextChannel>`| A cache manager for all channels the client has access to.             |

### **Key Private Properties**

| Property         | Type                 | Description                                                    |
| :--------------- | :------------------- | :------------------------------------------------------------- |
| `apiClient`      | `MezonApi`           | An instance of the MezonApi for making direct API calls.       |
| `socketManager`  | `SocketManager`      | Manages the WebSocket connection and its lifecycle.            |
| `channelManager` | `ChannelManager`     | Manages channel-related operations, particularly DM channels.  |
| `sessionManager` | `SessionManager`     | Manages the client's session and authentication.               |
| `eventManager`   | `EventManager`       | Handles the subscription and emission of events.               |
| `messageQueue`   | `AsyncThrottleQueue` | Rate-limited queue for managing outgoing requests.             |
| `messageDB`      | `MessageDatabase`    | An interface to the local SQLite database for message storage. |

### **Key Methods**

#### `constructor(config: ClientConfigDto)`

Initializes a new `MezonClient` instance.

| Parameter | Type              | Description                                       |
| :-------- | :---------------- | :------------------------------------------------ |
| config    | ClientConfigDto   | Configuration object for the client               |

**ClientConfigDto Properties:**

| Property   | Type    | Required | Default                            | Description                                       |
| :--------- | :------ | :------- | :--------------------------------- | :------------------------------------------------ |
| botId      | string  | Yes      | -                                  | The bot ID from the Mezon Developer Portal        |
| token      | string  | Yes      | -                                  | The bot token/API key for authentication          |
| host       | string  | No       | "gw.mezon.ai"                      | The host address of the Mezon gateway             |
| port       | string  | No       | "443"                              | The port number for the connection                |
| useSSL     | boolean | No       | true                               | Specifies whether to use a secure SSL connection  |
| timeout    | number  | No       | 7000                               | The timeout in milliseconds for API requests      |
| mmnApiUrl  | string  | No       | "https://dong.mezon.ai/mmn-api/"   | MMN API endpoint for token transfer operations    |
| zkApiUrl   | string  | No       | "https://dong.mezon.ai/zk-api/"    | ZK API endpoint for zero-knowledge proof operations |

#### `login(): Promise<string>`

Authenticates the client with the Mezon service, establishes a WebSocket connection, and initializes all necessary managers and caches. It emits the ready event upon successful connection.

#### `sendToken(tokenEvent: APISentTokenRequest): Promise<any>`

Sends a specified amount of tokens to another user using the Mezon Money Network (MMN) with zero-knowledge proofs for privacy.

| Parameter    | Type                  | Description                                   |
| :----------- | :-------------------- | :-------------------------------------------- |
| tokenEvent   | APISentTokenRequest   | The details of the token transfer             |

**APISentTokenRequest Properties:**

| Property          | Type      | Required | Description                                        |
| :---------------- | :-------- | :------- | :------------------------------------------------- |
| sender_id         | string    | No       | Sender ID (defaults to client ID if not provided)  |
| receiver_id       | string    | Yes      | Recipient user ID                                  |
| amount            | number    | Yes      | Amount of tokens to send                           |
| note              | string    | No       | Optional note/message for the transfer             |
| sender_name       | string    | No       | Sender's display name                              |
| extra_attribute   | string    | No       | Additional metadata for the transaction            |
| mmn_extra_info    | object    | No       | Extra MMN-specific information                     |

**Return Value:**
- Returns an object with `ok: boolean`, `tx_hash: string`, and `error: string` properties

**Notes:**
- The SDK automatically handles ephemeral key pair generation, nonce management, and zero-knowledge proof creation
- These are initialized during the `login()` process and stored for subsequent token transfers
- Amounts are automatically scaled to the correct decimal places

#### `getEphemeralKeyPair(): Promise<IEphemeralKeyPair>`

Generates an ephemeral key pair for secure token transactions.

**Return Value:**
- Returns `{ publicKey: string, privateKey: string }`

#### `getAddress(userId: string): Promise<string>`

Retrieves the wallet address for a given user ID.

| Parameter | Type   | Description                   |
| :-------- | :----- | :---------------------------- |
| userId    | string | The user ID to get address for |

**Return Value:**
- Returns the user's wallet address as a string

#### `getZkProofs(data: ApiGetZkProofRequest): Promise<IZkProof>`

Generates zero-knowledge proofs for privacy-preserving token transactions.

| Parameter | Type                  | Description                        |
| :-------- | :-------------------- | :--------------------------------- |
| data      | ApiGetZkProofRequest  | The request data for ZK proof      |

**ApiGetZkProofRequest Properties:**

| Property               | Type   | Description                    |
| :--------------------- | :----- | :----------------------------- |
| user_id                | string | The user ID                    |
| jwt                    | string | The session JWT token          |
| address                | string | The wallet address             |
| ephemeral_public_key   | string | The ephemeral public key       |

**Return Value:**
- Returns `{ proof: string, public_input: string }`

#### `getCurrentNonce(userId: string, tag?: 'latest' | 'pending'): Promise<{ nonce: number }>`

Fetches the current transaction nonce for a user.

| Parameter | Type                      | Default    | Description                        |
| :-------- | :------------------------ | :--------- | :--------------------------------- |
| userId    | string                    | -          | The user ID                        |
| tag       | 'latest' \| 'pending'     | 'pending'  | Which nonce to retrieve            |

**Return Value:**
- Returns an object containing the nonce number

#### `getListFriends(limit?: number, state?: string, cursor?: string): Promise<any>`

Retrieves a list of the client's friends.

| Parameter | Type   | Default | Description                                                      |
| :-------- | :----- | :------ | :--------------------------------------------------------------- |
| limit     | number | ""      | (Optional) The maximum number of friends to retrieve.            |
| state     | string | ""      | (Optional) The friendship state to filter by (e.g., "accepted"). |
| cursor    | string | ""      | (Optional) The cursor for pagination.                            |

#### `addFriend(username: string): Promise<any>`

Sends a friend request to a user by their username.

| Parameter | Type     | Description                                  |
| :-------- | :------- | :------------------------------------------- |
| username  | `string` | The username of the user to add as a friend. |

#### `acceptFriend(userId: string, username: string): Promise<any>`

Accepts a friend request from a user.

| Parameter | Type     | Description                                        |
| :-------- | :------- | :------------------------------------------------- |
| userId    | `string` | The ID of the user whose friend request to accept. |
| username  | `string` | The username of the user.                          |

#### `createDMchannel(userId: string): Promise<ApiChannelDescription | null>`

Creates a direct message channel with a specific user.

| Parameter | Type     | Description                                    |
| :-------- | :------- | :--------------------------------------------- |
| userId    | `string` | The ID of the user to create a DM channel with. |

#### `closeSocket(): void`

Closes the WebSocket connection and resets the event manager.

#### `initManager(basePath: string, sessionApi?: Session): void`

Initializes all internal managers after authentication. This is called automatically by `login()`.

| Parameter    | Type      | Description                                          |
| :----------- | :-------- | :--------------------------------------------------- |
| basePath     | `string`  | The base URL for API requests.                       |
| sessionApi   | `Session` | (Optional) An existing session to restore.           |

### **Key Events Handling**

#### **Message Events**

- `onChannelMessage(listener: (e: ChannelMessage) => void): this`: Listens for new messages in any channel/thread the client is in.

- `onMessageReaction(listener: (e: MessageReaction) => void): this`: Listens for reactions being added or removed from a message.

- `onMessageButtonClicked(listener: (e: MessageButtonClicked) => void): this`: Listens for clicks on buttons within embed messages.

- `onDropdownBoxSelected(listener: (e: DropdownBoxSelected) => void): this`: Listens for a user selecting an option from a dropdown menu in a message.

#### **Channel Events**

- `onChannelCreated(listener: (e: ChannelCreatedEvent) => void): this`: Listens for the creation of a new channel.

- `onChannelUpdated(listener: (e: ChannelUpdatedEvent) => void): this`: Listens for updates to an existing channel's information.

- `onChannelDeleted(listener: (e: ChannelDeletedEvent) => void): this`: Listens for the deletion of a channel.

#### **User & Clan Events**

- `onAddClanUser(listener: (e: AddClanUserEvent) => void): this`: Listens for a user being added to a clan.

- `onUserClanRemoved(listener: (e: UserClanRemovedEvent) => void): this`: Listens for a user being removed or leaving a clan.

- `onUserChannelAdded(listener: (e: UserChannelAddedEvent) => void): this`: Listens for a user being added to a channel.

- `onUserChannelRemoved(listener: (e: UserChannelRemoved) => void): this`: Listens for a user being removed from a channel.

#### **Role Events**

- `onRoleEvent(listener: (e: RoleEvent) => void): this`: Listens for the creation or update of a role in a clan.

- `onRoleAssign(listener: (e: RoleAssignedEvent) => void): this`: Listens for a role being assigned to a user.

#### **Voice & Streaming Events**

- `onVoiceStartedEvent(listener: (e: VoiceStartedEvent) => void): this`: Listens for the start of a voice chat.

- `onVoiceEndedEvent(listener: (e: VoiceEndedEvent) => void): this`: Listens for the end of a voice chat.

- `onVoiceJoinedEvent(listener: (e: VoiceJoinedEvent) => void): this`: Listens for a user joining a voice chat.

- `onVoiceLeavedEvent(listener: (e: VoiceLeavedEvent) => void): this`: Listens for a user leaving a voice chat.

- `onStreamingJoinedEvent(listener: (e: StreamingJoinedEvent) => void): this`: Listens for a user joining a stream.

- `onStreamingLeavedEvent(listener: (e: StreamingLeavedEvent) => void): this`: Listens for a user leaving a stream.

- `onWebrtcSignalingFwd(listener: (e: WebrtcSignalingFwd) => void): this`: Listens for WebRTC signaling events, typically for P2P calls.

#### **Other Events**

- `onTokenSend(listener: (e: TokenSentEvent) => void): this`: Listens for token transfer events between users.

- `onGiveCoffee(listener: (e: GiveCoffeeEvent) => void): this`: Listens for "give coffee" events.

- `onClanEventCreated(listener: (e: CreateEventRequest) => void): this`: Listens for the creation of a new clan event.

- `onNotification(listener: (e: Notifications) => void): this`: Listens for incoming notifications for the client.

- `onQuickMenuEvent(listener: (e: QuickMenuEvent) => void): this`: Listens for quick menu interaction events.

## Session (`session.ts`, `session_manager.ts`)

This API reference outlines the key components for handling user sessions with the Mezon server.

**`ISession` Interface**: Defines the contract for a user session, containing tokens, expiry information, and user details.

**`Session Class`**: A concrete implementation of the ISession interface. It provides methods to create, manage, and update a user session from JWT tokens.

## Session Class

### **Key Properties**

| Property             | Type       | Description                                                                     |
| :------------------- | :--------- | :------------------------------------------------------------------------------ |
| `token`              | `string`   | The JWT authorization token for the session.                                    |
| `created_at`         | `number`   | **Read-only.** The UNIX timestamp marking when the session was created.         |
| `expires_at`         | `number?`  | (Optional) The UNIX timestamp when the `token` will expire.                     |
| `refresh_expires_at` | `number?`  | (Optional) The UNIX timestamp when the `refresh_token` will expire.             |
| `refresh_token`      | `string`   | The token used to obtain a new session `token` when the current one expires.    |
| `user_id`            | `string?`  | (Optional) The ID of the user associated with this session.                     |
| `vars`               | `object?`  | (Optional) A key-value object of custom properties associated with the session. |
| `api_url`            | `string?`  | (Optional) The base URL for API requests, provided during authentication.       |

### **Key Methods**

#### `constructor`

**`new Session(apiSession: any)`**: Initializes a new `Session` instance.

| Parameter    | Type  | Description                                                                                                             |
| :----------- | :---- | :---------------------------------------------------------------------------------------------------------------------- |
| `apiSession` | `any` | An object containing session data, typically from an authentication response. Must include `token` and `refresh_token`. |

**`new SessionManager(apiClient: MezonApi, session?: Session)`**: Initializes a new `SessionManager` instance.

| Parameter   | Type       | Description                                                               |
| :---------- | :--------- | :------------------------------------------------------------------------ |
| `apiClient` | `MezonApi` | An instance of the `MezonApi` class used to make authentication requests. |
| `session`   | `Session`  | (Optional) An existing `Session` object to restore.                       |

**For `Session`**

#### `isexpired(currenttime: number): boolean`

Checks if the session token has expired relative to the provided time.

| Parameter     | Type     | Description                                                         |
| :------------ | :------- | :------------------------------------------------------------------ |
| `currenttime` | `number` | The current UNIX timestamp to compare against the session's expiry. |

#### `isrefreshexpired(currenttime: number): boolean`

Checks if the refresh token has expired relative to the provided time.

| Parameter     | Type     | Description                                                               |
| :------------ | :------- | :------------------------------------------------------------------------ |
| `currenttime` | `number` | The current UNIX timestamp to compare against the refresh token's expiry. |

#### `update(token: string, refreshToken: string): void`

Updates the session with a new `token` and `refreshToken`. This method decodes the tokens to update expiry times and other session variables.

| Parameter      | Type     | Description                |
| :------------- | :------- | :------------------------- |
| `token`        | `string` | The new JWT session token. |
| `refreshToken` | `string` | The new JWT refresh token. |

#### `static restore(session: any): Session`

A static factory method that creates a new `Session` instance from a previously stored session object. This is useful for rehydrating a session from local storage.

| Parameter | Type  | Description                                   |
| :-------- | :---- | :-------------------------------------------- |
| `session` | `any` | A plain object representing a stored session. |

## SessionManager Class

The `SessionManager` handles authentication and session lifecycle management.

### **Key Properties**

| Property    | Type              | Description                                            |
| :---------- | :---------------- | :----------------------------------------------------- |
| `apiClient` | `MezonApi`        | **Private.** The API client used for authentication.   |
| `session`   | `Session?`        | **Private.** The currently active session, if any.     |

### **Key Methods**

#### `constructor(apiClient: MezonApi, session?: Session)`

Initializes a new `SessionManager` instance.

| Parameter   | Type       | Description                                                               |
| :---------- | :--------- | :------------------------------------------------------------------------ |
| `apiClient` | `MezonApi` | An instance of the `MezonApi` class used to make authentication requests. |
| `session`   | `Session?` | (Optional) An existing `Session` object to restore.                       |

#### `authenticate(apiKey: string): Promise<Session>`

Authenticates the user with the Mezon server using an API key. On success, it creates and stores a new `Session` object.

| Parameter | Type     | Description                          |
| :-------- | :------- | :----------------------------------- |
| `apiKey`  | `string` | The API key used for authentication. |

#### `logout(): Promise<boolean>`

Logs out the currently authenticated user by invalidating the session and refresh tokens on the server.

#### `getSession(): Session | undefined`

Retrieves the currently stored session object.

## TextChannel (`TextChannel.ts`)

This API reference outlines the key components of the `TextChannel` class, which represents a text-based communication channel within a clan.

### **Key Properties**

| Property         | Type                            | Description                                            |
| :--------------- | :------------------------------ | :----------------------------------------------------- |
| `id`             | `string?`                       | The unique identifier for the channel.                 |
| `name`           | `string?`                       | The display name of the channel.                       |
| `is_private`     | `boolean`                       | `true` if the channel is private, otherwise `false`.   |
| `channel_type`   | `number?`                       | The type of the channel (e.g., standard text, thread). |
| `category_id`    | `string?`                       | The ID of the category this channel belongs to.        |
| `category_name`  | `string?`                       | The name of the category this channel belongs to.      |
| `parent_id`      | `string?`                       | The ID of the parent channel, if this is a thread.     |
| `meeting_code`   | `string?`                       | The meeting code for voice channels.                   |
| `clan`           | `Clan`                          | A reference to the parent `Clan` instance.             |
| `messages`       | `CacheManager<string, Message>` | A cache manager for the messages within this channel.  |

### **Key Private Properties**

| Property         | Type                 | Description                                                 |
| :--------------- | :------------------- | :---------------------------------------------------------- |
| `socketManager`  | `SocketManager`      | The manager for handling WebSocket communications.          |
| `messageQueue`   | `AsyncThrottleQueue` | A queue to manage the rate of outgoing messages.            |
| `messageDB`      | `MessageDatabase`    | The database interface for caching and retrieving messages. |

### **Key Methods**

#### `constructor(initChannelData, clan, socketManager, messageQueue, messageDB)`

Initializes a new `TextChannel` instance.

| Parameter         | Type                    | Description                                                 |
| :---------------- | :---------------------- | :---------------------------------------------------------- |
| `initChannelData` | `ApiChannelDescription` | An object containing the initial channel data from the API. |
| `clan`            | `Clan`                  | The parent `Clan` object that this channel belongs to.      |
| `socketManager`   | `SocketManager`         | The manager for handling WebSocket communications.          |
| `messageQueue`    | `AsyncThrottleQueue`    | A queue to manage the rate of outgoing messages.            |
| `messageDB`       | `MessageDatabase`       | The database interface for caching and retrieving messages. |

#### `send(content, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?)`

Sends a standard message to the channel. The request is added to a queue to prevent rate-limiting issues.

| Parameter           | Type                          | Description                                                          |
| :------------------ | :---------------------------- | :------------------------------------------------------------------- |
| `content`           | `ChannelMessageContent`       | The content of the message to be sent.                               |
| `mentions`          | `Array<ApiMessageMention>`    | (Optional) An array of user mentions to include in the message.      |
| `attachments`       | `Array<ApiMessageAttachment>` | (Optional) An array of attachments (e.g., images, files) to include. |
| `mention_everyone`  | `boolean`                     | (Optional) Whether to notify everyone in the channel.                |
| `anonymous_message` | `boolean`                     | (Optional) Whether to send the message anonymously.                  |
| `topic_id`          | `string`                      | (Optional) The ID of the topic (thread) this message belongs to.     |
| `code`              | `number`                      | (Optional) A special code associated with the message type.          |

#### `sendEphemeral(receiver_id, content, reference_message_id?, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?)`

Sends an ephemeral message, which is visible only to a specific user (`receiver_id`) within the channel.

| Parameter              | Type                          | Description                                                      |
| :--------------------- | :---------------------------- | :--------------------------------------------------------------- |
| `receiver_id`          | `string`                      | The ID of the user who will be able to see the message.          |
| `content`              | `any`                         | The content of the ephemeral message.                            |
| `reference_message_id` | `string?`                     | (Optional) The ID of a message to reply to.                      |
| `mentions`             | `Array<ApiMessageMention>?`   | (Optional) An array of user mentions.                            |
| `attachments`          | `Array<ApiMessageAttachment>?`| (Optional) An array of attachments.                              |
| `mention_everyone`     | `boolean?`                    | (Optional) Whether to parse everyone mentions.                   |
| `anonymous_message`    | `boolean?`                    | (Optional) Whether to send the message anonymously.              |
| `topic_id`             | `string?`                     | (Optional) The ID of the topic (thread) this message belongs to. |
| `code`                 | `number?`                     | (Optional) A special code associated with the message type.      |

#### `addQuickMenuAccess(body: ApiQuickMenuAccessPayload): Promise<any>`

Adds a quick menu access for the channel.

| Parameter | Type                      | Description                           |
| :-------- | :------------------------ | :------------------------------------ |
| `body`    | `ApiQuickMenuAccessPayload` | The quick menu configuration payload. |

#### `deleteQuickMenuAccess(botId?: string): Promise<any>`

Removes quick menu access for the channel.

| Parameter | Type      | Description                                       |
| :-------- | :-------- | :------------------------------------------------ |
| `botId`   | `string?` | (Optional) The bot ID. Defaults to client ID.     |

#### `playMedia(url: string, participantIdentity: string, participantName: string, name: string): Promise<any>`

Plays media in a voice channel.

| Parameter             | Type     | Description                        |
| :-------------------- | :------- | :--------------------------------- |
| `url`                 | `string` | The URL of the media to play.      |
| `participantIdentity` | `string` | The participant's identity.        |
| `participantName`     | `string` | The participant's display name.    |
| `name`                | `string` | The name/title of the media.       |

## Message (`Message.ts`)

This API reference outlines the key components for representing and interacting with individual messages within a text channel.

## MessageInitData Interface

Defines the structure for the data object required to initialize a `Message` instance.

| Property              | Type                         | Description                                           |
| :-------------------- | :--------------------------- | :---------------------------------------------------- |
| `id`                  | `string`                     | The unique identifier of the message.                |
| `clan_id`             | `string`                     | The ID of the clan this message belongs to.          |
| `channel_id`          | `string`                     | The ID of the channel this message belongs to.       |
| `sender_id`           | `string`                     | The ID of the user who sent the message.             |
| `content`             | `ChannelMessageContent`      | The main content of the message.                     |
| `mentions`            | `ApiMessageMention[]?`       | (Optional) An array of user mentions.                |
| `attachments`         | `ApiMessageAttachment[]?`    | (Optional) An array of attachments.                  |
| `reactions`           | `ApiMessageReaction[]?`      | (Optional) An array of reactions on the message.     |
| `references`          | `ApiMessageRef[]?`           | (Optional) An array of referenced messages.          |
| `topic_id`            | `string?`                    | (Optional) The ID of the topic this message is in.   |
| `create_time_seconds` | `number?`                    | (Optional) The UNIX timestamp of message creation.   |

## Message Class

Represents a single message in a channel, containing its content and metadata. It provides methods to perform actions on the message, such as replying, updating, reacting, and deleting.

### **Key Properties**

| Property              | Type                     | Description                                                      |
| :-------------------- | :----------------------- | :--------------------------------------------------------------- |
| `id`                  | `string`                 | The unique identifier of the message.                            |
| `sender_id`           | `string`                 | The ID of the user who sent the message.                         |
| `content`             | `ChannelMessageContent`  | The main content of the message.                                 |
| `mentions`            | `ApiMessageMention[]`    | (Optional) An array of user mentions.                            |
| `attachments`         | `ApiMessageAttachment[]` | (Optional) An array of attachments.                              |
| `reactions`           | `ApiMessageReaction[]`   | (Optional) An array of reactions on the message.                 |
| `references`          | `ApiMessageRef[]`        | (Optional) An array of messages this message is referencing.     |
| `topic_id`            | `string`                 | (Optional) The ID of the topic (thread) this message is part of. |
| `create_time_seconds` | `number`                 | (Optional) The UNIX timestamp of the message's creation.         |
| `channel`             | `TextChannel`            | A reference to the parent `TextChannel` instance.                |

### **Key Methods**

#### `constructor(initMessageData, channel, socketManager, messageQueue)`

Initializes a new `Message` instance.

| Parameter         | Type                 | Description                                                    |
| :---------------- | :------------------- | :------------------------------------------------------------- |
| `initMessageData` | `MessageInitData`    | An object containing the initial message data.                 |
| `channel`         | `TextChannel`        | The parent `TextChannel` object where this message exists.     |
| `socketManager`   | `SocketManager`      | The manager for handling WebSocket communications.             |
| `messageQueue`    | `AsyncThrottleQueue` | A queue to manage the rate of outgoing actions on the message. |

#### `reply(content, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?)`

Sends a new message in the same channel, specifically as a reply to this message instance.

| Parameter           | Type                          | Description                                                                             |
| :------------------ | :---------------------------- | :-------------------------------------------------------------------------------------- |
| `content`           | `ChannelMessageContent`       | The content of the reply message.                                                       |
| `mentions`          | `Array<ApiMessageMention>`    | (Optional) An array of user mentions to include.                                        |
| `attachments`       | `Array<ApiMessageAttachment>` | (Optional) An array of attachments to include.                                          |
| `mention_everyone`  | `boolean`                     | (Optional) Whether to notify everyone in the channel.                                   |
| `anonymous_message` | `boolean`                     | (Optional) Whether to send the reply anonymously.                                       |
| `topic_id`          | `string`                      | (Optional) The ID of the topic for the reply. Defaults to the original message's topic. |
| `code`              | `number`                      | (Optional) A special code for the message type.                                         |

#### `update(content, mentions?, attachments?, topic_id?)`

Updates the content of this message.

| Parameter     | Type                          | Description                                   |
| :------------ | :---------------------------- | :-------------------------------------------- |
| `content`     | `ChannelMessageContent`       | The new content for the message.             |
| `mentions`    | `Array<ApiMessageMention>?`   | (Optional) Updated mentions.                 |
| `attachments` | `Array<ApiMessageAttachment>?`| (Optional) Updated attachments.              |
| `topic_id`    | `string?`                     | (Optional) The new topic ID for the message. |

#### `react(dataReactMessage: ReactMessagePayload): Promise<any>`

Adds or removes a reaction to/from this message.

| Parameter          | Type                  | Description                                                                                          |
| :----------------- | :-------------------- | :--------------------------------------------------------------------------------------------------- |
| `dataReactMessage` | `ReactMessagePayload` | An object containing the details of the reaction, such as the emoji and whether to add or remove it. |

#### `delete(): Promise<any>`

Deletes this message from the channel.

## User (`User.ts`)

This API reference outlines the key components for representing a user and interacting with them.

## UserInitData Interface

Defines the structure for the data object required to initialize a `User` instance.

| Property       | Type      | Description                                            |
| :------------- | :-------- | :----------------------------------------------------- |
| `id`           | `string`  | The unique identifier for the user.                    |
| `username`     | `string?` | (Optional) The user's global username.                |
| `clan_nick`    | `string?` | (Optional) The user's nickname in the clan context.   |
| `clan_avatar`  | `string?` | (Optional) The user's avatar URL in the clan context. |
| `display_name` | `string?` | (Optional) The user's public display name.            |
| `avartar`      | `string?` | (Optional) The user's global avatar URL.              |
| `dmChannelId`  | `string?` | (Optional) The ID of the DM channel with this user.   |

## User Class

Represents a user within the system, holding their profile information and providing methods for direct interaction, such as sending direct messages or tokens.

### **Key Properties**

| Property       | Type     | Description                                          |
| :------------- | :------- | :--------------------------------------------------- |
| `id`           | `string` | The unique identifier for the user.                  |
| `username`     | `string` | The user's global username.                          |
| `clan_nick`    | `string` | The user's nickname specific to the clan context.    |
| `clan_avatar`  | `string` | The user's avatar URL specific to the clan context.  |
| `display_name` | `string` | The user's public display name.                      |
| `avartar`      | `string` | The user's global avatar URL.                        |
| `dmChannelId`  | `string` | The ID of the direct message channel with this user. |

### **Key Private Properties**

| Property         | Type                 | Description                                                       |
| :--------------- | :------------------- | :---------------------------------------------------------------- |
| `clan`           | `Clan`               | The clan context this user instance belongs to.                  |
| `channelManager` | `ChannelManager?`    | (Optional) Manager for channel operations, used for creating DMs.|
| `messageQueue`   | `AsyncThrottleQueue` | Rate-limited queue for managing outgoing requests.               |
| `socketManager`  | `SocketManager`      | The manager for handling WebSocket communications.               |

---

### **Key Methods**

#### `constructor(initUserData, clan, messageQueue, socketManager, channelManager?)`

Initializes a new `User` instance.

| Parameter        | Type                 | Description                                                                        |
| :--------------- | :------------------- | :--------------------------------------------------------------------------------- |
| `initUserData`   | `UserInitData`       | An object containing the initial user data.                                        |
| `clan`           | `Clan`               | The `Clan` object this user instance is associated with.                           |
| `messageQueue`   | `AsyncThrottleQueue` | A queue to manage the rate of outgoing messages.                                   |
| `socketManager`  | `SocketManager`      | The manager for handling WebSocket communications.                                 |
| `channelManager` | `ChannelManager`     | (Optional) The manager for handling channel operations, required for creating DMs. |

#### `sendToken(sendTokenData: SendTokenData): Promise<any>`

Sends a specified amount of a token to this user.

| Parameter       | Type            | Description                                                                   |
| :-------------- | :-------------- | :---------------------------------------------------------------------------- |
| `sendTokenData` | `SendTokenData` | An object containing the `amount` and an optional `note` for the transaction. |

#### `sendDM(content: ChannelMessageContent, code?: number): Promise<any>`

Sends a direct message to this user. If a DM channel does not already exist, it will attempt to create one first.

| Parameter | Type                    | Description                                                 |
| :-------- | :---------------------- | :---------------------------------------------------------- |
| `content` | `ChannelMessageContent` | The content of the message to be sent.                      |
| `code`    | `number?`               | (Optional) A special code associated with the message type. |

#### `createDmChannel(): Promise<ApiChannelDescription | null>`

Explicitly creates a new direct message channel with this user.

#### `listTransactionDetail(transactionId: string): Promise<any>`

Retrieves the details of a specific transaction involving the user.

| Parameter       | Type     | Description                                           |
| :-------------- | :------- | :---------------------------------------------------- |
| `transactionId` | `string` | The unique identifier of the transaction to retrieve. |

## Clan (`Clan.ts`)

This API reference outlines the key components for representing a "Clan" (or server/guild) and managing its resources like channels, users, and roles.

## ClanInitData Interface

Defines the structure for the data object required to initialize a `Clan` instance.

| Property             | Type     | Description                               |
| :------------------- | :------- | :---------------------------------------- |
| `id`                 | `string` | The unique identifier for the clan.       |
| `name`               | `string` | The display name of the clan.             |
| `welcome_channel_id` | `string` | The ID of the default welcome channel.    |

## Clan Class

Represents a clan, which acts as a top-level container for a community's channels and users. It provides methods to fetch and manage these resources.

### **Key Properties**

| Property             | Type                                | Description                                                          |
| :------------------- | :---------------------------------- | :------------------------------------------------------------------- |
| `id`                 | `string`                            | The unique identifier for the clan.                                  |
| `name`               | `string`                            | The display name of the clan.                                        |
| `welcome_channel_id` | `string`                            | The ID of the default welcome channel.                               |
| `channels`           | `CacheManager<string, TextChannel>` | A cache manager for the channels belonging to this clan.             |
| `users`              | `CacheManager<string, User>`        | A cache manager for the users who are members of this clan.          |
| `sessionToken`       | `string`                            | The session token used for API requests in the context of this clan. |
| `apiClient`          | `MezonApi`                          | The API client instance used for making requests.                    |

### **Key Private Properties**

| Property            | Type                 | Description                                                |
| :------------------ | :------------------- | :--------------------------------------------------------- |
| `_channelsLoaded`   | `boolean`            | **Private.** Cache status for loaded channels.            |
| `_loadingPromise`   | `Promise<void>?`     | **Private.** Promise for ongoing channel loading process. |
| `client`            | `MezonClient`        | **Private.** Reference to the main client instance.       |
| `socketManager`     | `SocketManager`      | **Private.** The WebSocket manager.                       |
| `messageQueue`      | `AsyncThrottleQueue` | **Private.** Rate-limited message queue.                  |
| `messageDB`         | `MessageDatabase`    | **Private.** Local message database interface.            |

### **Key Methods**

#### `constructor(initClanData, client, apiClient, socketManager, sessionToken, messageQueue, messageDB)`

Initializes a new `Clan` instance.

| Parameter       | Type                 | Description                                                 |
| :-------------- | :------------------- | :---------------------------------------------------------- |
| `initClanData`  | `ClanInitData`       | An object containing the initial clan data.                 |
| `client`        | `MezonClient`        | The main `MezonClient` instance.                            |
| `apiClient`     | `MezonApi`           | An instance of the API client for making server requests.   |
| `socketManager` | `SocketManager`      | The manager for handling WebSocket communications.          |
| `sessionToken`  | `string`             | The session token used for authenticating API calls.        |
| `messageQueue`  | `AsyncThrottleQueue` | A queue to manage the rate of outgoing messages.            |
| `messageDB`     | `MessageDatabase`    | The database interface for caching and retrieving messages. |

#### `getClientId(): string | undefined`

Returns the client ID (bot's user ID) from the main client instance.

#### `loadChannels(): Promise<void>`

Fetches and caches all text channels associated with the clan from the server. This method ensures it only runs once to prevent redundant API calls.

#### `listChannelVoiceUsers(channel_id?, channel_type?, limit?, state?, cursor?): Promise<ApiVoiceChannelUserList>`

Retrieves a list of users currently present in a specific voice channel within the clan.

| Parameter      | Type      | Default                                | Description                                                        |
| :------------- | :-------- | :------------------------------------- | :----------------------------------------------------------------- |
| `channel_id`   | `string?` | `""`                                   | (Optional) The ID of the voice channel.                           |
| `channel_type` | `number?` | `ChannelType.CHANNEL_TYPE_GMEET_VOICE` | (Optional) The type of voice channel.                             |
| `limit`        | `number?` | `500`                                  | (Optional) Max users to return (must be between 1 and 500).      |
| `state`        | `number?` | `undefined`                            | (Optional) A state filter for the user list.                      |
| `cursor`       | `string?` | `undefined`                            | (Optional) The cursor for paginating through results.             |

#### `updateRole(roleId: string, request: MezonUpdateRoleBody): Promise<boolean>`

Updates the properties of a specific role within the clan.

| Parameter | Type                  | Description                                           |
| :-------- | :-------------------- | :---------------------------------------------------- |
| `roleId`  | `string`              | The unique identifier of the role to update.          |
| `request` | `MezonUpdateRoleBody` | An object containing the new properties for the role. |

#### `listRoles(limit?: string, state?: string, cursor?: string): Promise<ApiRoleListEventResponse>`

Retrieves a list of all roles available in the clan.

| Parameter | Type     | Description                                           |
| :-------- | :------- | :---------------------------------------------------- |
| `limit`   | `string` | (Optional) The maximum number of roles to return.     |
| `state`   | `string` | (Optional) A state filter for the role list.          |
| `cursor`  | `string` | (Optional) The cursor for paginating through results. |

## Common Interfaces and Types

### ChannelMessageContent

Defines the structure for message content.

| Property     | Type                     | Description                                         |
| :----------- | :----------------------- | :-------------------------------------------------- |
| `t`          | `string?`                | (Optional) The main text content of the message.   |
| `hg`         | `HashtagOnMessage[]?`    | (Optional) Array of hashtag references.            |
| `ej`         | `EmojiOnMessage[]?`      | (Optional) Array of emoji references.              |
| `lk`         | `LinkOnMessage[]?`       | (Optional) Array of link references.               |
| `mk`         | `MarkdownOnMessage[]?`   | (Optional) Array of markdown formatting.           |
| `vk`         | `LinkVoiceRoomOnMessage[]?` | (Optional) Array of voice room links.           |
| `embed`      | `IInteractiveMessageProps[]?` | (Optional) Array of embedded content.         |
| `components` | `IMessageActionRow[]?`   | (Optional) Array of interactive components.        |

### SendTokenData

Defines the structure for token transfer data.

| Property          | Type      | Description                                    |
| :---------------- | :-------- | :--------------------------------------------- |
| `amount`          | `number`  | The amount of tokens to send.                  |
| `note`            | `string?` | (Optional) A note or description for the transfer. |
| `extra_attribute` | `string?` | (Optional) Additional metadata for the transfer.   |

### TokenSentEvent

Represents a token transfer event.

| Property          | Type      | Description                                        |
| :---------------- | :-------- | :------------------------------------------------- |
| `sender_id`       | `string?` | (Optional) The ID of the user sending tokens.     |
| `sender_name`     | `string?` | (Optional) The name of the user sending tokens.   |
| `receiver_id`     | `string`  | The ID of the user receiving tokens.              |
| `amount`          | `number`  | The amount of tokens being transferred.           |
| `note`            | `string?` | (Optional) A note attached to the transfer.       |
| `extra_attribute` | `string?` | (Optional) Additional metadata.                   |
| `transaction_id`  | `string?` | (Optional) The unique transaction identifier.     |

### ReactMessagePayload

Defines the structure for message reactions.

| Property       | Type       | Description                                               |
| :------------- | :--------- | :-------------------------------------------------------- |
| `id`           | `string?`  | (Optional) The unique identifier of the reaction.        |
| `emoji_id`     | `string`   | The identifier of the emoji.                             |
| `emoji`        | `string`   | The emoji character or string.                           |
| `count`        | `number`   | The count of this reaction (managed by server).          |
| `action_delete`| `boolean?` | (Optional) `true` to remove, `false` to add (default).   |

### ApiChannelDescription

Represents channel metadata and properties.

| Property               | Type       | Description                                           |
| :--------------------- | :--------- | :---------------------------------------------------- |
| `channel_id`           | `string?`  | (Optional) The unique identifier of the channel.     |
| `channel_label`        | `string?`  | (Optional) The display name of the channel.          |
| `clan_id`              | `string?`  | (Optional) The ID of the clan this channel belongs to.|
| `type`                 | `number?`  | (Optional) The type of channel.                      |
| `channel_private`      | `number?`  | (Optional) Whether the channel is private (1) or not (0).|
| `category_id`          | `string?`  | (Optional) The ID of the category.                   |
| `category_name`        | `string?`  | (Optional) The name of the category.                 |
| `parent_id`            | `string?`  | (Optional) The ID of the parent channel.             |
| `meeting_code`         | `string?`  | (Optional) The meeting code for voice channels.      |
| `creator_id`           | `string?`  | (Optional) The ID of the channel creator.            |
| `create_time_seconds`  | `number?`  | (Optional) The creation timestamp.                   |
| `update_time_seconds`  | `number?`  | (Optional) The last update timestamp.                |

## Constants and Enums

### ChannelType

Defines the different types of channels available in Mezon.

| Constant                    | Value | Description                        |
| :-------------------------- | :---- | :--------------------------------- |
| `CHANNEL_TYPE_CHANNEL`      | `1`   | Standard text channel              |
| `CHANNEL_TYPE_GROUP`        | `2`   | Group channel                      |
| `CHANNEL_TYPE_DM`           | `3`   | Direct message channel             |
| `CHANNEL_TYPE_GMEET_VOICE`  | `4`   | Google Meet voice channel          |
| `CHANNEL_TYPE_FORUM`        | `5`   | Forum channel                      |
| `CHANNEL_TYPE_STREAMING`    | `6`   | Streaming channel                  |
| `CHANNEL_TYPE_THREAD`       | `7`   | Thread channel                     |
| `CHANNEL_TYPE_APP`          | `8`   | Application channel                |
| `CHANNEL_TYPE_ANNOUNCEMENT` | `9`   | Announcement channel               |
| `CHANNEL_TYPE_MEZON_VOICE`  | `10`  | Mezon native voice channel        |

### ChannelStreamMode

Defines the streaming modes for different channel types.

| Constant              | Value | Description                    |
| :-------------------- | :---- | :----------------------------- |
| `STREAM_MODE_CHANNEL` | `2`   | Channel stream mode            |
| `STREAM_MODE_GROUP`   | `3`   | Group stream mode              |
| `STREAM_MODE_DM`      | `4`   | Direct message stream mode     |
| `STREAM_MODE_CLAN`    | `5`   | Clan stream mode               |
| `STREAM_MODE_THREAD`  | `6`   | Thread stream mode             |

### TypeMessage

Defines different message types and their purposes.

| Constant        | Value | Description                      |
| :-------------- | :---- | :------------------------------- |
| `Chat`          | `0`   | Standard chat message            |
| `ChatUpdate`    | `1`   | Updated chat message             |
| `ChatRemove`    | `2`   | Removed chat message             |
| `Typing`        | `3`   | Typing indicator                 |
| `Indicator`     | `4`   | Status indicator                 |
| `Welcome`       | `5`   | Welcome message                  |
| `CreateThread`  | `6`   | Thread creation message          |
| `CreatePin`     | `7`   | Pin creation message             |
| `MessageBuzz`   | `8`   | Buzz/notification message        |
| `Topic`         | `9`   | Topic message                    |
| `AuditLog`      | `10`  | Audit log message                |
| `SendToken`     | `11`  | Token transfer message           |
| `Ephemeral`     | `12`  | Ephemeral (temporary) message    |

### Events

All available event types for the MezonClient event listeners.

| Event Name             | Description                                    |
| :--------------------- | :--------------------------------------------- |
| `ChannelMessage`       | New message received in a channel             |
| `MessageReaction`      | Reaction added/removed from a message         |
| `UserChannelRemoved`   | User removed from a channel                   |
| `UserClanRemoved`      | User removed from a clan                      |
| `UserChannelAdded`     | User added to a channel                       |
| `ChannelCreated`       | New channel created                           |
| `ChannelDeleted`       | Channel deleted                               |
| `ChannelUpdated`       | Channel information updated                   |
| `RoleEvent`            | Role created or updated                       |
| `GiveCoffee`           | Coffee given between users                    |
| `RoleAssign`           | Role assigned to user                         |
| `AddClanUser`          | User added to clan                            |
| `TokenSend`            | Token transfer between users                  |
| `ClanEventCreated`     | Clan event created                            |
| `MessageButtonClicked` | Interactive button clicked                    |
| `StreamingJoinedEvent` | User joined streaming session                 |
| `StreamingLeavedEvent` | User left streaming session                   |
| `DropdownBoxSelected`  | Dropdown option selected                      |
| `WebrtcSignalingFwd`   | WebRTC signaling for voice/video calls       |
| `VoiceStartedEvent`    | Voice session started                         |
| `VoiceEndedEvent`      | Voice session ended                           |
| `VoiceJoinedEvent`     | User joined voice channel                     |
| `VoiceLeavedEvent`     | User left voice channel                       |
| `Notifications`        | General notifications received                |
| `QuickMenu`            | Quick menu interaction                        |

## Usage Notes

- **Rate Limiting**: All message sending operations use `AsyncThrottleQueue` to prevent rate limiting.
- **Caching**: The SDK extensively uses `CacheManager` for efficient data access and reduced API calls.
- **Authentication**: Dynamic endpoint resolution ensures optimal server routing after authentication.
- **Event Handling**: All events are automatically processed and cached appropriately.
- **Error Handling**: Most methods return promises that should be properly handled with try-catch blocks.
- **TypeScript**: The SDK is fully typed with TypeScript for better development experience.

