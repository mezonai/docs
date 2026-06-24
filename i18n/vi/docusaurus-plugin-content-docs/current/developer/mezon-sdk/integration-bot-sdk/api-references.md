---
sidebar_position: 5
---

# Tài liệu API

Phần này cung cấp tổng quan ngắn gọn về các class và cấu trúc chính trong `mezon-sdk`. Để biết thông tin kiểu chi tiết, hãy tham khảo định nghĩa TypeScript trong mã nguồn SDK (`src/interfaces/` và `src/mezon-client/structures/`).

## MezonClient (`MezonClient.ts`)

Class chính để tương tác với API Mezon và các sự kiện thời gian thực. Nó quản lý kết nối, cache dữ liệu và xử lý sự kiện.

### **Thuộc tính chính**

| Property         | Type                               | Mô tả                                                            |
| :--------------- | :--------------------------------- | :--------------------------------------------------------------------- |
| `token`          | `string`                           | Token xác thực của client.                               |
| `clientId`       | `string` \| `undefined`            | ID của client đã đăng nhập (bot/người dùng), được gán sau khi xác thực.   |
| `host`           | `string`                           | Hostname của máy chủ Mezon.                                      |
| `useSSL`         | `boolean`                          | Cho biết kết nối có dùng SSL/TLS hay không.                               |
| `port`           | `string`                           | Cổng dùng cho kết nối.                                       |
| `loginBasePath`  | `string` \| `undefined`            | Đường dẫn cơ sở dùng cho xác thực ban đầu.                          |
| `timeout`        | `number`                           | **Chỉ đọc.** Thời gian chờ tính bằng mili giây cho các yêu cầu API.            |
| `clans`          | `CacheManager<string, Clan>`       | Trình quản lý cache cho tất cả clan mà client có quyền truy cập.                |
| `channels`       | `CacheManager<string, TextChannel>`| Trình quản lý cache cho tất cả kênh mà client có quyền truy cập.             |

### **Thuộc tính private chính**

| Property         | Type                 | Mô tả                                                    |
| :--------------- | :------------------- | :------------------------------------------------------------- |
| `apiClient`      | `MezonApi`           | Một instance của MezonApi để thực hiện các lời gọi API trực tiếp.       |
| `socketManager`  | `SocketManager`      | Quản lý kết nối WebSocket và vòng đời của nó.            |
| `channelManager` | `ChannelManager`     | Quản lý các thao tác liên quan đến kênh, đặc biệt là kênh DM.  |
| `sessionManager` | `SessionManager`     | Quản lý phiên và xác thực của client.               |
| `eventManager`   | `EventManager`       | Xử lý đăng ký và phát các sự kiện.               |
| `messageQueue`   | `AsyncThrottleQueue` | Hàng đợi giới hạn tốc độ để quản lý các yêu cầu gửi đi.             |
| `messageDB`      | `MessageDatabase`    | Giao diện tới cơ sở dữ liệu SQLite cục bộ để lưu trữ tin nhắn. |

### **Phương thức chính**

#### `constructor(config: ClientConfigDto)`

Khởi tạo một instance `MezonClient` mới.

| Parameter | Type              | Mô tả                                       |
| :-------- | :---------------- | :------------------------------------------------ |
| config    | ClientConfigDto   | Đối tượng cấu hình cho client               |

**Thuộc tính ClientConfigDto:**

| Property   | Type    | Bắt buộc | Mặc định                            | Mô tả                                       |
| :--------- | :------ | :------- | :--------------------------------- | :------------------------------------------------ |
| botId      | string  | Có      | -                                  | Bot ID từ Mezon Developer Portal        |
| token      | string  | Có      | -                                  | Bot token/API key để xác thực          |
| host       | string  | Không       | "gw.mezon.ai"                      | Địa chỉ host của gateway Mezon             |
| port       | string  | Không       | "443"                              | Số cổng cho kết nối                |
| useSSL     | boolean | Không       | true                               | Chỉ định có dùng kết nối SSL an toàn hay không  |
| timeout    | number  | Không       | 7000                               | Thời gian chờ tính bằng mili giây cho các yêu cầu API      |
| mmnApiUrl  | string  | Không       | "https://dong.mezon.ai/mmn-api/"   | Endpoint MMN API cho các thao tác chuyển token    |
| zkApiUrl   | string  | Không       | "https://dong.mezon.ai/zk-api/"    | Endpoint ZK API cho các thao tác zero-knowledge proof |

#### `login(): Promise<string>`

Xác thực client với dịch vụ Mezon, thiết lập kết nối WebSocket và khởi tạo tất cả manager cùng cache cần thiết. Phát sự kiện ready khi kết nối thành công.

#### `sendToken(tokenEvent: APISentTokenRequest): Promise<any>`

Gửi một lượng token chỉ định tới người dùng khác bằng Mezon Money Network (MMN) với zero-knowledge proof để bảo vệ quyền riêng tư.

| Parameter    | Type                  | Mô tả                                   |
| :----------- | :-------------------- | :-------------------------------------------- |
| tokenEvent   | APISentTokenRequest   | Chi tiết của giao dịch chuyển token             |

**Thuộc tính APISentTokenRequest:**

| Property          | Type      | Bắt buộc | Mô tả                                        |
| :---------------- | :-------- | :------- | :------------------------------------------------- |
| sender_id         | string    | Không       | ID người gửi (mặc định là client ID nếu không cung cấp)  |
| receiver_id       | string    | Có      | ID người nhận                                  |
| amount            | number    | Có      | Số lượng token cần gửi                           |
| note              | string    | Không       | Ghi chú/tin nhắn tùy chọn cho giao dịch             |
| sender_name       | string    | Không       | Tên hiển thị của người gửi                              |
| extra_attribute   | string    | Không       | Metadata bổ sung cho giao dịch            |
| mmn_extra_info    | object    | Không       | Thông tin bổ sung dành riêng cho MMN                     |

**Giá trị trả về:**
- Trả về đối tượng có các thuộc tính `ok: boolean`, `tx_hash: string` và `error: string`

**Ghi chú:**
- SDK tự động xử lý tạo cặp khóa ephemeral, quản lý nonce và tạo zero-knowledge proof
- Các thành phần này được khởi tạo trong quá trình `login()` và lưu lại cho các lần chuyển token sau
- Số tiền được tự động quy đổi sang số chữ số thập phân đúng

#### `getEphemeralKeyPair(): Promise<IEphemeralKeyPair>`

Tạo cặp khóa ephemeral cho các giao dịch token an toàn.

**Giá trị trả về:**
- Trả về `{ publicKey: string, privateKey: string }`

#### `getAddress(userId: string): Promise<string>`

Lấy địa chỉ ví cho một user ID.

| Parameter | Type   | Mô tả                   |
| :-------- | :----- | :---------------------------- |
| userId    | string | User ID cần lấy địa chỉ |

