---
sidebar_position: 3
---

# Khái niệm cốt lõi

Hiểu các khái niệm cốt lõi này sẽ giúp bạn sử dụng `mezon-sdk` hiệu quả.

## MezonClient

**`MezonClient` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/client/MezonClient.ts)]** là giao diện chính để tương tác với nền tảng Mezon. Nó kế thừa `EventEmitter` của Node.js để cung cấp khả năng xử lý sự kiện thời gian thực. Client đóng gói mọi chức năng cần thiết, bao gồm:

- **Quản lý kết nối** qua `SocketManager` cho giao tiếp WebSocket
- **Xử lý xác thực** qua `SessionManager` để quản lý phiên và xác thực token
- **Gọi API** qua một instance `MezonApi` nội bộ cho các thao tác REST API
- **Xử lý sự kiện thời gian thực** qua `EventManager` và `SocketManager` để cập nhật trực tiếp
- **Truy cập cấu trúc dữ liệu** bao gồm kênh, tin nhắn, người dùng và clan thông qua các manager có cache
- **Cache dữ liệu cục bộ** dùng `CacheManager` để tối ưu hiệu năng
- **Lưu trữ tin nhắn** qua `MessageDatabase` dùng SQLite cho khả năng ngoại tuyến
- **Giới hạn tốc độ** qua `AsyncThrottleQueue` để quản lý các yêu cầu gửi đi
- **Hỗ trợ nhắn tin trực tiếp** với quản lý kênh DM chuyên dụng

### Thuộc tính và phương thức chính

- **`login()`**: Xác thực client và thiết lập kết nối
- **`createDMchannel(userId)`**: Tạo kênh tin nhắn trực tiếp với người dùng
- **Trình lắng nghe sự kiện**: Bộ phương thức `on*` đầy đủ cho các sự kiện thời gian thực như tin nhắn, cập nhật kênh, hành động người dùng và nhiều hơn nữa
- **Quản lý bạn bè**: Các phương thức để thêm, chấp nhận và liệt kê bạn bè
- **`closeSocket()`**: Đóng kết nối WebSocket đúng cách và đặt lại các manager

## Xác thực (Sessions) {#authentication-sessions}

- **`SessionManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/manager/session_manager.ts)]**: Xử lý toàn bộ vòng đời xác thực:
  - **Xác thực dựa trên token** dùng API key để lấy session token (JWT)
  - **Quản lý phiên** bao gồm lưu trữ và truy xuất các phiên đang hoạt động
  - **Tích hợp API** phối hợp với `MezonApi` cho các yêu cầu xác thực
  - **Tự động xử lý phiên** cho mọi lời gọi API được ủy quyền và giao tiếp WebSocket

- **`Session` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/session.ts)]**: Đại diện cho một phiên người dùng đã xác thực, chứa:
  - **Thông tin xác thực người dùng** bao gồm token và định danh người dùng (`user_id`)
  - **Endpoint máy chủ** phân giải URL API động từ phản hồi xác thực
  - **Quản lý token** với logic hết hạn và làm mới
  - **Tham số kết nối** dùng để thiết lập kết nối WebSocket

### Luồng xác thực

Quá trình `MezonClient.login()` bao gồm:
1. **Xác thực ban đầu** với API client tạm thời dùng bot ID và token
2. **Phân giải endpoint động** lấy `api_url` từ phản hồi phiên để định tuyến tối ưu
3. **Khởi tạo manager** thiết lập mọi thành phần SDK (API client, session, socket, channel, event manager)
4. **Khởi tạo MMN/ZK** thiết lập hệ thống bằng chứng zero-knowledge cho việc chuyển token an toàn:
   - Tạo cặp khóa tạm thời (ephemeral) để ký giao dịch
   - Lấy địa chỉ ví cho bot
   - Lấy các bằng chứng zero-knowledge cho giao dịch bảo vệ quyền riêng tư
5. **Kết nối WebSocket** thiết lập kênh giao tiếp thời gian thực
6. **Khởi tạo kênh DM** tải các kênh tin nhắn trực tiếp hiện có
7. **Phát trạng thái ready** báo hiệu xác thực và thiết lập hoàn tất thành công

SDK tự động xử lý:
- Định tuyến và cân bằng tải phía máy chủ thông qua phân giải endpoint động
- Hạ tầng chuyển token an toàn với bằng chứng zero-knowledge
- Tự động quản lý nonce cho giao dịch
- Đường kết nối tối ưu cho giao tiếp thời gian thực

## Giao tiếp thời gian thực (Sockets)

- **`SocketManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/manager/socket_manager.ts)]**: Thiết lập và duy trì kết nối WebSocket tới máy chủ Mezon cho các sự kiện và tin nhắn thời gian thực. Nó xử lý kết nối, ngắt kết nối, logic kết nối lại, và tuần tự hóa/giải tuần tự hóa tin nhắn bằng Protocol Buffers qua `WebSocketAdapterPb`. Manager này tích hợp với hệ thống hàng đợi tin nhắn và cơ sở dữ liệu để xử lý tin nhắn đáng tin cậy.

