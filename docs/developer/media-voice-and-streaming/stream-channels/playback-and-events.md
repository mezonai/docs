---
sidebar_position: 2
sidebar_label: Playback & events
description: HLS CDN playback, WHEP options, realtime streaming presence events, and GenerateCDNSignature in Mezon.
---

# Stream playback & realtime events

Once a publisher goes live over WHIP, `mezon-streaming-server` packages the stream into CMAF fMP4 HLS segments, uploads them to object storage behind the CDN, and announces stream state changes to Mezon over NATS.

## Viewer playback (HLS over CDN)

Mezon clients call `GetStreamPlayback` with `publish: false`, receiving a **6-hour view JWT** and the multivariant playlist URL:

```text
<streaming.hls_base_url>/live/<channel_id>/index.m3u8
```

### Packaging characteristics (`spec.md` §10)

- **Format:** CMAF fragmented MP4 (`init.mp4` + `.m4s` segments) muxing H.264 (`avc1.PPCCLL`) and `Opus` (written capitalized as `Opus` in `CODECS` for Apple AVPlayer compatibility). When a publisher pauses audio while sending video, silent 20 ms Opus frames are injected after 0.5 s to keep tracks aligned.
- **Renditions:** One rendition (`stream_0`, `stream_1`, `stream_2`) per active simulcast layer, ordered smallest first in `index.m3u8`.
- **Segment duration & latency:** Segments cut on keyframes every `capacity.keyframe_ms` (default **2 s**) with a 6-segment sliding window. Because the server uploads plain HLS segments rather than partial LL-HLS parts, players stay approximately **3 target durations (~6 s) or more** behind live.
- **Stream end:** When the channel closes after `capacity.channel_idle_ms` (default 10 s idle) or on graceful node shutdown, the origin uploads every rendition playlist with `#EXT-X-ENDLIST`. Reopening the channel uses fresh random segment prefixes (`<8 hex>-init<v>.mp4`, `<8 hex>-seg<n>.m4s`) so CDN caches never mix consecutive broadcasts.

:::warning Public CDN HLS URL caveat
HLS playlists and segments uploaded to CDN storage require **no authentication credential** (`spec.md` §3.2 & §14). Any party who knows the decimal channel ID can fetch `/live/<channel_id>/index.m3u8` while a stream is live—including for private channels—and URLs do not expire. Do not stream confidential or access-controlled video over public HLS stream channels.
:::

### Optional WebRTC viewing (WHEP)

Streaming nodes also expose **WHEP** (`POST /whep/<channel_id>?layer=low|mid|high|auto`) authenticated with a `view` or `publish` JWT, plus dynamic quality switching via `POST /resource/<id>/layer?layer=low|mid|high|auto` (switches cleanly on the next target-layer keyframe). Note that `GetStreamPlayback` currently returns `hls_url` only (no WHEP URL), so standard Mezon apps watch over HLS. Each token subject (`sub`) may hold at most **8 concurrent WHEP viewer sessions** per node (a 9th evicts the oldest).

## Realtime streaming presence events

When `mezon-streaming-server` publishes `"state": "live"` or `"state": "ended"` to NATS (`mezon_streaming_event`), `mezon-proto-server` updates cluster-safe Valkey keys (`strm:live` hash for channel → publisher; `strm:<channel_id>` set for watching viewer UIDs) and broadcasts realtime events to the clan:

| Protobuf envelope | Field # | `mezon-sdk` listener | `Mezon.Net.Sdk` event | When emitted |
|---|---|---|---|---|
| `StreamingJoinedEvent` | `53` | `onStreamingJoinedEvent` | `StreamingJoinedData` (or `StreamingJoined`) | Publisher goes live (`is_publisher: true`) or a viewer starts watching (`streaming_watch`) |
| `StreamingLeavedEvent` | `54` | `onStreamingLeavedEvent` | `StreamingLeavedData` (or `StreamingLeaved`) | Stream ends (emitted for publisher; clients clear the viewer list on publisher leave) or a viewer stops watching |
| `StreamingViewerCountEvent` | `106` | *(protobuf envelope)* | `StreamingViewerCountChanged` | Aggregated audience viewer count update for a streaming channel |
| `StreamingWatch` | `104` | *(client→server)* | *(client→server)* | Client reports watching / stopped watching to update `strm:<channel_id>` |

### Listening for stream live / ended in bots

```ts
// TypeScript (mezon-sdk)
client.onStreamingJoinedEvent((event) => {
  if (event.is_publisher) {
    console.log(`Stream LIVE in ${event.streaming_channel_id} by ${event.user_id}`);
  } else {
    console.log(`Viewer ${event.user_id} joined ${event.streaming_channel_id}`);
  }
});

client.onStreamingLeavedEvent((event) => {
  console.log(`Left stream ${event.streaming_channel_id}: ${event.streaming_user_id}`);
});
```

```csharp
// C# (Mezon.Net.Sdk)
client.StreamingJoinedData += evt =>
{
    Console.WriteLine($"Stream join in {evt.StreamingChannelId}, isPublisher={evt.IsPublisher}");
    return Task.CompletedTask;
};

client.StreamingLeavedData += evt =>
{
    Console.WriteLine($"Stream leave in {evt.StreamingChannelId}, user={evt.StreamingUserId}");
    return Task.CompletedTask;
};

client.StreamingViewerCountChanged += evt =>
{
    Console.WriteLine($"Viewer count update: {evt.ViewerCount}");
    return Task.CompletedTask;
};
```

## `GenerateCDNSignature` reference

`GenerateCDNSignature` is bot-allowed and external-allowed (`api_upload.go`). Given a `channel_id` that the caller belongs to, `mezon-api` signs `/<16-hex-channel-id><unix_ts>` with HMAC-SHA256 using the CDN secret and returns `{ signature: "<ts>-<url_escaped_base64_mac>" }`.

- **Current use:** Appending `?<signature>` when fetching protected channel attachment assets from the CDN.
- **Note on live HLS:** Earlier versions of `mezon-streaming-server` (prior to `0.6.0`) accepted `GenerateCDNSignature` query tokens on HLS paths. Since push-to-storage HLS (`0.8.0+`), live HLS no longer validates `GenerateCDNSignature`.

```ts
const res = await client.generateCDNSignature({ channel_id: "CHANNEL_ID" });
// res?.signature => "<unix_ts>-<url_encoded_hmac>"
```

## Related

- [Publishing with WHIP](./publishing-with-whip.mdx)
- [Events reference](../../reference/events-reference.md)
- [Media overview](../overview.md)