**Giá trị trả về:**
- Trả về địa chỉ ví của người dùng dưới dạng chuỗi

#### `getZkProofs(data: ApiGetZkProofRequest): Promise<IZkProof>`

Tạo zero-knowledge proof cho các giao dịch token bảo vệ quyền riêng tư.

| Parameter | Type                  | Mô tả                        |
| :-------- | :-------------------- | :--------------------------------- |
| data      | ApiGetZkProofRequest  | Dữ liệu yêu cầu ZK proof      |

**Thuộc tính ApiGetZkProofRequest:**

| Property               | Type   | Mô tả                    |
| :--------------------- | :----- | :----------------------------- |
| user_id                | string | User ID                    |
| jwt                    | string | JWT token của phiên          |
| address                | string | Địa chỉ ví             |
| ephemeral_public_key   | string | Khóa công khai ephemeral       |

**Giá trị trả về:**
- Trả về `{ proof: string, public_input: string }`

#### `getCurrentNonce(userId: string, tag?: 'latest' | 'pending'): Promise<{ nonce: number }>`

Lấy nonce giao dịch hiện tại của người dùng.

| Parameter | Type                      | Mặc định    | Mô tả                        |
| :-------- | :------------------------ | :--------- | :--------------------------------- |
| userId    | string                    | -          | User ID                        |
| tag       | 'latest' \| 'pending'     | 'pending'  | Nonce nào cần lấy            |

**Giá trị trả về:**
- Trả về đối tượng chứa số nonce

#### `getListFriends(limit?: number, state?: string, cursor?: string): Promise<any>`

Lấy danh sách bạn bè của client.

| Parameter | Type   | Mặc định | Mô tả                                                      |
| :-------- | :----- | :------ | :--------------------------------------------------------------- |
| limit     | number | ""      | (Tùy chọn) Số lượng bạn bè tối đa cần lấy.            |
| state     | string | ""      | (Tùy chọn) Trạng thái quan hệ bạn bè để lọc (ví dụ: "accepted"). |
| cursor    | string | ""      | (Tùy chọn) Con trỏ phân trang.                            |

#### `addFriend(username: string): Promise<any>`

Gửi lời mời kết bạn tới người dùng theo username.

| Parameter | Type     | Mô tả                                  |
| :-------- | :------- | :------------------------------------------- |
| username  | `string` | Username của người dùng cần thêm làm bạn bè. |

#### `acceptFriend(userId: string, username: string): Promise<any>`

Chấp nhận lời mời kết bạn từ người dùng.

| Parameter | Type     | Mô tả                                        |
| :-------- | :------- | :------------------------------------------------- |
| userId    | `string` | ID của người dùng có lời mời kết bạn cần chấp nhận. |
| username  | `string` | Username của người dùng.                          |

#### `createDMchannel(userId: string): Promise<ApiChannelDescription | null>`

Tạo kênh tin nhắn trực tiếp với một người dùng cụ thể.

| Parameter | Type     | Mô tả                                    |
| :-------- | :------- | :--------------------------------------------- |
| userId    | `string` | ID của người dùng cần tạo kênh DM. |

#### `closeSocket(): void`

Đóng kết nối WebSocket và đặt lại event manager.

#### `initManager(basePath: string, sessionApi?: Session): void`

Khởi tạo tất cả manager nội bộ sau khi xác thực. Được gọi tự động bởi `login()`.

| Parameter    | Type      | Mô tả                                          |
| :----------- | :-------- | :--------------------------------------------------- |
| basePath     | `string`  | URL cơ sở cho các yêu cầu API.                       |
| sessionApi   | `Session` | (Tùy chọn) Phiên hiện có để khôi phục.           |

### **Xử lý sự kiện chính**

#### **Sự kiện tin nhắn**

- `onChannelMessage(listener: (e: ChannelMessage) => void): this`: Lắng nghe tin nhắn mới trong bất kỳ kênh/chủ đề nào mà client tham gia.

- `onMessageReaction(listener: (e: MessageReaction) => void): this`: Lắng nghe khi reaction được thêm hoặc gỡ khỏi tin nhắn.

- `onMessageButtonClicked(listener: (e: MessageButtonClicked) => void): this`: Lắng nghe khi người dùng nhấn nút trong tin nhắn embed.

- `onDropdownBoxSelected(listener: (e: DropdownBoxSelected) => void): this`: Lắng nghe khi người dùng chọn một tùy chọn từ menu dropdown trong tin nhắn.

#### **Sự kiện kênh**

- `onChannelCreated(listener: (e: ChannelCreatedEvent) => void): this`: Lắng nghe khi một kênh mới được tạo.

- `onChannelUpdated(listener: (e: ChannelUpdatedEvent) => void): this`: Lắng nghe khi thông tin kênh hiện có được cập nhật.

- `onChannelDeleted(listener: (e: ChannelDeletedEvent) => void): this`: Lắng nghe khi một kênh bị xóa.

#### **Sự kiện người dùng & clan**

- `onAddClanUser(listener: (e: AddClanUserEvent) => void): this`: Lắng nghe khi người dùng được thêm vào clan.

- `onUserClanRemoved(listener: (e: UserClanRemovedEvent) => void): this`: Lắng nghe khi người dùng bị gỡ hoặc rời clan.

- `onUserChannelAdded(listener: (e: UserChannelAddedEvent) => void): this`: Lắng nghe khi người dùng được thêm vào kênh.

- `onUserChannelRemoved(listener: (e: UserChannelRemoved) => void): this`: Lắng nghe khi người dùng bị gỡ khỏi kênh.

#### **Sự kiện vai trò**

- `onRoleEvent(listener: (e: RoleEvent) => void): this`: Lắng nghe khi vai trò trong clan được tạo hoặc cập nhật.

- `onRoleAssign(listener: (e: RoleAssignedEvent) => void): this`: Lắng nghe khi vai trò được gán cho người dùng.

#### **Sự kiện thoại & streaming**

- `onVoiceStartedEvent(listener: (e: VoiceStartedEvent) => void): this`: Lắng nghe khi cuộc gọi thoại bắt đầu.

- `onVoiceEndedEvent(listener: (e: VoiceEndedEvent) => void): this`: Lắng nghe khi cuộc gọi thoại kết thúc.

- `onVoiceJoinedEvent(listener: (e: VoiceJoinedEvent) => void): this`: Lắng nghe khi người dùng tham gia cuộc gọi thoại.

- `onVoiceLeavedEvent(listener: (e: VoiceLeavedEvent) => void): this`: Lắng nghe khi người dùng rời cuộc gọi thoại.

- `onStreamingJoinedEvent(listener: (e: StreamingJoinedEvent) => void): this`: Lắng nghe khi người dùng tham gia stream.

- `onStreamingLeavedEvent(listener: (e: StreamingLeavedEvent) => void): this`: Lắng nghe khi người dùng rời stream.