- **`DefaultSocket` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/socket.ts)]**: Một triển khai socket ở mức thấp hơn được các manager sử dụng.

- **Sự kiện thời gian thực**: SDK cung cấp hỗ trợ sự kiện thời gian thực phong phú thông qua các phương thức lắng nghe sự kiện của `MezonClient`:
  - **Sự kiện tin nhắn**: `onChannelMessage()`, `onMessageReaction()`, `onMessageButtonClicked()`
  - **Sự kiện kênh**: `onChannelCreated()`, `onChannelUpdated()`, `onChannelDeleted()`
  - **Sự kiện người dùng**: `onUserChannelAdded()`, `onUserChannelRemoved()`, `onAddClanUser()`, `onUserClanRemoved()`
  - **Sự kiện xã hội**: `onGiveCoffee()`, `onTokenSend()`, `onNotification()`
  - **Sự kiện thoại**: `onVoiceStartedEvent()`, `onVoiceEndedEvent()`, `onVoiceJoinedEvent()`, `onVoiceLeavedEvent()`
  - **Sự kiện streaming**: `onStreamingJoinedEvent()`, `onStreamingLeavedEvent()`
  - **Sự kiện vai trò**: `onRoleEvent()`, `onRoleAssign()`
  - **Sự kiện tương tác**: `onDropdownBoxSelected()`, `onQuickMenuEvent()`, `onWebrtcSignalingFwd()`
  
  Các sự kiện này được định nghĩa trong `src/constants/enum.ts` và cho phép phát triển ứng dụng thời gian thực toàn diện.

## Kênh (Channels)

- **`ChannelManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/manager/channel_manager.ts)]**: Quản lý các thao tác liên quan đến kênh với hỗ trợ chuyên biệt cho kênh Tin nhắn trực tiếp (DM). Các chức năng chính bao gồm:
  - Tạo và lấy các kênh DM
  - Khởi tạo tất cả kênh DM trong quá trình thiết lập client qua `initAllDmChannels()`
  - Quản lý trạng thái và metadata của kênh
  - Phối hợp với `SocketManager` và `SessionManager` để cập nhật thời gian thực

- **`TextChannel` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/structures/TextChannel.ts)]**: Đại diện cho một kênh giao tiếp dạng văn bản (ví dụ: kênh clan, kênh DM hoặc luồng thảo luận). Nó cung cấp các phương thức để:
  - Gửi tin nhắn và quản lý lịch sử tin nhắn
  - Tương tác với thuộc tính và metadata của kênh
  - Tích hợp với việc lưu trữ tin nhắn qua `MessageDatabase`
  - Xử lý tin nhắn thời gian thực qua hệ thống hàng đợi tin nhắn
  
  Kênh hỗ trợ nhiều loại bao gồm văn bản, thoại và luồng thảo luận như định nghĩa trong enum `ChannelType` từ `src/constants/enum.ts`. `MezonClient` duy trì các kênh thông qua `CacheManager` để truy cập hiệu quả và tự động tải khi cần.

## Tin nhắn (Messages)

- **`Message` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/structures/Message.ts)]**: Đại diện cho một tin nhắn đơn lẻ trong kênh với metadata đầy đủ bao gồm:
  - Nội dung tin nhắn, thông tin người gửi và dấu thời gian
  - Tệp đính kèm, cảm xúc, nhắc đến (mention) và tham chiếu tin nhắn
  - Tích hợp với `TextChannel` cha và nhắn tin có giới hạn tốc độ qua `AsyncThrottleQueue`
  - Các phương thức thao tác tin nhắn (trả lời, cập nhật, xóa, thả cảm xúc)

- **Khởi tạo tin nhắn**: Tin nhắn được tạo qua interface `MessageInitData` chứa mọi thuộc tính cần thiết như `id`, `clan_id`, `channel_id`, `sender_id`, `content`, `reactions`, `mentions`, `attachments`, `references` và `create_time_seconds`.

- **Định dạng tin nhắn**: Các tiện ích như `format_message_input.ts` và `generate_reply_message.ts` đảm bảo cấu trúc tin nhắn nhất quán giữa các loại tin nhắn khác nhau, bao gồm xử lý đặc biệt cho việc chuyển token.

- **Lưu trữ tin nhắn**: `MessageDatabase.ts` dùng SQLite để lưu tin nhắn cục bộ thông qua phương thức `saveMessage()`, cho phép các tính năng như:
  - Xem tin nhắn ngoại tuyến
  - Tải lịch sử tin nhắn nhanh hơn
  - Cache tin nhắn cục bộ để cải thiện hiệu năng
  - Đồng bộ tin nhắn giữa các phiên

- **Xử lý tin nhắn thời gian thực**: `MezonClient` tự động xử lý tin nhắn đến qua `_initChannelMessageCache()`, tạo các instance `Message` và cập nhật cả cache trong bộ nhớ lẫn lưu trữ bền vững.

## Sự kiện (Events)

- **`EventManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/manager/event_manager.ts)]**: Một hệ thống để phát và lắng nghe các sự kiện tùy chỉnh phía client cũng như sự kiện do máy chủ đẩy xuống. Điều này cho phép các phần khác nhau trong ứng dụng (hoặc bot) của bạn phản ứng với những gì xảy ra trên nền tảng Mezon hoặc trong chính SDK.

