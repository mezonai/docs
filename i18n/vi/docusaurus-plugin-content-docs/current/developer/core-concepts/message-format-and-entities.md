---
sidebar_label: Định dạng tin nhắn & thực thể
sidebar_position: 4
description: Hệ phân cấp thực thể Mezon, quy tắc ID Snowflake 64-bit, các loại kênh, chế độ luồng, cấu trúc JSON ChannelMessageContent, chỉ mục markdown và các giới hạn hệ thống.
---

# Định dạng tin nhắn & thực thể

Mọi tương tác trên Mezon đều xoay quanh một tập gọn các thực thể cốt lõi được định danh bằng **ID Snowflake 64-bit** và cấu trúc tin nhắn JSON.

## Hệ phân cấp thực thể

```text
Clan (clan_id; "0" = vùng chứa ảo cho DM)
 ├── Roles (role_id)
 ├── Categories (category_id)
 └── Channels (channel_id, type: ChannelType)
      ├── Threads (parent_id = channel_id cha, type = 7)
      └── Messages (message_id, tùy chọn topic_id)
           ├── content (JSON: văn bản, markdown, embed, components)
           ├── mentions (user_id / role_id + chỉ mục UTF-16 s/e)
           ├── attachments (URL tệp media và siêu dữ liệu)
           ├── references (bản chụp tin nhắn được trả lời)
           └── reactions (emoji_id, emoji, count)
```

### ID Snowflake 64-bit

:::danger Luôn dùng kiểu `string` cho ID trong JavaScript/TypeScript
Mọi ID của Mezon (`clan_id`, `channel_id`, `message_id`, `user_id`, `role_id`, `botId`) đều là **số nguyên có dấu 64-bit** (`Int64`, thường dài 19 chữ số thập phân như `"1840654271217930240"`). Kiểu `Number` của JavaScript chỉ biểu diễn chính xác tối đa đến `Number.MAX_SAFE_INTEGER` (`9007199254740991`, 16 chữ số). Ép kiểu ID bằng `Number(...)` hoặc `parseInt(...)` sẽ âm thầm làm sai lệch 3 chữ số cuối!

- **JavaScript / TypeScript (`mezon-sdk`)**: Luôn giữ ID ở dạng **`string`** (hoặc `BigInt` khi cần so sánh số học).
- **.NET (`Mezon.Net.Sdk`)**: Kiểu **`long`** (`System.Int64`) 64-bit nguyên bản lưu giữ chính xác tuyệt đối.
:::

## Loại kênh (`ChannelType`) & chế độ luồng (`ChannelStreamMode`)

Mezon ánh xạ từng `ChannelType` sang chế độ định tuyến thời gian thực `ChannelStreamMode`:

| `ChannelType` | Giá trị | `ChannelStreamMode` | Giá trị | Ghi chú |
| --- | --- | --- | --- | --- |
| `CHANNEL_TYPE_CHANNEL` | `1` | `STREAM_MODE_CHANNEL` | `2` | Kênh văn bản tiêu chuẩn trong clan |
| `CHANNEL_TYPE_GROUP` | `2` | `STREAM_MODE_GROUP` | `3` | Nhóm DM (`clan_id = "0"`) |
| `CHANNEL_TYPE_DM` | `3` | `STREAM_MODE_DM` | `4` | Tin nhắn trực tiếp 1-1 (`clan_id = "0"`) |
| `CHANNEL_TYPE_GMEET_VOICE` | `4` | `STREAM_MODE_CHANNEL` | `2` | Kênh thoại Google Meet cũ |
| `CHANNEL_TYPE_FORUM` | `5` | `STREAM_MODE_CHANNEL` | `2` | Kênh diễn đàn |
| `CHANNEL_TYPE_STREAMING` | `6` | `STREAM_MODE_CHANNEL` | `2` | Kênh phát trực tiếp (WHIP / LL-HLS) |
| `CHANNEL_TYPE_THREAD` | `7` | `STREAM_MODE_THREAD` | `6` | Luồng con thuộc `parent_id` |
| `CHANNEL_TYPE_APP` | `8` | `STREAM_MODE_CHANNEL` | `2` | Kênh ứng dụng đã cài đặt |
| `CHANNEL_TYPE_ANNOUNCEMENT` | `9` | `STREAM_MODE_CHANNEL` | `2` | Kênh thông báo |
| `CHANNEL_TYPE_MEZON_VOICE` | `10` | `STREAM_MODE_CHANNEL` | `2` | Kênh thoại/video Mezon SFU (`meeting_code`) |