- `onWebrtcSignalingFwd(listener: (e: WebrtcSignalingFwd) => void): this`: Lắng nghe sự kiện báo hiệu WebRTC, thường dùng cho cuộc gọi P2P.

#### **Sự kiện khác**

- `onTokenSend(listener: (e: TokenSentEvent) => void): this`: Lắng nghe sự kiện chuyển token giữa người dùng.

- `onGiveCoffee(listener: (e: GiveCoffeeEvent) => void): this`: Lắng nghe sự kiện "give coffee".

- `onClanEventCreated(listener: (e: CreateEventRequest) => void): this`: Lắng nghe khi sự kiện clan mới được tạo.

- `onNotification(listener: (e: Notifications) => void): this`: Lắng nghe thông báo đến cho client.

- `onQuickMenuEvent(listener: (e: QuickMenuEvent) => void): this`: Lắng nghe sự kiện tương tác quick menu.

## Session (`session.ts`, `session_manager.ts`)

Tài liệu API này mô tả các thành phần chính để xử lý phiên người dùng với máy chủ Mezon.

**`ISession` Interface**: Định nghĩa hợp đồng cho phiên người dùng, chứa token, thông tin hết hạn và chi tiết người dùng.

**`Session Class`**: Triển khai cụ thể của interface ISession. Cung cấp các phương thức để tạo, quản lý và cập nhật phiên người dùng từ JWT token.

## Session Class

### **Thuộc tính chính**

| Property             | Type       | Mô tả                                                                     |
| :------------------- | :--------- | :------------------------------------------------------------------------------ |
| `token`              | `string`   | JWT authorization token của phiên.                                    |
| `created_at`         | `number`   | **Chỉ đọc.** UNIX timestamp đánh dấu thời điểm phiên được tạo.         |
| `expires_at`         | `number?`  | (Tùy chọn) UNIX timestamp khi `token` hết hạn.                     |
| `refresh_expires_at` | `number?`  | (Tùy chọn) UNIX timestamp khi `refresh_token` hết hạn.             |
| `refresh_token`      | `string`   | Token dùng để lấy `token` phiên mới khi token hiện tại hết hạn.    |
| `user_id`            | `string?`  | (Tùy chọn) ID người dùng gắn với phiên này.                     |
| `vars`               | `object?`  | (Tùy chọn) Đối tượng key-value các thuộc tính tùy chỉnh gắn với phiên. |
| `api_url`            | `string?`  | (Tùy chọn) URL cơ sở cho các yêu cầu API, được cung cấp khi xác thực.       |

### **Phương thức chính**

#### `constructor`

**`new Session(apiSession: any)`**: Khởi tạo một instance `Session` mới.

| Parameter    | Type  | Mô tả                                                                                                             |
| :----------- | :---- | :---------------------------------------------------------------------------------------------------------------------- |
| `apiSession` | `any` | Đối tượng chứa dữ liệu phiên, thường từ phản hồi xác thực. Phải có `token` và `refresh_token`. |

**`new SessionManager(apiClient: MezonApi, session?: Session)`**: Khởi tạo một instance `SessionManager` mới.

| Parameter   | Type       | Mô tả                                                               |
| :---------- | :--------- | :------------------------------------------------------------------------ |
| `apiClient` | `MezonApi` | Instance của class `MezonApi` dùng để thực hiện các yêu cầu xác thực. |
| `session`   | `Session`  | (Tùy chọn) Đối tượng `Session` hiện có để khôi phục.                       |

**Dành cho `Session`**

#### `isexpired(currenttime: number): boolean`

Kiểm tra token phiên đã hết hạn so với thời gian được cung cấp hay chưa.

| Parameter     | Type     | Mô tả                                                         |
| :------------ | :------- | :------------------------------------------------------------------ |
| `currenttime` | `number` | UNIX timestamp hiện tại để so sánh với thời điểm hết hạn của phiên. |

#### `isrefreshexpired(currenttime: number): boolean`

Kiểm tra refresh token đã hết hạn so với thời gian được cung cấp hay chưa.

| Parameter     | Type     | Mô tả                                                               |
| :------------ | :------- | :------------------------------------------------------------------------ |
| `currenttime` | `number` | UNIX timestamp hiện tại để so sánh với thời điểm hết hạn của refresh token. |

#### `update(token: string, refreshToken: string): void`

Cập nhật phiên với `token` và `refreshToken` mới. Phương thức này giải mã token để cập nhật thời gian hết hạn và các biến phiên khác.

| Parameter      | Type     | Mô tả                |
| :------------- | :------- | :------------------------- |
| `token`        | `string` | JWT session token mới. |
| `refreshToken` | `string` | JWT refresh token mới. |

#### `static restore(session: any): Session`

Phương thức factory tĩnh tạo instance `Session` mới từ đối tượng phiên đã lưu trước đó. Hữu ích khi khôi phục phiên từ local storage.

| Parameter | Type  | Mô tả                                   |
| :-------- | :---- | :-------------------------------------------- |
| `session` | `any` | Đối tượng thuần đại diện cho phiên đã lưu. |

## SessionManager Class

`SessionManager` xử lý xác thực và quản lý vòng đời phiên.

### **Thuộc tính chính**

| Property    | Type              | Mô tả                                            |
| :---------- | :---------------- | :----------------------------------------------------- |
| `apiClient` | `MezonApi`        | **Private.** API client dùng cho xác thực.   |
| `session`   | `Session?`        | **Private.** Phiên đang hoạt động hiện tại, nếu có.     |

### **Phương thức chính**

#### `constructor(apiClient: MezonApi, session?: Session)`

Khởi tạo một instance `SessionManager` mới.

| Parameter   | Type       | Mô tả                                                               |
| :---------- | :--------- | :------------------------------------------------------------------------ |
| `apiClient` | `MezonApi` | Instance của class `MezonApi` dùng để thực hiện các yêu cầu xác thực. |
| `session`   | `Session?` | (Tùy chọn) Đối tượng `Session` hiện có để khôi phục.                       |

#### `authenticate(apiKey: string): Promise<Session>`

Xác thực người dùng với máy chủ Mezon bằng API key. Khi thành công, tạo và lưu đối tượng `Session` mới.

| Parameter | Type     | Mô tả                          |
| :-------- | :------- | :----------------------------------- |
| `apiKey`  | `string` | API key dùng để xác thực. |

#### `logout(): Promise<boolean>`

Đăng xuất người dùng đang xác thực bằng cách vô hiệu hóa session token và refresh token trên máy chủ.

#### `getSession(): Session | undefined`

Lấy đối tượng phiên đang được lưu.

## TextChannel (`TextChannel.ts`)

Tài liệu API này mô tả các thành phần chính của class `TextChannel`, đại diện cho kênh giao tiếp dạng văn bản trong clan.

