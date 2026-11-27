---
sidebar_position: 2
sidebar_label: Phát lại & sự kiện
description: Phát lại HLS qua CDN, tùy chọn WHEP, sự kiện trạng thái stream thời gian thực và tham chiếu GenerateCDNSignature trên Mezon.
---

# Phát lại luồng & sự kiện thời gian thực

Khi người phát bắt đầu phát trực tiếp qua WHIP, `mezon-streaming-server` đóng gói luồng thành các phân đoạn CMAF fMP4 HLS, tải lên kho lưu trữ đối tượng phía sau CDN và phát thông báo trạng thái về Mezon qua NATS.

## Phát lại cho người xem (HLS qua CDN)

Ứng dụng Mezon gọi `GetStreamPlayback` với `publish: false` để nhận **view JWT hiệu lực 6 giờ** cùng URL playlist đa tầng:

```text
<streaming.hls_base_url>/live/<channel_id>/index.m3u8
```

### Đặc tính đóng gói (`spec.md` §10)

- **Định dạng:** CMAF fragmented MP4 (`init.mp4` + phân đoạn `.m4s`) ghép video H.264 (`avc1.PPCCLL`) và âm thanh `Opus` (ghi hoa chữ `Opus` trong `CODECS` để tương thích với Apple AVPlayer). Khi người phát tạm ngắt âm thanh nhưng vẫn phát video, máy chủ tự chèn khung Opus im lặng 20 ms sau 0,5 giây để giữ đồng bộ.
- **Độ phân giải (Renditions):** Mỗi lớp simulcast tạo một rendition (`stream_0`, `stream_1`, `stream_2`), liệt kê từ nhỏ tới lớn trong `index.m3u8`.
- **Độ dài phân đoạn & độ trễ:** Phân đoạn cắt tại keyframe mỗi `capacity.keyframe_ms` (mặc định **2 giây**), cửa sổ trượt 6 phân đoạn. Vì máy chủ tải các phân đoạn HLS tiêu chuẩn (không tải các phần tử LL-HLS từng phần), người xem thường trễ khoảng **3 chu kỳ phân đoạn (~6 giây) trở lên** so với trực tiếp.
- **Kết thúc luồng:** Khi kênh đóng sau `capacity.channel_idle_ms` (mặc định 10 giây không hoạt động) hoặc khi node tắt có kiểm soát, origin tải lại playlist của mọi rendition kèm `#EXT-X-ENDLIST`. Lần phát tiếp theo dùng tiền tố ngẫu nhiên mới (`<8 hex>-init<v>.mp4`, `<8 hex>-seg<n>.m4s`) để bộ đệm CDN không bao giờ trộn lẫn hai buổi phát.

:::warning Lưu ý bảo mật: URL HLS trên CDN là công khai
Playlist và phân đoạn HLS đẩy lên kho lưu trữ CDN **không yêu cầu thông tin xác thực** (`spec.md` §3.2 & §14). Bất kỳ ai biết ID kênh dạng thập phân đều có thể tải `/live/<channel_id>/index.m3u8` khi luồng đang phát — kể cả với kênh riêng tư — và URL không tự hết hạn. Không phát nội dung mật hoặc cần kiểm soát truy cập chặt qua kênh stream HLS công khai.
:::

### Xem qua WebRTC (WHEP — tùy chọn)

Các node streaming cũng mở endpoint **WHEP** (`POST /whep/<channel_id>?layer=low|mid|high|auto`) xác thực bằng JWT vai trò `view` hoặc `publish`, kèm đổi chất lượng động qua `POST /resource/<id>/layer?layer=low|mid|high|auto` (chuyển mượt tại keyframe kế tiếp). Lưu ý `GetStreamPlayback` hiện chỉ trả về `hls_url` (không trả URL WHEP), nên các ứng dụng Mezon tiêu chuẩn xem qua HLS. Mỗi `sub` chỉ giữ tối đa **8 phiên xem WHEP đồng thời** trên một node (phiên thứ 9 tự đóng phiên cũ nhất).

