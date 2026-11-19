---
sidebar_position: 5
sidebar_label: Tham chiếu API
description: Lớp, phương thức, sự kiện và enum của mezon-sdk 2.8.66.
---

# Tham chiếu API

Trang này mô tả API công khai của **mezon-sdk 2.8.66**, đã đối chiếu với định nghĩa kiểu của gói. Tham số tùy chọn có dấu `?` ở cuối. ID là chuỗi.

Gói xuất ra `MezonClient`, `InteractiveBuilder`, `ButtonBuilder`, các enum (`ChannelType`, `ChannelStreamMode`, `TypeMessage`, `Events`, `EButtonMessageStyle`, `EMessageComponentType`, ...) và các interface (`ClientConfigDto`, `ChannelMessage`, `ChannelMessageContent`, `ApiMessageMention`, `ApiMessageAttachment`, ...). `TextChannel`, `Message`, `User` và `Clan` không được xuất: bạn lấy chúng từ client.

## MezonClient

```ts
new MezonClient(config: ClientConfigDto)
```

`ClientConfigDto` là `{ botId: string; token: string; host?: string; port?: string; useSSL?: boolean; timeout?: number }`. Giá trị mặc định có trong [Khái niệm cốt lõi](./core-concepts.md#the-client). Hàm khởi tạo báo lỗi `botId is required` hoặc `token is required`.

### Thuộc tính

| Thuộc tính | Kiểu | Ý nghĩa |
|---|---|---|
| `clientId` | `string` | ID Bot. Tin nhắn bot gửi có `sender_id` bằng giá trị này. |
| `clans` | `CacheManager<string, Clan>` | Các clan có bot, được nạp khi đăng nhập. Clan `"0"` chứa các kênh tin nhắn trực tiếp. |
| `channels` | `CacheManager<string, TextChannel>` | Các kênh; `fetch(id)` tải một kênh từ máy chủ. |
| `users` | `CacheManager<string, User>` | Người dùng; `fetch(id)` mở kênh tin nhắn trực tiếp với người đó. |

### Phương thức

| Phương thức | Trả về | Mục đích |
|---|---|---|
| `login()` | `Promise<string>` | Kết nối và trả về phiên dưới dạng JSON. Đừng ghi log kết quả. |
| `isSessionExpired(bufferSec?: number)` | `boolean` | `true` nếu phiên hết hạn trong vòng `bufferSec` giây. |
| `ensureValidSession(bufferSec?: number)` | `Promise<Session>` | Đăng nhập lại khi phiên sắp hết hạn. |
| `closeSocket()` | `void` | Ngắt kết nối. |
| `createPoll(body: ApiCreatePollRequest)` | `Promise<ApiCreatePollResponse \| undefined>` | Tạo bình chọn: `{ clan_id?, channel_id?, question?, answers?, expire_hours?, type? }`. |
| `getPoll(body: ApiGetPollRequest)` | `Promise<ApiGetPollResponse \| undefined>` | Đọc bình chọn và kết quả theo `poll_id`, hoặc theo `message_id` và `channel_id`. |
| `closePoll(body: ApiClosePollRequest)` | `Promise<void \| undefined>` | Kết thúc bình chọn do bot tạo. |
| `sendToken(body: APISentTokenRequest)` | `Promise<AddTxResponse>` | Gửi Mezon Đồng từ bot tới `receiver_id`: `{ receiver_id, amount, note?, extra_attribute? }`. Báo lỗi `Transaction failed: ...` khi thất bại. |
| `getStreamPlayback(body: { channel_id: string; publish: boolean })` | `Promise<GetStreamPlaybackResponse \| undefined>` | Xin quyền phát vào kênh phát trực tiếp. Xem [Kênh phát trực tiếp](../../mezon-topics/streaming-channel.mdx). |
| `generateMeetToken(body: { channel_id: string; room_name: string; metadata: string })` | `Promise<GenerateMeetTokenResponse \| undefined>` | Lấy token cuộc họp cho một kênh: `{ token, url }`. |
| `generateCDNSignature(body: { channel_id: string })` | `Promise<GenerateCDNSignatureResponse \| undefined>` | Lấy chữ ký CDN cho một kênh: `{ signature }`. |
| `addQuickMenuAccess(body: ApiQuickMenuAccessPayload)` | `Promise<any>` | Thêm một mục menu nhanh cho bot: `{ menu_name, action_msg, clan_id?, background?, menu_type? }`. |
| `deleteQuickMenuAccess(botId?: string)` | `Promise<any>` | Xóa các mục menu nhanh của bot. |

`listTransactionDetail` có tồn tại nhưng không làm gì trong bản 2.8.66.

### Sự kiện {#events}

Mỗi phương thức nhận một hàm lắng nghe và trả về client. Kiểu dữ liệu của sự kiện đến từ gói.

| Phương thức | Hàm lắng nghe nhận |
|---|---|
| `onChannelMessage` | `ChannelMessage`: `id`, `message_id`, `clan_id`, `channel_id`, `sender_id`, `content`, `mentions`, `attachments`, `references`, `topic_id`, `username`, `display_name`, `clan_nick`, ... |
| `onMessageReaction` | Biểu cảm (không có kiểu cụ thể). |
| `onMessageButtonClicked` | `{ message_id, channel_id, button_id, sender_id, user_id, extra_data }` |
| `onDropdownBoxSelected` | `{ message_id, channel_id, selectbox_id, sender_id, user_id, values }` |
| `onChannelCreated`, `onChannelUpdated`, `onChannelDeleted` | Kênh và clan của kênh. |
| `onUserChannelAdded`, `onUserChannelRemoved` | Thành viên được thêm vào hoặc xóa khỏi kênh. |
| `onAddClanUser` | `{ clan_id, user, invitor }` |
| `onUserClanRemoved` | Thành viên bị xóa khỏi clan. |
| `onRoleEvent`, `onRoleAssign` | Thay đổi vai trò và việc gán vai trò. |
| `onTokenSend` | `{ sender_id?, sender_name?, receiver_id, amount, note?, transaction_id? }` |
| `onGiveCoffee` | Một ly cà phê được tặng cho thành viên. |
| `onNotification` | Thông báo gửi cho bot. |
| `onClanEventCreated` | Một sự kiện của clan vừa được tạo. |
| `onStreamingJoinedEvent` | `{ clan_id, clan_name, id, participant, user_id, streaming_channel_id, streaming_channel_label, is_publisher }` |
| `onStreamingLeavedEvent` | `{ id, clan_id, streaming_channel_id, streaming_user_id }` |
| `onVoiceStartedEvent`, `onVoiceEndedEvent`, `onVoiceJoinedEvent`, `onVoiceLeavedEvent` | Hoạt động trong kênh thoại. |
| `onQuickMenuEvent` | Thành viên dùng mục menu nhanh của bot (không có kiểu cụ thể). |
| `onWebrtcSignalingFwd` | Tín hiệu WebRTC được chuyển tới bot. |

`client.on("ready", () => ...)` chạy khi đăng nhập xong.

## CacheManager

| Thành phần | Trả về | Mục đích |
|---|---|---|
| `get(id)` | `V \| undefined` | Chỉ đọc bộ nhớ đệm. |
| `fetch(id)` | `Promise<V>` | Đọc bộ nhớ đệm, nếu không có thì tải (xem từng bộ nhớ đệm). |
| `values()` | `IterableIterator<V>` | Mọi mục trong bộ nhớ đệm. |
| `size` | `number` | Số mục trong bộ nhớ đệm. |
| `first()`, `filter(fn)`, `map(fn)` | | Hàm tiện ích trên các mục đã có. |

## Clan

Thuộc tính: `id`, `name`, `clan_name`, `welcome_channel_id`, `channels` (`CacheManager<string, TextChannel>`), `clientId`.

| Phương thức | Trả về | Mục đích |
|---|---|---|
| `loadChannels()` | `Promise<void>` | Tải các kênh của clan vào `clan.channels` (một lần). |
| `reloadChannels()` | `Promise<void>` | Tải lại các kênh. |
| `listChannelVoiceUsers(limit?: number)` | `Promise<ApiVoiceChannelUserList>` | Thành viên trong các kênh thoại của clan. `limit` từ 1 đến 500 (mặc định 500). |
| `listRoles(limit?: number, state?: number, cursor?: string)` | `Promise<ApiRoleListEventResponse>` | Các vai trò của clan. |
| `updateRole(roleId: string, request: MezonUpdateRoleBody)` | `Promise<boolean>` | Sửa vai trò: tên, màu, quyền, thành viên (`add_user_ids`, `remove_user_ids`). `max_permission_id` là bắt buộc. |

## TextChannel

Thuộc tính: `id`, `name`, `channel_type`, `is_private`, `category_id`, `category_name`, `parent_id`, `meeting_code`, `clan`, `messages` (`CacheManager<string, Message>`, đọc từ kho tin nhắn cục bộ).

| Phương thức | Trả về | Mục đích |
|---|---|---|
| `send(content, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?)` | `Promise<Message>` | Gửi tin nhắn. `content` là một `ChannelMessageContent`. |
| `sendEphemeral(receiver_id: string \| string[], content, reference_message_id?, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?)` | `Promise<ChannelMessageAck>` | Gửi tin nhắn chỉ người nhận thấy. |
| `updateEphemeral(receiver_id, content, message_id, topic_id?, reference_message_id?, attachments?, mentions?, mention_everyone?, anonymous_message?)` | `Promise<ChannelMessageAck>` | Sửa tin nhắn ephemeral. |
| `deleteEphemeral(receiver_id, message_id, topic_id?)` | `Promise<ChannelMessageAck>` | Xóa tin nhắn ephemeral. |

## Message

Thuộc tính: `id`, `clan_id`, `channel_id`, `sender_id`, `content`, `mentions`, `attachments`, `reactions`, `references`, `topic_id`, `create_time_seconds`, `channel`.

| Phương thức | Trả về | Mục đích |
|---|---|---|
| `reply(content, mentions?, attachments?, mention_everyone?, anonymous_message?, topic_id?, code?)` | `Promise<Message>` | Trả lời kèm tham chiếu tới tin nhắn này. |
| `update(content, mentions?, attachments?)` | `Promise<Message>` | Thay nội dung. |
| `react({ emoji_id, emoji, count, action_delete?, id? })` | `Promise<ApiMessageReaction>` | Thêm biểu cảm, hoặc gỡ biểu cảm với `action_delete: true`. |
| `delete()` | `Promise<ChannelMessageAck>` | Xóa tin nhắn. |

## User

Thuộc tính: `id`, `username`, `display_name`, `clan_nick`, `clan_avatar`, `avartar` (ảnh đại diện; tên thuộc tính được viết như vậy), `dmChannelId`.

| Phương thức | Trả về | Mục đích |
|---|---|---|
| `sendDM(content, code?, attachments?)` | `Promise<Message>` | Gửi tin nhắn trực tiếp cho người dùng. |

## Builder

`ButtonBuilder` và `InteractiveBuilder` tạo nút bấm và thẻ biểu mẫu. Xem [Tin nhắn tương tác](../../mezon-topics/interactive-message.mdx).

## Enum

`ChannelType`:

| Tên | Giá trị | Loại kênh |
|---|---|---|
| `CHANNEL_TYPE_CHANNEL` | 1 | Kênh văn bản |
| `CHANNEL_TYPE_GROUP` | 2 | Nhóm chat |
| `CHANNEL_TYPE_DM` | 3 | Tin nhắn trực tiếp |
| `CHANNEL_TYPE_GMEET_VOICE` | 4 | Loại kênh thoại cũ, không còn dùng |
| `CHANNEL_TYPE_FORUM` | 5 | Diễn đàn |
| `CHANNEL_TYPE_STREAMING` | 6 | Kênh phát trực tiếp |
| `CHANNEL_TYPE_THREAD` | 7 | Chủ đề |
| `CHANNEL_TYPE_APP` | 8 | Ứng dụng trong kênh |
| `CHANNEL_TYPE_ANNOUNCEMENT` | 9 | Thông báo |
| `CHANNEL_TYPE_MEZON_VOICE` | 10 | Kênh thoại |

`ChannelStreamMode`: `STREAM_MODE_CHANNEL` 2, `STREAM_MODE_GROUP` 3, `STREAM_MODE_DM` 4, `STREAM_MODE_CLAN` 5, `STREAM_MODE_THREAD` 6.

`TypeMessage` (trường `code` của tin nhắn): `Chat` 0, `ChatUpdate` 1, `ChatRemove` 2, `Typing` 3, `Indicator` 4, `Welcome` 5, `CreateThread` 6, `CreatePin` 7, `MessageBuzz` 8, `Topic` 9, `AuditLog` 10, `SendToken` 11, `Ephemeral` 12, `UpcomingEvent` 13, `UpdateEphemeralMsg` 14, `DeleteEphemeralMsg` 15, `Contact` 16, `Location` 17, `Poll` 18.

## Liên quan

- [Khái niệm cốt lõi](./core-concepts.md)
- [Cách dùng và ví dụ](./usage-and-examples.md)
- [Bot được phép làm gì](../bot-api-access.md)