### **Thuộc tính chính**

| Property         | Type                            | Mô tả                                            |
| :--------------- | :------------------------------ | :----------------------------------------------------- |
| `id`             | `string?`                       | Định danh duy nhất của kênh.                 |
| `name`           | `string?`                       | Tên hiển thị của kênh.                       |
| `is_private`     | `boolean`                       | `true` nếu kênh là private, ngược lại `false`.   |
| `channel_type`   | `number?`                       | Loại kênh (ví dụ: văn bản thường, thread). |
| `category_id`    | `string?`                       | ID danh mục mà kênh thuộc về.        |
| `category_name`  | `string?`                       | Tên danh mục mà kênh thuộc về.      |
| `parent_id`      | `string?`                       | ID kênh cha, nếu đây là thread.     |
| `meeting_code`   | `string?`                       | Mã meeting cho kênh thoại.                   |
| `clan`           | `Clan`                          | Tham chiếu tới instance `Clan` cha.             |
| `messages`       | `CacheManager<string, Message>` | Trình quản lý cache cho tin nhắn trong kênh này.  |

### **Thuộc tính private chính**

| Property         | Type                 | Mô tả                                                 |
| :--------------- | :------------------- | :---------------------------------------------------------- |
| `socketManager`  | `SocketManager`      | Manager xử lý giao tiếp WebSocket.          |
| `messageQueue`   | `AsyncThrottleQueue` | Hàng đợi quản lý tốc độ gửi tin nhắn.            |
| `messageDB`      | `MessageDatabase`    | Giao diện cơ sở dữ liệu để cache và truy xuất tin nhắn. |

### **Phương thức chính**

#### `constructor(initChannelData, clan, socketManager, messageQueue, messageDB)`

Khởi tạo một instance `TextChannel` mới.

| Parameter         | Type                    | Mô tả                                                 |
| :---------------- | :---------------------- | :---------------------------------------------------------- |
| `initChannelData` | `ApiChannelDescription` | Đối tượng chứa dữ liệu kênh ban đầu từ API. |
| `clan`            | `Clan`                  | Đối tượng `Clan` cha mà kênh này thuộc về.      |
| `socketManager`   | `SocketManager`         | Manager xử lý giao tiếp WebSocket.          |
| `messageQueue`    | `AsyncThrottleQueue`    | Hàng đợi quản lý tốc độ gửi tin nhắn.            |
| `messageDB`       | `MessageDatabase`       | Giao diện cơ sở dữ liệu để cache và truy xuất tin nhắn. |

#### `send(content, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?)`

Gửi tin nhắn thường tới kênh. Yêu cầu được thêm vào hàng đợi để tránh vấn đề giới hạn tốc độ.

| Parameter           | Type                          | Mô tả                                                          |
| :------------------ | :---------------------------- | :------------------------------------------------------------------- |
| `content`           | `ChannelMessageContent`       | Nội dung tin nhắn cần gửi.                               |
| `mentions`          | `Array<ApiMessageMention>`    | (Tùy chọn) Mảng mention người dùng trong tin nhắn.      |
| `attachments`       | `Array<ApiMessageAttachment>` | (Tùy chọn) Mảng tệp đính kèm (ví dụ: ảnh, file). |
| `mention_everyone`  | `boolean`                     | (Tùy chọn) Có thông báo cho mọi người trong kênh hay không.                |
| `anonymous_message` | `boolean`                     | (Tùy chọn) Có gửi tin nhắn ẩn danh hay không.                  |
| `topic_id`          | `string`                      | (Tùy chọn) ID chủ đề (thread) mà tin nhắn thuộc về.     |
| `code`              | `number`                      | (Tùy chọn) Mã đặc biệt gắn với loại tin nhắn.          |

#### `sendEphemeral(receiver_id, content, reference_message_id?, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?)`

Gửi tin nhắn ephemeral, chỉ hiển thị với một người dùng cụ thể (`receiver_id`) trong kênh.

| Parameter              | Type                          | Mô tả                                                      |
| :--------------------- | :---------------------------- | :--------------------------------------------------------------- |
| `receiver_id`          | `string`                      | ID người dùng có thể thấy tin nhắn.          |
| `content`              | `any`                         | Nội dung tin nhắn ephemeral.                            |
| `reference_message_id` | `string?`                     | (Tùy chọn) ID tin nhắn cần trả lời.                      |
| `mentions`             | `Array<ApiMessageMention>?`   | (Tùy chọn) Mảng mention người dùng.                            |
| `attachments`          | `Array<ApiMessageAttachment>?`| (Tùy chọn) Mảng tệp đính kèm.                              |
| `mention_everyone`     | `boolean?`                    | (Tùy chọn) Có parse mention everyone hay không.                   |
| `anonymous_message`    | `boolean?`                    | (Tùy chọn) Có gửi tin nhắn ẩn danh hay không.              |
| `topic_id`             | `string?`                     | (Tùy chọn) ID chủ đề (thread) mà tin nhắn thuộc về. |
| `code`                 | `number?`                     | (Tùy chọn) Mã đặc biệt gắn với loại tin nhắn.      |

#### `addQuickMenuAccess(body: ApiQuickMenuAccessPayload): Promise<any>`

Thêm quyền truy cập quick menu cho kênh.

| Parameter | Type                      | Mô tả                           |
| :-------- | :------------------------ | :------------------------------------ |
| `body`    | `ApiQuickMenuAccessPayload` | Payload cấu hình quick menu. |

#### `deleteQuickMenuAccess(botId?: string): Promise<any>`

Gỡ quyền truy cập quick menu cho kênh.

| Parameter | Type      | Mô tả                                       |
| :-------- | :-------- | :------------------------------------------------ |
| `botId`   | `string?` | (Tùy chọn) Bot ID. Mặc định là client ID.     |

#### `playMedia(url: string, participantIdentity: string, participantName: string, name: string): Promise<any>`

Phát media trong kênh thoại.

| Parameter             | Type     | Mô tả                        |
| :-------------------- | :------- | :--------------------------------- |
| `url`                 | `string` | URL của media cần phát.      |
| `participantIdentity` | `string` | Định danh người tham gia.        |
| `participantName`     | `string` | Tên hiển thị của người tham gia.    |
| `name`                | `string` | Tên/tiêu đề của media.       |

## Message (`Message.ts`)

Tài liệu API này mô tả các thành phần chính để đại diện và tương tác với từng tin nhắn trong kênh văn bản.

## MessageInitData Interface

Định nghĩa cấu trúc đối tượng dữ liệu cần thiết để khởi tạo instance `Message`.

