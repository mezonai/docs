---
sidebar_position: 1
sidebar_label: Tham chiếu sự kiện
description: Danh mục thống nhất ánh xạ sự kiện Protobuf Envelope thời gian thực và sự kiện SSE sang listener của mezon-sdk và Mezon.Net.Sdk.
---

# Tham chiếu sự kiện thống nhất

Mezon truyền sự kiện thời gian thực trên socket bot dưới dạng gói protobuf `rtapi.Envelope` (`mezon-protocol/rtapi/realtime.proto`), kết hợp với luồng Server-Sent Events (SSE) cho vòng đời AI agent. Bảng dưới đây ánh xạ từng sự kiện trên dây sang **`mezon-sdk` (`2.8.68`)** và **`Mezon.Net.Sdk` (`1.11.0`)**.

## Nhắn tin & thông báo

| Trường `Envelope` Protobuf | Số trường | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | Ghi chú |
|---|---|---|---|---|
| `channel_message` | `6` | `onChannelMessage` | `ChannelMessageReceived` | Tin nhắn kênh, luồng, nhóm và DM (`clan_id == "0"`) |
| `message_reaction_event` | `26` | `onMessageReaction` | `MessageReactionReceived` | Thành viên thả hoặc gỡ biểu tượng cảm xúc |
| `notifications` | `13` | `onNotification` | `NotificationsReceived` | Thông báo gửi tới bot |

## Thành phần tương tác & Quick Menu

| Trường `Envelope` Protobuf | Số trường | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | Ghi chú |
|---|---|---|---|---|
| `message_button_clicked` | `60` | `onMessageButtonClicked` | `MessageButtonClicked` / `InteractionRouter.OnButton` | **Cảnh báo:** `user_id` do client gửi (không tin cậy phân quyền); xem [Tin nhắn tương tác](../interactive-features/interactive-messages.mdx) |
| `dropdown_box_selected` | `64` | `onDropdownBoxSelected` | `DropdownBoxSelected` / `InteractionRouter.OnSelect` | `user_id` được máy chủ xác thực (`InteractionActorTrust.ServerAuthenticated`) |
| `quick_menu_event` | `84` | `onQuickMenuEvent` | `QuickMenuReceivedData` (hoặc `QuickMenuReceived`) | Kích hoạt khi thành viên chọn lệnh Quick Menu của bot |

## Kênh, clan, vai trò & thành viên

| Trường `Envelope` Protobuf | Số trường | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | Ghi chú |
|---|---|---|---|---|
| `channel_created_event` | `31` | `onChannelCreated` | `ChannelCreated` | Tạo kênh hoặc luồng mới trong clan |
| `channel_deleted_event` | `32` | `onChannelDeleted` | `ChannelDeleted` | Xóa kênh khỏi clan |
| `channel_updated_event` | `33` | `onChannelUpdated` | `ChannelUpdated` | Cập nhật thông tin kênh hoặc trạng thái luồng |
| `channel_archive_event` | `97` | `on(Events.ChannelArchive, fn)` | *(envelope)* | Lưu trữ (`active = 0`) hoặc mở lại (`active = 1`) kênh |
| `user_channel_added_event` | `36` | `onUserChannelAdded` | `UserChannelAdded` | Thêm thành viên vào kênh riêng tư hoặc luồng |
| `user_channel_removed_event` | `37` | `onUserChannelRemoved` | `UserChannelRemoved` | Gỡ thành viên khỏi kênh |
| `add_clan_user_event` | `43` | `onAddClanUser` | `ClanUserAdded` | Thành viên (hoặc chính bot) tham gia clan |
| `user_clan_removed_event` | `38` | `onUserClanRemoved` | `UserClanRemoved` | Thành viên rời hoặc bị gỡ khỏi clan |
| `clan_join` | `3` | *(nội bộ)* | `ClanJoined` | Xác nhận tham gia luồng chat của clan |
| `clan_event_created` | `44` | `onClanEventCreated` | `ClanEventCreated` | Tạo sự kiện lịch mới trong clan |
| `role_event` | `51` | `onRoleEvent` | `RoleChanged` | Tạo, sửa hoặc xóa vai trò |
| `role_assign_event` | `45` | `onRoleAssign` | `RoleAssigned` | Gán hoặc thu hồi vai trò của thành viên |
| `transfer_ownership_event` | `87` | *(envelope)* | `OwnershipTransferred` | Chuyển quyền sở hữu clan |
| `friend_state_updated` | `107` | `onFriendStateUpdated` | *(envelope)* | Thay đổi trạng thái bạn bè đồng bộ giữa các phiên |