`STREAM_MODE_CLAN = 5` được dùng nội bộ cho kênh phát sự kiện toàn clan (`joinClanChat`).

## Mã loại tin nhắn (`TypeMessage`)

Mỗi tin nhắn gửi/nhận đều có trường số nguyên `code` biểu thị loại tin:

| `TypeMessage` | Mã | Ý nghĩa |
| --- | --- | --- |
| `Chat` | `0` | Tin nhắn trò chuyện thông thường |
| `ChatUpdate` | `1` | Sự kiện chỉnh sửa tin nhắn |
| `ChatRemove` | `2` | Sự kiện xóa tin nhắn |
| `Typing` | `3` | Tín hiệu đang nhập |
| `Indicator` | `4` | Tín hiệu trạng thái/hoạt động |
| `Welcome` | `5` | Tin nhắn chào mừng vào clan |
| `CreateThread` | `6` | Thông báo tạo luồng mới |
| `CreatePin` | `7` | Thông báo ghim tin nhắn |
| `MessageBuzz` | `8` | Tin nhắn rung cảnh báo (Buzz) |
| `Topic` | `9` | Tin nhắn trong chủ đề (`topic_id`) |
| `AuditLog` | `10` | Tin nhắn nhật ký kiểm tra |
| `SendToken` | `11` | Biên lai chuyển Mezon Đồng |
| `Ephemeral` | `12` | Tin nhắn tạm thời chỉ hiện với `receiver_id` |
| `UpcomingEvent` | `13` | Thông báo sự kiện clan |
| `UpdateEphemeralMsg` | `14` | Cập nhật tin nhắn tạm thời |
| `DeleteEphemeralMsg` | `15` | Xóa tin nhắn tạm thời |
| `Contact` | `16` | Thẻ chia sẻ danh bạ |
| `Location` | `17` | Thẻ chia sẻ vị trí |
| `Poll` | `18` | Tin nhắn bình chọn tương tác |

## Cấu trúc JSON `ChannelMessageContent`

Mezon lưu nội dung tin nhắn dưới dạng đối tượng JSON (`ChannelMessageContent` trong JS, `MessageContent` / `MessageContentBuilder` trong .NET). Thay vì phân tích cú pháp Markdown thô mỗi lần hiển thị, Mezon mã hóa các đoạn định dạng bằng **khoảng chỉ mục ký tự `[s, e)` bắt đầu từ 0** trên chuỗi `t`:

```json
{
  "t": "Deploy v2.4 succeeded! View logs in #ops",
  "mk": [
    { "type": "b", "s": 0, "e": 11 },
    { "type": "s", "s": 7, "e": 11 }
  ],
  "hg": [
    { "channelId": "1840654271217930240", "s": 36, "e": 40 }
  ],
  "embed": [],
  "components": []
}
```

### Các trường gốc của `content`

| Khóa | Kiểu | Mô tả |
| --- | --- | --- |
| `t` | `string` | Văn bản thuần của tin nhắn |
| `mk` | `MarkdownOnMessage[]` | Các đoạn định dạng (`{ type, s, e }`) theo `EMarkdownType` |
| `hg` | `HashtagOnMessage[]` | Liên kết kênh bấm được (`{ channelId, s, e }`) |
| `ej` | `EmojiOnMessage[]` | Biểu cảm tùy chỉnh của clan (`{ emojiid, s, e }`) |
| `lk` | `LinkOnMessage[]` | Khoảng liên kết HTTP/HTTPS (`{ s, e }`) |
| `vk` | `LinkVoiceRoomOnMessage[]` | Khoảng liên kết phòng thoại (`{ s, e }`) |
| `embed` | `IInteractiveMessageProps[]` | Thẻ thông tin, ô nhập liệu, danh sách chọn, nút radio, chọn ngày, hiệu ứng |
| `components` | `IMessageActionRow[]` | Các hàng nút bấm và thành phần tương tác |
| `contentThread` | `string` | Văn bản xem trước tùy chọn cho luồng |

### Giá trị `EMarkdownType`