| Property              | Type                         | Mô tả                                           |
| :-------------------- | :--------------------------- | :---------------------------------------------------- |
| `id`                  | `string`                     | Định danh duy nhất của tin nhắn.                |
| `clan_id`             | `string`                     | ID clan mà tin nhắn thuộc về.          |
| `channel_id`          | `string`                     | ID kênh mà tin nhắn thuộc về.       |
| `sender_id`           | `string`                     | ID người dùng gửi tin nhắn.             |
| `content`             | `ChannelMessageContent`      | Nội dung chính của tin nhắn.                     |
| `mentions`            | `ApiMessageMention[]?`       | (Tùy chọn) Mảng mention người dùng.                |
| `attachments`         | `ApiMessageAttachment[]?`    | (Tùy chọn) Mảng tệp đính kèm.                  |
| `reactions`           | `ApiMessageReaction[]?`      | (Tùy chọn) Mảng reaction trên tin nhắn.     |
| `references`          | `ApiMessageRef[]?`           | (Tùy chọn) Mảng tin nhắn được tham chiếu.          |
| `topic_id`            | `string?`                    | (Tùy chọn) ID chủ đề mà tin nhắn nằm trong.   |
| `create_time_seconds` | `number?`                    | (Tùy chọn) UNIX timestamp khi tin nhắn được tạo.   |

## Message Class

Đại diện một tin nhắn trong kênh, chứa nội dung và metadata. Cung cấp các phương thức thực hiện hành động trên tin nhắn như trả lời, cập nhật, reaction và xóa.

### **Thuộc tính chính**

| Property              | Type                     | Mô tả                                                      |
| :-------------------- | :----------------------- | :--------------------------------------------------------------- |
| `id`                  | `string`                 | Định danh duy nhất của tin nhắn.                            |
| `sender_id`           | `string`                 | ID người dùng gửi tin nhắn.                         |
| `content`             | `ChannelMessageContent`  | Nội dung chính của tin nhắn.                                 |
| `mentions`            | `ApiMessageMention[]`    | (Tùy chọn) Mảng mention người dùng.                            |
| `attachments`         | `ApiMessageAttachment[]` | (Tùy chọn) Mảng tệp đính kèm.                              |
| `reactions`           | `ApiMessageReaction[]`   | (Tùy chọn) Mảng reaction trên tin nhắn.                 |
| `references`          | `ApiMessageRef[]`        | (Tùy chọn) Mảng tin nhắn mà tin nhắn này tham chiếu.     |
| `topic_id`            | `string`                 | (Tùy chọn) ID chủ đề (thread) mà tin nhắn thuộc về. |
| `create_time_seconds` | `number`                 | (Tùy chọn) UNIX timestamp khi tin nhắn được tạo.         |
| `channel`             | `TextChannel`            | Tham chiếu tới instance `TextChannel` cha.                |

### **Phương thức chính**

#### `constructor(initMessageData, channel, socketManager, messageQueue)`

Khởi tạo một instance `Message` mới.

| Parameter         | Type                 | Mô tả                                                    |
| :---------------- | :------------------- | :------------------------------------------------------------- |
| `initMessageData` | `MessageInitData`    | Đối tượng chứa dữ liệu tin nhắn ban đầu.                 |
| `channel`         | `TextChannel`        | Đối tượng `TextChannel` cha nơi tin nhắn tồn tại.     |
| `socketManager`   | `SocketManager`      | Manager xử lý giao tiếp WebSocket.             |
| `messageQueue`    | `AsyncThrottleQueue` | Hàng đợi quản lý tốc độ các hành động gửi đi trên tin nhắn. |

#### `reply(content, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?)`

Gửi tin nhắn mới trong cùng kênh, cụ thể là trả lời instance tin nhắn này.

| Parameter           | Type                          | Mô tả                                                                             |
| :------------------ | :---------------------------- | :-------------------------------------------------------------------------------------- |
| `content`           | `ChannelMessageContent`       | Nội dung tin nhắn trả lời.                                                       |
| `mentions`          | `Array<ApiMessageMention>`    | (Tùy chọn) Mảng mention người dùng cần thêm.                                        |
| `attachments`       | `Array<ApiMessageAttachment>` | (Tùy chọn) Mảng tệp đính kèm cần thêm.                                          |
| `mention_everyone`  | `boolean`                     | (Tùy chọn) Có thông báo cho mọi người trong kênh hay không.                                   |
| `anonymous_message` | `boolean`                     | (Tùy chọn) Có gửi trả lời ẩn danh hay không.                                       |
| `topic_id`          | `string`                      | (Tùy chọn) ID chủ đề cho trả lời. Mặc định là chủ đề của tin nhắn gốc. |
| `code`              | `number`                      | (Tùy chọn) Mã đặc biệt cho loại tin nhắn.                                         |

#### `update(content, mentions?, attachments?, topic_id?)`

Cập nhật nội dung tin nhắn này.

| Parameter     | Type                          | Mô tả                                   |
| :------------ | :---------------------------- | :-------------------------------------------- |
| `content`     | `ChannelMessageContent`       | Nội dung mới cho tin nhắn.             |
| `mentions`    | `Array<ApiMessageMention>?`   | (Tùy chọn) Mention đã cập nhật.                 |
| `attachments` | `Array<ApiMessageAttachment>?`| (Tùy chọn) Tệp đính kèm đã cập nhật.              |
| `topic_id`    | `string?`                     | (Tùy chọn) Topic ID mới cho tin nhắn. |

#### `react(dataReactMessage: ReactMessagePayload): Promise<any>`

Thêm hoặc gỡ reaction khỏi tin nhắn này.

| Parameter          | Type                  | Mô tả                                                                                          |
| :----------------- | :-------------------- | :--------------------------------------------------------------------------------------------------- |
| `dataReactMessage` | `ReactMessagePayload` | Đối tượng chứa chi tiết reaction, như emoji và thêm hay gỡ. |

#### `delete(): Promise<any>`

Xóa tin nhắn này khỏi kênh.

## User (`User.ts`)

Tài liệu API này mô tả các thành phần chính để đại diện người dùng và tương tác với họ.

## UserInitData Interface

Định nghĩa cấu trúc đối tượng dữ liệu cần thiết để khởi tạo instance `User`.

| Property       | Type      | Mô tả                                            |
| :------------- | :-------- | :----------------------------------------------------- |
| `id`           | `string`  | Định danh duy nhất của người dùng.                    |
| `username`     | `string?` | (Tùy chọn) Username toàn cục của người dùng.                |
| `clan_nick`    | `string?` | (Tùy chọn) Biệt danh của người dùng trong ngữ cảnh clan.   |
| `clan_avatar`  | `string?` | (Tùy chọn) URL avatar của người dùng trong ngữ cảnh clan. |
| `display_name` | `string?` | (Tùy chọn) Tên hiển thị công khai của người dùng.            |
| `avartar`      | `string?` | (Tùy chọn) URL avatar toàn cục của người dùng.              |
| `dmChannelId`  | `string?` | (Tùy chọn) ID kênh DM với người dùng này.   |