## Thoại, WebRTC & kênh phát sóng

| Trường `Envelope` Protobuf | Số trường | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | Ghi chú |
|---|---|---|---|---|
| `voice_started_event` | `29` | `onVoiceStartedEvent` | `VoiceStarted` | Phiên phòng thoại bắt đầu |
| `voice_ended_event` | `30` | `onVoiceEndedEvent` | `VoiceEnded` | Phiên phòng thoại kết thúc |
| `voice_joined_event` | `27` | `onVoiceJoinedEvent` | `VoiceJoined` | Thành viên tham gia kênh thoại |
| `voice_leaved_event` | `28` | `onVoiceLeavedEvent` | `VoiceLeaved` | Thành viên rời kênh thoại |
| `voice_interactive_event` | `100` | *(envelope)* | `VoiceInteractiveReceived` | Hành động tương tác trong phòng thoại |
| `webrtc_signaling_fwd` | `62` | `onWebrtcSignalingFwd` | `WebrtcSignalingForwarded` | Tín hiệu WebRTC 1:1 được chuyển tiếp |
| `streaming_joined_event` | `53` | `onStreamingJoinedEvent` | `StreamingJoinedData` (hoặc `StreamingJoined`) | Stream bắt đầu phát (`is_publisher: true`) hoặc người xem vào xem |
| `streaming_leaved_event` | `54` | `onStreamingLeavedEvent` | `StreamingLeavedData` (hoặc `StreamingLeaved`) | Stream kết thúc (publisher rời) hoặc người xem thoát |
| `streaming_watch` | `104` | *(client → server)* | *(client → server)* | Client người xem báo trạng thái bắt đầu/dừng xem kênh stream |
| `sfu_breakout_room_event` | `105` | *(envelope)* | *(envelope)* | Sự kiện phòng breakout của Voice SFU |
| `streaming_viewer_count_event` | `106` | *(envelope)* | `StreamingViewerCountChanged` | Cập nhật tổng số người xem kênh stream |

## Thanh toán & tương tác xã hội

| Trường `Envelope` Protobuf | Số trường | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | Ghi chú |
|---|---|---|---|---|
| `token_sent_event` | `59` | `onTokenSend` | `TokenSent` | Thông báo chuyển token Mezon Dong |
| `give_coffee_event` | `47` | `onGiveCoffee` | `CoffeeGiven` | Thành viên tặng cà phê cho nhau |

## Sự kiện AI Agent (Socket + SSE)

| Sự kiện / Envelope | Kênh truyền | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) | Ghi chú |
|---|---|---|---|---|
| `aiagent_enabled_event` (`94`) | Socket thời gian thực | `onAIAgentEnableEvent` | `AIAgentEnabled` | Bật/tắt AI agent trên kênh |
| `room_started` | Agent SSE (`api/sse/metadata`) | `onAIAgentSessionStarted` | `AgentSessionStarted` | Cần gọi `connectMezonAgentSSE()` / `ConnectAgentSseAsync()` |
| `room_ended` | Agent SSE (`api/sse/metadata`) | `onAIAgentSessionEnded` | `AgentSessionEnded` | Phiên thoại AI agent kết thúc |
| `room_summary_done` | Agent SSE (`api/sse/metadata`) | `onAIAgentSessionSummaryDone` | `AgentSessionSummaryDone` | Tóm tắt phiên hoàn tất |

## Vòng đời kết nối client

| Sự kiện vòng đời | `mezon-sdk` (`2.8.68`) | `Mezon.Net.Sdk` (`1.11.0`) |
|---|---|---|
| Đăng nhập lần đầu + socket sẵn sàng | `client.on("ready", fn)` | `client.Ready` |
| Mỗi lần kết nối socket thành công (gồm nối lại) | *(xử lý nội bộ)* | `client.Connected` |
| Đang thử kết nối lại | *(xử lý nội bộ)* | `client.Reconnecting` |
| Đã ngắt kết nối | *(xử lý nội bộ)* | `client.Disconnected` |

## Liên quan

- [Tin nhắn tương tác](../interactive-features/interactive-messages.mdx)
- [Phát lại & sự kiện stream](../media-voice-and-streaming/stream-channels/playback-and-events.md)
- [Sự kiện AI Agent](../ai-and-mcp/ai-agent-events.md)
- [Kiến trúc và truyền tải](../core-concepts/architecture-and-transport.md)
