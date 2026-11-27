---
sidebar_position: 1
sidebar_label: Tổng quan
description: Channel App trên Mezon là gì, cách Web, Android và iOS khởi chạy ứng dụng và dữ liệu đã ký mà Mezon truyền vào.
---

# Tổng quan Channel App

Channel App là một ứng dụng web tiêu chuẩn được cài vào clan Mezon dưới dạng một kênh riêng (`CHANNEL_TYPE_APP = 8`). Khi thành viên khởi chạy ứng dụng từ **Web, Android hoặc iOS**, Mezon gọi `GenerateHashChannelApps` trên máy chủ và gắn dữ liệu định danh đã ký mật mã (`?data=...`) vào URL ứng dụng, cho phép đăng nhập một chạm mà không cần màn hình đăng nhập riêng.

Bạn không cần cài thêm SDK phía trình duyệt. Bạn chỉ cần lưu **Token** của ứng dụng từ [Cổng nhà phát triển Mezon](https://mezon.ai/developers/applications) trên máy chủ backend để xác minh chữ ký HMAC.

## Hỗ trợ trên các nền tảng

Cả ba nền tảng ứng dụng Mezon — **Web**, **Android** và **iOS** — đều gọi `GenerateHashChannelApps` và truyền `?data=<webAppData>` khi khởi chạy Channel App:

| Cách thành viên mở ứng dụng | Nội dung được tải | Tham số `data` đã ký |
|---|---|---|
| Bấm **Launch App** trong kênh ứng dụng hoặc trình khởi chạy ứng dụng của clan (Web, Android, iOS) | URL ứng dụng bạn đăng ký kèm `data`, `clanId` và `clanName` | **Có** (ký bởi `GenerateHashChannelApps`) |
| Chọn trực tiếp kênh ứng dụng (không bấm khởi chạy) | URL ứng dụng nhúng trong khung kênh | Không |
| Bấm liên kết sâu (deep link) trong tin nhắn có `?code=...` | URL ứng dụng kèm `subpath` tùy chọn và tham số `code` | Không (chưa ký) |

## Cấu trúc URL khởi chạy

Khi thành viên khởi chạy ứng dụng, Mezon mở:

```text
https://app.example.com/?data=WEB_APP_DATA&clanId=CLAN_ID&clanName=CLAN_NAME
```

| Tham số truy vấn | Đã ký? | Ý nghĩa |
|---|---|---|
| `data` | **Có** | Chuỗi query đã mã hóa URL gồm `query_id`, `user`, `auth_date`, `signature` và mã băm HMAC `hash`. Luôn xác minh trên backend trước khi tin cậy thông tin người dùng. |
| `clanId` | Không | Snowflake ID của clan nơi ứng dụng được mở. Chỉ coi là ngữ cảnh giao diện trừ khi tự đối chiếu lại. |
| `clanName` | Không | Tên hiển thị của clan (nếu có). Không dùng làm căn cứ phân quyền. |

:::warning Không bao giờ tin cậy các tham số URL chưa được ký
`clanId`, `clanName`, `code` và `subpath` không nằm trong phạm vi ký của `hash`. Luôn xác thực danh tính người dùng duy nhất từ đối tượng `user` bên trong `data` sau khi xác minh chữ ký thành công.
:::

## Liên kết sâu vào ứng dụng

Một liên kết trong tin nhắn theo mẫu sau sẽ mở thẳng ứng dụng kênh tới một đường dẫn con cụ thể:

```text
https://mezon.ai/chat/clans/CLAN_ID/channels/APP_CHANNEL_ID?code=CODE&subpath=/orders/42
```

Mezon nối `/orders/42` vào sau URL gốc của ứng dụng và gắn `?code=CODE`. Nếu không có `code`, liên kết chỉ mở kênh ứng dụng. Hãy coi `code` như gợi ý điều hướng chưa được ký.

## Cầu nối `mezon-web-js` cũ

Các ví dụ cũ từng nhắc tới cầu nối JavaScript `window.Mezon.WebView` (`mezon-web-js`). Cầu nối này là **thành phần kế thừa và hiện không còn được đấu nối trên các client Mezon**. Đừng phụ thuộc vào `window.Mezon.WebView` để xác thực hay giao tiếp; thay vào đó hãy đọc `?data=` từ `location.search` và xác minh trên backend của bạn.

## Những gì bạn cần xây dựng

1. **Một giao diện web** đặt tại URL HTTPS đã khai báo trên cổng nhà phát triển.
2. **Một endpoint đăng nhập trên backend** nhận chuỗi `data` nguyên bản, kiểm tra chữ ký HMAC-SHA256 bằng token ứng dụng, kiểm tra độ mới của `auth_date`, rồi cấp cookie hoặc JWT phiên của riêng ứng dụng bạn.

Tiếp tục sang [Xác minh dữ liệu khởi chạy](./verifying-launch-data.mdx) để xem đặc tả mật mã chính xác cùng mã kiểm tra bằng Node.js, Python, Go và C#.

## Liên quan

- [Tạo Channel App](../../getting-started/create-a-channel-app.md)
- [Xác minh dữ liệu khởi chạy](./verifying-launch-data.mdx)
- [Hướng dẫn với Express](./tutorial-express.md)
- [Mezon Light SDK](../light-sdk.md)