## Sự kiện trạng thái stream thời gian thực

Khi `mezon-streaming-server` phát `"state": "live"` hoặc `"state": "ended"` lên NATS (`mezon_streaming_event`), `mezon-proto-server` cập nhật khóa Valkey an toàn cho cluster (`strm:live` ánh xạ kênh → người phát; tập `strm:<channel_id>` chứa danh sách UID người xem) và phát sự kiện tới clan:

| Protobuf Envelope | Số trường | Listener `mezon-sdk` | Sự kiện `Mezon.Net.Sdk` | Thời điểm phát |
|---|---|---|---|---|
| `StreamingJoinedEvent` | `53` | `onStreamingJoinedEvent` | `StreamingJoinedData` (hoặc `StreamingJoined`) | Người phát bắt đầu live (`is_publisher: true`) hoặc người xem vào xem (`streaming_watch`) |
| `StreamingLeavedEvent` | `54` | `onStreamingLeavedEvent` | `StreamingLeavedData` (hoặc `StreamingLeaved`) | Luồng kết thúc (phát cho publisher; client tự xóa danh sách người xem khi publisher rời) hoặc người xem thoát |
| `StreamingViewerCountEvent` | `106` | *(protobuf envelope)* | `StreamingViewerCountChanged` | Cập nhật tổng số lượng người xem của kênh stream |
| `StreamingWatch` | `104` | *(client→server)* | *(client→server)* | Client báo bắt đầu / dừng xem để cập nhật `strm:<channel_id>` |

### Lắng nghe sự kiện live / kết thúc trong bot

```ts
// TypeScript (mezon-sdk)
client.onStreamingJoinedEvent((event) => {
  if (event.is_publisher) {
    console.log(`Kênh ${event.streaming_channel_id} đang LIVE bởi ${event.user_id}`);
  } else {
    console.log(`Người xem ${event.user_id} vào kênh ${event.streaming_channel_id}`);
  }
});

client.onStreamingLeavedEvent((event) => {
  console.log(`Rời stream ${event.streaming_channel_id}: ${event.streaming_user_id}`);
});
```

```csharp
// C# (Mezon.Net.Sdk)
client.StreamingJoinedData += evt =>
{
    Console.WriteLine($"Vào stream {evt.StreamingChannelId}, isPublisher={evt.IsPublisher}");
    return Task.CompletedTask;
};

client.StreamingLeavedData += evt =>
{
    Console.WriteLine($"Rời stream {evt.StreamingChannelId}, user={evt.StreamingUserId}");
    return Task.CompletedTask;
};

client.StreamingViewerCountChanged += evt =>
{
    Console.WriteLine($"Số người xem hiện tại: {evt.ViewerCount}");
    return Task.CompletedTask;
};
```

## Tham chiếu `GenerateCDNSignature`

`GenerateCDNSignature` được phép gọi bởi cả bot và phiên `external` (`api_upload.go`). Với một `channel_id` mà người gọi là thành viên, `mezon-api` ký `/<16-hex-channel-id><unix_ts>` bằng HMAC-SHA256 dùng bí mật CDN và trả về `{ signature: "<ts>-<url_escaped_base64_mac>" }`.

- **Mục đích hiện tại:** Gắn `?<signature>` khi tải tệp đính kèm của kênh riêng tư qua CDN.
- **Lưu ý về HLS trực tiếp:** Các bản `mezon-streaming-server` cũ (trước `0.6.0`) từng dùng chữ ký này cho đường dẫn HLS. Từ cơ chế đẩy HLS lên storage (`0.8.0+`), luồng HLS trực tiếp không còn kiểm tra `GenerateCDNSignature`.

```ts
const res = await client.generateCDNSignature({ channel_id: "CHANNEL_ID" });
// res?.signature => "<unix_ts>-<url_encoded_hmac>"
```

## Liên quan

- [Phát luồng với WHIP](./publishing-with-whip.mdx)
- [Tham chiếu sự kiện](../../reference/events-reference.md)
- [Tổng quan Media](../overview.md)