- **Sự kiện Socket (`src/message-socket-events/`)**: Các trình xử lý cụ thể cho sự kiện socket như `user_channel_added` hoặc `user_channel_updated`.

## Clan & Người dùng

- **`Clan` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/structures/Clan.ts)]**: Đại diện cho một clan (máy chủ/cộng đồng) trên nền tảng Mezon, chứa:
  - Nhiều kênh có thể truy cập qua tập hợp kênh của clan
  - Các thành viên với quyền dựa trên vai trò
  - Metadata riêng của clan (ID, tên, kênh chào mừng)
  - Tích hợp với `MezonApi`, `SocketManager` và `MessageDatabase`
  - Tải kênh động qua phương thức `loadChannels()`
  - Một clan đặc biệt với ID "0" đại diện cho không gian DM để nhắn tin trực tiếp

- **`User` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/structures/User.ts)]**: Đại diện cho một người dùng trên nền tảng Mezon với thông tin hồ sơ đầy đủ:
  - **Định danh cơ bản**: ID, username, tên hiển thị và ảnh đại diện
  - **Dữ liệu riêng theo clan**: biệt danh trong clan (`clan_nick`) và ảnh đại diện trong clan (`clan_avatar`) cho từng ngữ cảnh clan
  - **Tích hợp DM**: ID kênh DM liên kết để hỗ trợ nhắn tin trực tiếp
  - **Hành động người dùng**: Các phương thức cho thao tác riêng của người dùng như gửi tin nhắn trực tiếp
  
  Người dùng được quản lý qua interface `UserInitData` và được các clan tự động cache. `MezonClient` duy trì dữ liệu người dùng xuyên suốt cả ngữ cảnh clan lẫn không gian DM toàn cục (clan "0"), cho phép tương tác người dùng nhất quán bất kể ngữ cảnh.

- **Quản lý người dùng**: Client tự động xử lý cache người dùng qua `_initUserClanCache()`, thực hiện:
  - Tạo các instance người dùng cho cả ngữ cảnh clan và DM
  - Duy trì tính nhất quán của dữ liệu người dùng qua các clan khác nhau
  - Xử lý việc tải người dùng động từ dữ liệu kênh DM
  - Cập nhật thông tin người dùng từ các sự kiện tin nhắn thời gian thực

## Cache và quản lý dữ liệu

- **`CacheManager` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/utils/CacheManager.ts)]**: Cung cấp một lớp cache tinh vi cho dữ liệu được truy cập thường xuyên với khả năng tự động tải:
  - **Cache tổng quát** cho mọi loại dữ liệu (clan, kênh, người dùng)
  - **Tự động tải** qua các hàm fetch được cung cấp ở constructor (ví dụ `_fetchClanFromAPI`, `_fetchChannelFromAPI`)
  - **Tối ưu bộ nhớ** giảm các lời gọi API lặp lại và cải thiện hiệu năng
  - **Tích hợp với MezonClient** qua các cache manager `this.clans` và `this.channels`
  - **Tải lười (lazy loading)** - dữ liệu chỉ được tải khi truy cập qua `fetch()` hoặc `get()`

- **`AsyncThrottleQueue` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/utils/AsyncThrottleQueue.ts)]**: Thành phần quan trọng để quản lý các yêu cầu gửi đi và duy trì giới hạn tốc độ:
  - **Giới hạn tốc độ** tránh các giới hạn từ máy chủ và đảm bảo hoạt động mượt mà
  - **Xếp hàng yêu cầu** quản lý nhắn tin và gọi API với khối lượng lớn
  - **Được dùng rộng rãi** bởi MezonClient cho gửi tin nhắn, gọi API và thao tác socket
  - **Xử lý nền** quản lý các tác vụ trong hàng đợi mà không chặn luồng chính của ứng dụng