## User Class

Đại diện người dùng trong hệ thống, lưu thông tin hồ sơ và cung cấp phương thức tương tác trực tiếp như gửi tin nhắn trực tiếp hoặc chuyển token.

### **Thuộc tính chính**

| Property       | Type     | Mô tả                                          |
| :------------- | :------- | :--------------------------------------------------- |
| `id`           | `string` | Định danh duy nhất của người dùng.                  |
| `username`     | `string` | Username toàn cục của người dùng.                          |
| `clan_nick`    | `string` | Biệt danh của người dùng trong ngữ cảnh clan.    |
| `clan_avatar`  | `string` | URL avatar của người dùng trong ngữ cảnh clan.  |
| `display_name` | `string` | Tên hiển thị công khai của người dùng.                      |
| `avartar`      | `string` | URL avatar toàn cục của người dùng.                        |
| `dmChannelId`  | `string` | ID kênh tin nhắn trực tiếp với người dùng này. |

### **Thuộc tính private chính**

| Property         | Type                 | Mô tả                                                       |
| :--------------- | :------------------- | :---------------------------------------------------------------- |
| `clan`           | `Clan`               | Ngữ cảnh clan mà instance người dùng này thuộc về.                  |
| `channelManager` | `ChannelManager?`    | (Tùy chọn) Manager thao tác kênh, dùng để tạo DM.|
| `messageQueue`   | `AsyncThrottleQueue` | Hàng đợi giới hạn tốc độ cho các yêu cầu gửi đi.               |
| `socketManager`  | `SocketManager`      | Manager xử lý giao tiếp WebSocket.               |

---

### **Phương thức chính**

#### `constructor(initUserData, clan, messageQueue, socketManager, channelManager?)`

Khởi tạo một instance `User` mới.

| Parameter        | Type                 | Mô tả                                                                        |
| :--------------- | :------------------- | :--------------------------------------------------------------------------------- |
| `initUserData`   | `UserInitData`       | Đối tượng chứa dữ liệu người dùng ban đầu.                                        |
| `clan`           | `Clan`               | Đối tượng `Clan` mà instance người dùng này gắn với.                           |
| `messageQueue`   | `AsyncThrottleQueue` | Hàng đợi quản lý tốc độ gửi tin nhắn.                                   |
| `socketManager`  | `SocketManager`      | Manager xử lý giao tiếp WebSocket.                                 |
| `channelManager` | `ChannelManager`     | (Tùy chọn) Manager xử lý thao tác kênh, bắt buộc khi tạo DM. |

#### `sendToken(sendTokenData: SendTokenData): Promise<any>`

Gửi một lượng token chỉ định tới người dùng này.

| Parameter       | Type            | Mô tả                                                                   |
| :-------------- | :-------------- | :---------------------------------------------------------------------------- |
| `sendTokenData` | `SendTokenData` | Đối tượng chứa `amount` và `note` tùy chọn cho giao dịch. |

#### `sendDM(content: ChannelMessageContent, code?: number): Promise<any>`

Gửi tin nhắn trực tiếp tới người dùng này. Nếu chưa có kênh DM, sẽ cố tạo kênh trước.

| Parameter | Type                    | Mô tả                                                 |
| :-------- | :---------------------- | :---------------------------------------------------------- |
| `content` | `ChannelMessageContent` | Nội dung tin nhắn cần gửi.                      |
| `code`    | `number?`               | (Tùy chọn) Mã đặc biệt gắn với loại tin nhắn. |

#### `createDmChannel(): Promise<ApiChannelDescription | null>`

Tạo rõ ràng kênh tin nhắn trực tiếp mới với người dùng này.

#### `listTransactionDetail(transactionId: string): Promise<any>`

Lấy chi tiết của một giao dịch cụ thể liên quan đến người dùng.

| Parameter       | Type     | Mô tả                                           |
| :-------------- | :------- | :---------------------------------------------------- |
| `transactionId` | `string` | Định danh duy nhất của giao dịch cần lấy. |

## Clan (`Clan.ts`)

Tài liệu API này mô tả các thành phần chính để đại diện "Clan" (hoặc server/guild) và quản lý tài nguyên như kênh, người dùng và vai trò.

## ClanInitData Interface

Định nghĩa cấu trúc đối tượng dữ liệu cần thiết để khởi tạo instance `Clan`.

| Property             | Type     | Mô tả                               |
| :------------------- | :------- | :---------------------------------------- |
| `id`                 | `string` | Định danh duy nhất của clan.       |
| `name`               | `string` | Tên hiển thị của clan.             |
| `welcome_channel_id` | `string` | ID kênh chào mừng mặc định.    |

## Clan Class

Đại diện clan, container cấp cao nhất cho kênh và người dùng của cộng đồng. Cung cấp phương thức lấy và quản lý các tài nguyên này.

### **Thuộc tính chính**

| Property             | Type                                | Mô tả                                                          |
| :------------------- | :---------------------------------- | :------------------------------------------------------------------- |
| `id`                 | `string`                            | Định danh duy nhất của clan.                                  |
| `name`               | `string`                            | Tên hiển thị của clan.                                        |
| `welcome_channel_id` | `string`                            | ID kênh chào mừng mặc định.                               |
| `channels`           | `CacheManager<string, TextChannel>` | Trình quản lý cache cho các kênh thuộc clan này.             |
| `users`              | `CacheManager<string, User>`        | Trình quản lý cache cho thành viên clan.          |
| `sessionToken`       | `string`                            | Session token dùng cho các yêu cầu API trong ngữ cảnh clan này. |
| `apiClient`          | `MezonApi`                          | Instance API client dùng để gửi yêu cầu.                    |

### **Thuộc tính private chính**

| Property            | Type                 | Mô tả                                                |
| :------------------ | :------------------- | :--------------------------------------------------------- |
| `_channelsLoaded`   | `boolean`            | **Private.** Trạng thái cache kênh đã tải.            |
| `_loadingPromise`   | `Promise<void>?`     | **Private.** Promise cho quá trình tải kênh đang chạy. |
| `client`            | `MezonClient`        | **Private.** Tham chiếu tới instance client chính.       |
| `socketManager`     | `SocketManager`      | **Private.** Trình quản lý WebSocket.                       |
| `messageQueue`      | `AsyncThrottleQueue` | **Private.** Hàng đợi tin nhắn giới hạn tốc độ.                  |
| `messageDB`         | `MessageDatabase`    | **Private.** Giao diện cơ sở dữ liệu tin nhắn cục bộ.            |

### **Phương thức chính**

#### `constructor(initClanData, client, apiClient, socketManager, sessionToken, messageQueue, messageDB)`

Khởi tạo một instance `Clan` mới.

