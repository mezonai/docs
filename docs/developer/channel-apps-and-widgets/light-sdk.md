---
sidebar_position: 2
sidebar_label: Mezon Light SDK
description: Embed real-time Mezon direct and group messaging in web applications using mezon-light-sdk (1.0.10) and OIDC ID tokens.
---

# Mezon Light SDK (`mezon-light-sdk`)

`mezon-light-sdk` (version `1.0.10`) is a lightweight TypeScript/JavaScript SDK designed for third-party web applications that want to authenticate Mezon users with an OAuth2/OIDC `id_token` and embed direct or group chat without bundling the full desktop/web client SDK. It also powers [`mezon-chat-widget`](./chat-widget.md).

## Installation

```bash
npm install mezon-light-sdk
```

## Authentication & `external` RPC allowlist

Calling `LightClient.authenticate(...)` sends the user's OIDC `id_token`, `user_id`, and `username` to `AuthenticateIdToken` on `mezon-gw` (`https://gw.mezon.ai`). The gateway validates the ID token, verifies `claims.user_id === user_id`, and mints a scoped session tagged with `vars["appname"] = "external"`.

Because the session is tagged `external`, `mezon-api` enforces a strict **5-RPC allowlist** (`api.go`):

| Allowed RPC | Purpose in `mezon-light-sdk` |
|---|---|
| `ListChannelDescs` | List the user's DM and group channels |
| `CreateChannelDesc` | Create/open a DM (`createDM`) or group DM (`createGroupDM`) |
| `UploadAttachmentFile` | Request a presigned upload URL (`uploadAttachment`) |
| `ListChannelMessages` | Fetch message history for a channel |
| `GenerateCDNSignature` | Request a signed CDN access token for private channel attachments |

Any other API RPC called with an `external` session is rejected with `Unauthenticated`.

## Quickstart: authenticate and send a DM

```ts
import { LightClient, LightSocket } from "mezon-light-sdk";

// 1. Exchange an OIDC id_token (from Mezon OAuth2) for a Mezon Light session
const client = await LightClient.authenticate({
  id_token: "OIDC_ID_TOKEN",
  user_id: "MEZON_USER_ID",
  username: "mai.nguyen",
  // Optional overrides:
  // gateway_url: "https://gw.mezon.ai",
  // serverkey: "YOUR_SERVER_KEY",
});

// 2. Open or retrieve a DM channel with a peer (for example a support bot or user)
const dmChannel = await client.createDM("PEER_USER_ID");
const channelId = dmChannel.channel_id!;

// 3. Connect the realtime protobuf WebSocket
const socket = new LightSocket(client, client.session);
await socket.connect({
  onError: (err) => console.error("Socket error:", err),
  onDisconnect: () => console.log("Socket disconnected"),
});

// 4. Listen for incoming messages
const unsubscribe = socket.onChannelMessage((msg) => {
  console.log("Message from", msg.sender_id, msg.content);
});

// 5. Join the DM channel and send a message
await socket.joinDMChannel(channelId);
await socket.sendDM({
  channelId,
  content: { t: "Hello from my web app!" },
});

// Clean up when leaving
unsubscribe();
await socket.leaveDMChannel(channelId);
socket.disconnect();
```

## Restoring and refreshing sessions

Avoid calling `AuthenticateIdToken` on every page load. Export the session and restore it with `LightClient.initClient(...)`:

```ts
// Persist after login
const snapshot = client.exportSession();
// { token, refresh_token, api_url, ws_url, user_id }
sessionStorage.setItem("mezon_light_session", JSON.stringify(snapshot));

// Restore later
const restored = LightClient.initClient(
  JSON.parse(sessionStorage.getItem("mezon_light_session")!),
);

if (restored.isSessionExpired()) {
  if (restored.isRefreshSessionExpired()) {
    // Re-run OAuth2 login
  } else {
    await restored.refreshSession();
  }
}
```

## Uploading attachments

Use `client.uploadAttachment(...)` to obtain a presigned upload URL and final attachment URL, upload the binary file with `PUT`, then pass the resulting URL in `attachments`:

```ts
const file: File = fileInput.files![0];

// 1. Request a presigned upload slot from mezon-api
const upload = await client.uploadAttachment({
  filename: file.name,
  filetype: file.type,
  size: file.size,
  width: 800,
  height: 600,
});

// 2. Upload file bytes directly to object storage via the returned presigned URL
await fetch(upload.url!, {
  method: "PUT",
  headers: { "Content-Type": file.type },
  body: file,
});

// 3. Send the message referencing the attachment
await socket.sendDM({
  channelId,
  content: { t: "Attached screenshot" },
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

## API summary

### `LightClient`

| Member | Description |
|---|---|
| `LightClient.authenticate(config)` | Exchanges `{ id_token, user_id, username, gateway_url?, serverkey? }` via `AuthenticateIdToken`. |
| `LightClient.initClient(config)` | Restores a client from `{ token, refresh_token, api_url, ws_url, user_id, serverkey? }`. |
| `createDM(peerId)` | Opens or creates a 1:1 DM channel (`CHANNEL_TYPE_DM = 3`). |
| `createGroupDM(userIds)` | Creates a group DM channel (`CHANNEL_TYPE_GROUP = 2`). |
| `uploadAttachment(request)` | Calls `UploadAttachmentFile` to get a presigned upload URL. |
| `refreshSession()` | Refreshes an expired access token using `refresh_token`. |
| `isSessionExpired()` / `isRefreshSessionExpired()` | Checks JWT expiry locally. |
| `exportSession()` | Returns `{ token, refresh_token, api_url, ws_url, user_id }`. |
| `client` | Underlying `MezonApi` client for calling allowed external RPCs such as `listChannelMessages` or `generateCDNSignature`. |

### `LightSocket`

| Method | Description |
|---|---|
| `connect({ onError?, onDisconnect?, verbose? })` | Opens the protobuf WebSocket (`WebSocketAdapterPb`). |
| `onChannelMessage(handler)` | Subscribes to incoming `ChannelMessage` events; returns an unsubscribe function. |
| `joinDMChannel(channelId)` / `leaveDMChannel(channelId)` | Joins or leaves a DM channel (waits with exponential backoff until socket is ready). |
| `joinGroupChannel(channelId)` / `leaveGroupChannel(channelId)` | Joins or leaves a group DM channel. |
| `sendDM({ channelId, content, attachments?, hideLink?, code? })` | Sends a DM over `STREAM_MODE_DM = 4`. |
| `sendGroup({ channelId, content, attachments?, hideLink? })` | Sends a group message over `STREAM_MODE_GROUP = 3`. |
| `disconnect()` | Closes the WebSocket connection. |

## Related

- [Mezon Chat Widget](./chat-widget.md)
- [OAuth2 Authorization Code Flow](../oauth2/authorization-code-flow.mdx)
- [Claims and ID tokens](../oauth2/claims-and-id-tokens.md)