- **`Collection` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/mezon-client/utils/Collection.ts)]**: Một tiện ích `Map` nâng cao cung cấp khả năng quản lý cấu trúc dữ liệu tiên tiến:
  - **Mở rộng chức năng của Map** với các phương thức tiện lợi để lọc, ánh xạ và tìm phần tử
  - **Được dùng xuyên suốt SDK** để quản lý các tập hợp người dùng, kênh, tin nhắn và thực thể khác
  - **Tối ưu hiệu năng** cho các thao tác đọc/ghi thường xuyên trên tập dữ liệu lớn
  - **An toàn kiểu** duy trì tính tương thích với TypeScript

- **`MessageDatabase` [[src](https://github.com/mezonai/mezon-js/blob/master/packages/mezon-sdk/src/sqlite/MessageDatabase.ts)]**: Hệ thống lưu trữ bền vững dựa trên SQLite:
  - **Lưu trữ tin nhắn cục bộ** cho truy cập ngoại tuyến và tải nhanh hơn
  - **Tự động đồng bộ** với các sự kiện thời gian thực qua phương thức `saveMessage()`
  - **Cache tích hợp** hoạt động cùng cache trong bộ nhớ để đạt hiệu năng tối ưu
  - **Bền vững qua các phiên** duy trì lịch sử tin nhắn giữa các lần khởi động lại ứng dụng

## Tính năng xã hội

Mezon SDK cung cấp các khả năng tương tác xã hội toàn diện:

### Hệ thống bạn bè
- **`getListFriends()`**: Lấy danh sách bạn bè với hỗ trợ phân trang (tham số `limit`, `state`, `cursor`)
- **`addFriend(username)`**: Gửi lời mời kết bạn tới người dùng theo username
- **`acceptFriend(userId, username)`**: Chấp nhận lời mời kết bạn đến
- **Tự động xử lý lời mời kết bạn**: Client tự động xử lý lời mời kết bạn qua các sự kiện thông báo

### Hệ thống chuyển token

Mezon SDK cung cấp hỗ trợ toàn diện cho việc chuyển token an toàn bằng **Mezon Money Network (MMN)** với bằng chứng zero-knowledge để tăng cường quyền riêng tư:

- **`sendToken(tokenEvent)`**: Gửi tiền ảo/token giữa người dùng với xử lý ZK proof tự động
- **`getEphemeralKeyPair()`**: Tạo cặp khóa tạm thời để ký giao dịch an toàn
- **`getAddress(userId)`**: Lấy địa chỉ ví của người dùng
- **`getZkProofs(data)`**: Lấy bằng chứng zero-knowledge cho giao dịch bảo vệ quyền riêng tư
- **`getCurrentNonce(userId)`**: Lấy nonce giao dịch hiện tại để sắp xếp đúng thứ tự
- **`onTokenSend()`**: Lắng nghe sự kiện chuyển token với thông báo DM tự động

**Tính năng chính:**
- **Bảo vệ quyền riêng tư**: Dùng bằng chứng zero-knowledge để bảo vệ chi tiết giao dịch
- **Tự động khởi tạo**: Hạ tầng ZK được thiết lập trong quá trình đăng nhập
- **Quản lý nonce**: SDK tự động xử lý thứ tự giao dịch
- **Tỷ lệ thập phân**: Số tiền được tự động chuẩn hóa về độ chính xác đúng
- **Xử lý lỗi**: Thông báo lỗi đầy đủ cho các giao dịch thất bại
- **Biên nhận giao dịch**: Trả về hash và trạng thái giao dịch để xác minh

**Luồng giao dịch:**
1. SDK duy trì cặp khóa tạm thời, địa chỉ ví và ZK proof sau khi đăng nhập
2. Khi gửi token, SDK tự động lấy nonce hiện tại
3. Giao dịch được ký bằng khóa riêng tạm thời
4. ZK proof được đính kèm để bảo vệ quyền riêng tư của người gửi/người nhận
5. Giao dịch được gửi tới MMN và trả về tx_hash nếu thành công
6. Người nhận tự động nhận được thông báo DM kèm chi tiết giao dịch

- **Hệ thống Coffee**: Tính năng tương tác xã hội qua sự kiện `onGiveCoffee()` để tặng quà thân mật

### Phần tử tương tác
- **Nút trong tin nhắn**: Hỗ trợ nút tương tác trong tin nhắn qua `onMessageButtonClicked()`
- **Lựa chọn dropdown**: Xử lý lựa chọn của người dùng từ menu dropdown qua `onDropdownBoxSelected()`
- **Menu nhanh**: Hỗ trợ menu hành động nhanh qua `onQuickMenuEvent()`

### Tính năng thoại và video
- **Kênh thoại**: Quản lý phiên thoại đầy đủ với các sự kiện bắt đầu, kết thúc, tham gia và rời đi
- **Báo hiệu WebRTC**: Hỗ trợ giao tiếp ngang hàng trực tiếp qua `onWebrtcSignalingFwd()`
- **Hỗ trợ streaming**: Khả năng phát trực tiếp với xử lý sự kiện tham gia/rời đi