| Parameter       | Type                 | Mô tả                                                 |
| :-------------- | :------------------- | :---------------------------------------------------------- |
| `initClanData`  | `ClanInitData`       | Đối tượng chứa dữ liệu clan ban đầu.                 |
| `client`        | `MezonClient`        | Instance `MezonClient` chính.                            |
| `apiClient`     | `MezonApi`           | Instance API client để gửi yêu cầu máy chủ.   |
| `socketManager` | `SocketManager`      | Manager xử lý giao tiếp WebSocket.          |
| `sessionToken`  | `string`             | Session token dùng để xác thực lời gọi API.        |
| `messageQueue`  | `AsyncThrottleQueue` | Hàng đợi quản lý tốc độ gửi tin nhắn.            |
| `messageDB`     | `MessageDatabase`    | Giao diện cơ sở dữ liệu để cache và truy xuất tin nhắn. |

#### `getClientId(): string | undefined`

Trả về client ID (user ID của bot) từ instance client chính.

#### `loadChannels(): Promise<void>`

Lấy và cache tất cả kênh văn bản thuộc clan từ máy chủ. Phương thức này chỉ chạy một lần để tránh lời gọi API trùng lặp.

#### `listChannelVoiceUsers(channel_id?, channel_type?, limit?, state?, cursor?): Promise<ApiVoiceChannelUserList>`

Lấy danh sách người dùng hiện có trong một kênh thoại cụ thể trong clan.

| Parameter      | Type      | Mặc định                                | Mô tả                                                        |
| :------------- | :-------- | :------------------------------------- | :----------------------------------------------------------------- |
| `channel_id`   | `string?` | `""`                                   | (Tùy chọn) ID kênh thoại.                           |
| `channel_type` | `number?` | `ChannelType.CHANNEL_TYPE_GMEET_VOICE` | (Tùy chọn) Loại kênh thoại.                             |
| `limit`        | `number?` | `500`                                  | (Tùy chọn) Số người dùng tối đa trả về (từ 1 đến 500).      |
| `state`        | `number?` | `undefined`                            | (Tùy chọn) Bộ lọc trạng thái cho danh sách người dùng.                      |
| `cursor`       | `string?` | `undefined`                            | (Tùy chọn) Con trỏ phân trang kết quả.             |

#### `updateRole(roleId: string, request: MezonUpdateRoleBody): Promise<boolean>`

Cập nhật thuộc tính của một vai trò cụ thể trong clan.

| Parameter | Type                  | Mô tả                                           |
| :-------- | :-------------------- | :---------------------------------------------------- |
| `roleId`  | `string`              | Định danh duy nhất của vai trò cần cập nhật.          |
| `request` | `MezonUpdateRoleBody` | Đối tượng chứa thuộc tính mới cho vai trò. |

#### `listRoles(limit?: string, state?: string, cursor?: string): Promise<ApiRoleListEventResponse>`

Lấy danh sách tất cả vai trò trong clan.

| Parameter | Type     | Mô tả                                           |
| :-------- | :------- | :---------------------------------------------------- |
| `limit`   | `string` | (Tùy chọn) Số vai trò tối đa trả về.     |
| `state`   | `string` | (Tùy chọn) Bộ lọc trạng thái cho danh sách vai trò.          |
| `cursor`  | `string` | (Tùy chọn) Con trỏ phân trang kết quả. |

## Common Interfaces and Types

### ChannelMessageContent

Định nghĩa cấu trúc nội dung tin nhắn.

| Property     | Type                     | Mô tả                                         |
| :----------- | :----------------------- | :-------------------------------------------------- |
| `t`          | `string?`                | (Tùy chọn) Nội dung văn bản chính của tin nhắn.   |
| `hg`         | `HashtagOnMessage[]?`    | (Tùy chọn) Mảng tham chiếu hashtag.            |
| `ej`         | `EmojiOnMessage[]?`      | (Tùy chọn) Mảng tham chiếu emoji.              |
| `lk`         | `LinkOnMessage[]?`       | (Tùy chọn) Mảng tham chiếu liên kết.               |
| `mk`         | `MarkdownOnMessage[]?`   | (Tùy chọn) Mảng định dạng markdown.           |
| `vk`         | `LinkVoiceRoomOnMessage[]?` | (Tùy chọn) Mảng liên kết phòng thoại.           |
| `embed`      | `IInteractiveMessageProps[]?` | (Tùy chọn) Mảng nội dung embed.         |
| `components` | `IMessageActionRow[]?`   | (Tùy chọn) Mảng thành phần tương tác.        |

### SendTokenData

Định nghĩa cấu trúc dữ liệu chuyển token.

| Property          | Type      | Mô tả                                    |
| :---------------- | :-------- | :--------------------------------------------- |
| `amount`          | `number`  | Số lượng token cần gửi.                  |
| `note`            | `string?` | (Tùy chọn) Ghi chú hoặc mô tả cho giao dịch. |
| `extra_attribute` | `string?` | (Tùy chọn) Metadata bổ sung cho giao dịch.   |

### TokenSentEvent

Đại diện sự kiện chuyển token.

| Property          | Type      | Mô tả                                        |
| :---------------- | :-------- | :------------------------------------------------- |
| `sender_id`       | `string?` | (Tùy chọn) ID người dùng gửi token.     |
| `sender_name`     | `string?` | (Tùy chọn) Tên người dùng gửi token.   |
| `receiver_id`     | `string`  | ID người dùng nhận token.              |
| `amount`          | `number`  | Số lượng token được chuyển.           |
| `note`            | `string?` | (Tùy chọn) Ghi chú kèm theo giao dịch.       |
| `extra_attribute` | `string?` | (Tùy chọn) Metadata bổ sung.                   |
| `transaction_id`  | `string?` | (Tùy chọn) Định danh giao dịch duy nhất.     |

### ReactMessagePayload

Định nghĩa cấu trúc reaction tin nhắn.

| Property       | Type       | Mô tả                                               |
| :------------- | :--------- | :-------------------------------------------------------- |
| `id`           | `string?`  | (Tùy chọn) Định danh duy nhất của reaction.        |
| `emoji_id`     | `string`   | Định danh emoji.                             |
| `emoji`        | `string`   | Ký tự hoặc chuỗi emoji.                           |
| `count`        | `number`   | Số lượng reaction này (do máy chủ quản lý).          |
| `action_delete`| `boolean?` | (Tùy chọn) `true` để gỡ, `false` để thêm (mặc định).   |

### ApiChannelDescription

Đại diện metadata và thuộc tính kênh.

