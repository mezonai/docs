---
sidebar_position: 2
sidebar_label: Mezon Light SDK
description: Nhúng tính năng nhắn tin DM và nhóm thời gian thực của Mezon vào ứng dụng web bằng mezon-light-sdk (1.0.10) và OIDC ID token.
---

# Mezon Light SDK (`mezon-light-sdk`)

`mezon-light-sdk` (phiên bản `1.0.10`) là bộ SDK TypeScript/JavaScript gọn nhẹ dành cho ứng dụng web bên thứ ba muốn xác thực người dùng Mezon bằng `id_token` OAuth2/OIDC và nhúng trò chuyện trực tiếp hoặc trò chuyện nhóm mà không cần đóng gói toàn bộ client SDK. Đây cũng là thư viện nền tảng của [`mezon-chat-widget`](./chat-widget.md).

## Cài đặt

```bash
npm install mezon-light-sdk
```

## Xác thực & danh sách 5 RPC cho phiên `external`

Khi gọi `LightClient.authenticate(...)`, SDK gửi `id_token` OIDC, `user_id` và `username` tới `AuthenticateIdToken` trên `mezon-gw` (`https://gw.mezon.ai`). Gateway xác minh chữ ký ID token, đối chiếu `claims.user_id === user_id`, rồi cấp phiên giới hạn mang thẻ `vars["appname"] = "external"`.

Với phiên `external`, `mezon-api` áp dụng **danh sách cho phép gồm đúng 5 RPC** (`api.go`):

| RPC được phép | Mục đích trong `mezon-light-sdk` |
|---|---|
| `ListChannelDescs` | Liệt kê các kênh DM và nhóm của người dùng |
| `CreateChannelDesc` | Mở hoặc tạo kênh DM (`createDM`) hay nhóm DM (`createGroupDM`) |
| `UploadAttachmentFile` | Xin URL tải lên có chữ ký trước (`uploadAttachment`) |
| `ListChannelMessages` | Đọc lịch sử tin nhắn của kênh |
| `GenerateCDNSignature` | Xin chữ ký truy cập CDN cho tệp đính kèm trong kênh riêng tư |

Mọi RPC khác được gọi bằng phiên `external` đều bị từ chối với lỗi `Unauthenticated`.

## Bắt đầu nhanh: xác thực và gửi tin nhắn DM

```ts
import { LightClient, LightSocket } from "mezon-light-sdk";

// 1. Đổi OIDC id_token (từ Mezon OAuth2) lấy phiên Mezon Light
const client = await LightClient.authenticate({
  id_token: "OIDC_ID_TOKEN",
  user_id: "MEZON_USER_ID",
  username: "mai.nguyen",
  // Tùy chọn ghi đè:
  // gateway_url: "https://gw.mezon.ai",
  // serverkey: "YOUR_SERVER_KEY",
});

// 2. Mở hoặc lấy kênh DM với một người dùng/bot hỗ trợ
const dmChannel = await client.createDM("PEER_USER_ID");
const channelId = dmChannel.channel_id!;

// 3. Kết nối WebSocket Protobuf thời gian thực
const socket = new LightSocket(client, client.session);
await socket.connect({
  onError: (err) => console.error("Lỗi socket:", err),
  onDisconnect: () => console.log("Đã ngắt kết nối socket"),
});

// 4. Lắng nghe tin nhắn đến
const unsubscribe = socket.onChannelMessage((msg) => {
  console.log("Tin nhắn từ", msg.sender_id, msg.content);
});

// 5. Tham gia kênh DM và gửi tin nhắn
await socket.joinDMChannel(channelId);
await socket.sendDM({
  channelId,
  content: { t: "Xin chào từ ứng dụng web!" },
});

// Dọn dẹp khi rời trang
unsubscribe();
await socket.leaveDMChannel(channelId);
socket.disconnect();
```

## Khôi phục và làm mới phiên

Tránh gọi `AuthenticateIdToken` ở mỗi lần tải trang. Hãy xuất trạng thái phiên và khôi phục bằng `LightClient.initClient(...)`:

```ts
// Lưu sau khi đăng nhập
const snapshot = client.exportSession();
// { token, refresh_token, api_url, ws_url, user_id }
sessionStorage.setItem("mezon_light_session", JSON.stringify(snapshot));

// Khôi phục ở lần tải sau
const restored = LightClient.initClient(
  JSON.parse(sessionStorage.getItem("mezon_light_session")!),
);

if (restored.isSessionExpired()) {
  if (restored.isRefreshSessionExpired()) {
    // Chạy lại luồng đăng nhập OAuth2
  } else {
    await restored.refreshSession();
  }
}
```

## Tải tệp đính kèm qua Presigned URL

Gọi `client.uploadAttachment(...)` để xin URL tải lên có chữ ký trước, tải nội dung tệp bằng `PUT`, rồi gắn URL tệp vào mảng `attachments`:

```ts
const file: File = fileInput.files![0];

// 1. Xin URL presigned từ mezon-api
const upload = await client.uploadAttachment({
  filename: file.name,
  filetype: file.type,
  size: file.size,
  width: 800,
  height: 600,
});

// 2. Tải trực tiếp byte tệp lên kho lưu trữ đối tượng
await fetch(upload.url!, {
  method: "PUT",
  headers: { "Content-Type": file.type },
  body: file,
});

// 3. Gửi tin nhắn đính kèm tệp vừa tải
await socket.sendDM({
  channelId,
  content: { t: "Ảnh chụp màn hình đính kèm" },
  attachments: [
    {
      url: upload.url!.split("?")[0],
      filename: file.name,
      filetype: file.type,
      size: file.size,
      width: 800,
      height: 600,
    },
  ],
});
```

## Tóm tắt API

### `LightClient`

| Thành phần | Mô tả |
|---|---|
| `LightClient.authenticate(config)` | Đổi `{ id_token, user_id, username, gateway_url?, serverkey? }` qua `AuthenticateIdToken`. |
| `LightClient.initClient(config)` | Khôi phục client từ `{ token, refresh_token, api_url, ws_url, user_id, serverkey? }`. |
| `createDM(peerId)` | Mở hoặc tạo kênh DM 1:1 (`CHANNEL_TYPE_DM = 3`). |
| `createGroupDM(userIds)` | Tạo kênh nhóm DM (`CHANNEL_TYPE_GROUP = 2`). |
| `uploadAttachment(request)` | Gọi `UploadAttachmentFile` để nhận URL presigned tải tệp. |
| `refreshSession()` | Làm mới access token đã hết hạn bằng `refresh_token`. |
| `isSessionExpired()` / `isRefreshSessionExpired()` | Kiểm tra hạn JWT cục bộ. |
| `exportSession()` | Trả về `{ token, refresh_token, api_url, ws_url, user_id }`. |
| `client` | Đối tượng `MezonApi` bên dưới để gọi các RPC được phép như `listChannelMessages` hoặc `generateCDNSignature`. |

### `LightSocket`

| Phương thức | Mô tả |
|---|---|
| `connect({ onError?, onDisconnect?, verbose? })` | Mở kết nối WebSocket Protobuf (`WebSocketAdapterPb`). |
| `onChannelMessage(handler)` | Đăng ký lắng nghe sự kiện `ChannelMessage`; trả về hàm hủy đăng ký. |
| `joinDMChannel(channelId)` / `leaveDMChannel(channelId)` | Vào hoặc rời kênh DM (tự chờ socket sẵn sàng với exponential backoff). |
| `joinGroupChannel(channelId)` / `leaveGroupChannel(channelId)` | Vào hoặc rời kênh nhóm DM. |
| `sendDM({ channelId, content, attachments?, hideLink?, code? })` | Gửi tin nhắn DM qua `STREAM_MODE_DM = 4`. |
| `sendGroup({ channelId, content, attachments?, hideLink? })` | Gửi tin nhắn nhóm qua `STREAM_MODE_GROUP = 3`. |
| `disconnect()` | Đóng kết nối WebSocket. |

## Liên quan

- [Mezon Chat Widget](./chat-widget.md)
- [Luồng Authorization Code OAuth2](../oauth2/authorization-code-flow.mdx)
- [Claims và ID Token](../oauth2/claims-and-id-tokens.md)