| Thành viên Enum | Giá trị `type` | Hiển thị |
| --- | --- | --- |
| `EMarkdownType.BOLD` | `"b"` | **In đậm** |
| `EMarkdownType.SINGLE` | `"s"` | Mã nội tuyến (`code`) |
| `EMarkdownType.TRIPLE` | `"t"` | Khối mã nhiều dòng |
| `EMarkdownType.PRE` | `"pre"` | Khối văn bản giữ nguyên định dạng |
| `EMarkdownType.CODE` | `"c"` | Đoạn mã |
| `EMarkdownType.LINK` | `"lk"` | Siêu liên kết |
| `EMarkdownType.VOICE_LINK` | `"vk"` | Liên kết phòng thoại |
| `EMarkdownType.LINKYOUTUBE` | `"lk_yt"` | Liên kết nhúng YouTube |

## Nhắc tên, tệp đính kèm & trích dẫn trả lời

Các trường `mentions`, `attachments` và `references` nằm **song song** với `content` (không lồng bên trong chuỗi JSON `content`):

- **Nhắc tên (`mentions`)**: Mảng gồm `{ user_id, username, s, e }` hoặc `{ role_id, rolename, s, e }`, trong đó `s` và `e` trỏ tới đoạn `@tên` bên trong `content.t`.
- **Tệp đính kèm (`attachments`)**: Mảng gồm `{ url, filename, filetype, size, width, height }`. Vì bot không gọi được `UploadAttachmentFile`, hãy cung cấp URL HTTPS truy cập công khai.
- **Trích dẫn (`references`)**: Được tự động điền bởi `message.reply()` (JS) và `message.ReplyAsync()` (.NET) gồm `{ message_ref_id, message_sender_id, message_sender_username, message_sender_avatar, content }`.

## Các giới hạn kích thước & thông lượng cứng

| Giới hạn | Giá trị | Nơi áp đặt |
| --- | --- | --- |
| **Độ dài tối đa chuỗi JSON `content`** | **`4.000` ký tự** (`JSON.stringify(content).length <= 4000`) | Phía client trong `mezon-sdk` `SocketManager` (ném lỗi trước khi gửi) và phía máy chủ |
| **Điều tiết gửi phía client của `mezon-sdk`** | **`80` tin nhắn / giây** | `AsyncThrottleQueue` (`MAX_PER_SECSON = 80`) áp dụng cho `send`, `reply`, `update`, `react`, `delete`, `sendDM`, ephemeral |
| **Kích thước tối đa khung `Envelope` thời gian thực** | **`1 MiB`** (`1.048.576` byte) | Tầng đóng khung TLS TCP rút gọn |
| **Kích thước tối đa phản hồi API thô ghép mảnh** | **`16 MiB`** (`16.777.216` byte) | Bộ ghép mảnh `0xFF` của TLS TCP rút gọn |
| **Hàng đợi phân phối có thứ tự của `Mezon.Net.Sdk`** | **16 làn × 1.024 sự kiện/làn** (timeout handler 3 giây) | Tùy chỉnh qua `MezonSocketClientOptions` |

:::tip Xử lý nội dung dài
Do giới hạn 4.000 ký tự tính trên **toàn bộ chuỗi JSON đã tuần tự hóa** (bao gồm `embed`, `components`, `mk` và tên khóa — không chỉ riêng `content.t`), hãy chia nhỏ báo cáo dài thành nhiều tin nhắn hoặc dẫn liên kết ra trang web/ứng dụng kênh.
:::

## Liên quan

- [Tin nhắn tương tác](../interactive-features/interactive-messages.mdx) — thẻ embed, nút bấm, ô nhập, danh sách chọn, radio và chọn ngày.
- [Bình chọn (Polls)](../interactive-features/polls.mdx) — tạo, đọc và đóng cuộc bình chọn.
- [Hướng dẫn & mẫu công thức JS SDK](../bot-sdks/javascript/guides-and-recipes.md) — mã nguồn mẫu định dạng văn bản, nhắc tên, trả lời và tin tạm thời.
- [Lệnh & tương tác .NET SDK](../bot-sdks/dotnet/commands-and-interactions.md) — sử dụng `MessageContentBuilder`, `MessageEmbedBuilder` và `ButtonBuilder`.