| Property               | Type       | Mô tả                                           |
| :--------------------- | :--------- | :---------------------------------------------------- |
| `channel_id`           | `string?`  | (Tùy chọn) Định danh duy nhất của kênh.     |
| `channel_label`        | `string?`  | (Tùy chọn) Tên hiển thị của kênh.          |
| `clan_id`              | `string?`  | (Tùy chọn) ID clan mà kênh thuộc về.|
| `type`                 | `number?`  | (Tùy chọn) Loại kênh.                      |
| `channel_private`      | `number?`  | (Tùy chọn) Kênh private (1) hay không (0).|
| `category_id`          | `string?`  | (Tùy chọn) ID danh mục.                   |
| `category_name`        | `string?`  | (Tùy chọn) Tên danh mục.                 |
| `parent_id`            | `string?`  | (Tùy chọn) ID kênh cha.             |
| `meeting_code`         | `string?`  | (Tùy chọn) Mã meeting cho kênh thoại.      |
| `creator_id`           | `string?`  | (Tùy chọn) ID người tạo kênh.            |
| `create_time_seconds`  | `number?`  | (Tùy chọn) Timestamp tạo.                   |
| `update_time_seconds`  | `number?`  | (Tùy chọn) Timestamp cập nhật cuối.                |

## Constants and Enums

### ChannelType

Định nghĩa các loại kênh trong Mezon.

| Constant                    | Value | Mô tả                        |
| :-------------------------- | :---- | :--------------------------------- |
| `CHANNEL_TYPE_CHANNEL`      | `1`   | Kênh văn bản thường              |
| `CHANNEL_TYPE_GROUP`        | `2`   | Kênh nhóm                      |
| `CHANNEL_TYPE_DM`           | `3`   | Kênh tin nhắn trực tiếp             |
| `CHANNEL_TYPE_GMEET_VOICE`  | `4`   | Kênh thoại Google Meet          |
| `CHANNEL_TYPE_FORUM`        | `5`   | Kênh forum                      |
| `CHANNEL_TYPE_STREAMING`    | `6`   | Kênh streaming                  |
| `CHANNEL_TYPE_THREAD`       | `7`   | Kênh thread                     |
| `CHANNEL_TYPE_APP`          | `8`   | Kênh ứng dụng                |
| `CHANNEL_TYPE_ANNOUNCEMENT` | `9`   | Kênh thông báo               |
| `CHANNEL_TYPE_MEZON_VOICE`  | `10`  | Kênh thoại native Mezon        |

### ChannelStreamMode

Định nghĩa chế độ streaming cho các loại kênh khác nhau.

| Constant              | Value | Mô tả                    |
| :-------------------- | :---- | :----------------------------- |
| `STREAM_MODE_CHANNEL` | `2`   | Chế độ stream kênh            |
| `STREAM_MODE_GROUP`   | `3`   | Chế độ stream nhóm              |
| `STREAM_MODE_DM`      | `4`   | Chế độ stream tin nhắn trực tiếp     |
| `STREAM_MODE_CLAN`    | `5`   | Chế độ stream clan               |
| `STREAM_MODE_THREAD`  | `6`   | Chế độ stream thread             |

### TypeMessage

Định nghĩa các loại tin nhắn và mục đích của chúng.

| Constant        | Value | Mô tả                      |
| :-------------- | :---- | :------------------------------- |
| `Chat`          | `0`   | Tin nhắn chat thường            |
| `ChatUpdate`    | `1`   | Tin nhắn chat đã cập nhật             |
| `ChatRemove`    | `2`   | Tin nhắn chat đã xóa             |
| `Typing`        | `3`   | Chỉ báo đang gõ                 |
| `Indicator`     | `4`   | Chỉ báo trạng thái                 |
| `Welcome`       | `5`   | Tin nhắn chào mừng                  |
| `CreateThread`  | `6`   | Tin nhắn tạo thread          |
| `CreatePin`     | `7`   | Tin nhắn tạo ghim             |
| `MessageBuzz`   | `8`   | Tin nhắn buzz/thông báo        |
| `Topic`         | `9`   | Tin nhắn chủ đề                    |
| `AuditLog`      | `10`  | Tin nhắn audit log                |
| `SendToken`     | `11`  | Tin nhắn chuyển token           |
| `Ephemeral`     | `12`  | Tin nhắn ephemeral (tạm thời)    |

### Events

Tất cả loại sự kiện cho trình lắng nghe sự kiện MezonClient.

| Event Name             | Mô tả                                    |
| :--------------------- | :--------------------------------------------- |
| `ChannelMessage`       | Tin nhắn mới nhận trong kênh             |
| `MessageReaction`      | Reaction được thêm/gỡ khỏi tin nhắn         |
| `UserChannelRemoved`   | Người dùng bị gỡ khỏi kênh                   |
| `UserClanRemoved`      | Người dùng bị gỡ khỏi clan                      |
| `UserChannelAdded`     | Người dùng được thêm vào kênh                       |
| `ChannelCreated`       | Kênh mới được tạo                           |
| `ChannelDeleted`       | Kênh bị xóa                               |
| `ChannelUpdated`       | Thông tin kênh được cập nhật                   |
| `RoleEvent`            | Vai trò được tạo hoặc cập nhật                       |
| `GiveCoffee`           | Coffee được tặng giữa người dùng                    |
| `RoleAssign`           | Vai trò được gán cho người dùng                         |
| `AddClanUser`          | Người dùng được thêm vào clan                            |
| `TokenSend`            | Chuyển token giữa người dùng                  |
| `ClanEventCreated`     | Sự kiện clan được tạo                            |
| `MessageButtonClicked` | Nút tương tác được nhấn                    |
| `StreamingJoinedEvent` | Người dùng tham gia phiên streaming                 |
| `StreamingLeavedEvent` | Người dùng rời phiên streaming                   |
| `DropdownBoxSelected`  | Tùy chọn dropdown được chọn                      |
| `WebrtcSignalingFwd`   | Báo hiệu WebRTC cho cuộc gọi thoại/video       |
| `VoiceStartedEvent`    | Phiên thoại bắt đầu                         |
| `VoiceEndedEvent`      | Phiên thoại kết thúc                           |
| `VoiceJoinedEvent`     | Người dùng tham gia kênh thoại                     |
| `VoiceLeavedEvent`     | Người dùng rời kênh thoại                       |
| `Notifications`        | Thông báo chung được nhận                |
| `QuickMenu`            | Tương tác quick menu                        |

## Ghi chú sử dụng

- **Giới hạn tốc độ**: Mọi thao tác gửi tin nhắn dùng `AsyncThrottleQueue` để tránh giới hạn tốc độ.
- **Cache**: SDK dùng `CacheManager` rộng rãi để truy cập dữ liệu hiệu quả và giảm lời gọi API.
- **Xác thực**: Phân giải endpoint động đảm bảo định tuyến máy chủ tối ưu sau khi xác thực.
- **Xử lý sự kiện**: Mọi sự kiện được xử lý và cache tự động phù hợp.
- **Xử lý lỗi**: Hầu hết phương thức trả về promise cần được xử lý đúng bằng khối try-catch.
- **TypeScript**: SDK được gõ kiểu đầy đủ bằng TypeScript để trải nghiệm phát triển tốt hơn.
