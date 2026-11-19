---
sidebar_position: 1
sidebar_label: Tổng quan
description: Gói mezon-sdk là gì, chạy ở đâu và bot kết nối với Mezon thế nào.
---

# SDK bot cho JavaScript và TypeScript

`mezon-sdk` là thư viện Node.js để viết bot Mezon. Chương trình của bạn đăng nhập bằng ID Bot và token, nhận các sự kiện như tin nhắn mới hay lượt nhấn nút, rồi gửi tin nhắn trả lời.

Các trang này mô tả **mezon-sdk 2.8.66**, phiên bản trên npm vào tháng 11 năm 2026.

## Bạn cần có

- Một bot đã tạo trên Developer Portal, với **ID Bot** và **Token**: xem [Tạo bot](../../quick-start/creating-mezon-bot.md).
- Node.js. SDK chỉ chạy trên Node.js, không chạy trong trình duyệt hay React Native: SDK mở kết nối TLS bằng `node:tls` và lưu tin nhắn bằng mô-đun native `better-sqlite3`.
- TypeScript không bắt buộc. Gói đã kèm định nghĩa kiểu.

## Bot kết nối thế nào

1. `login()` gửi ID Bot và token qua HTTPS và nhận một phiên (session).
2. SDK mở một kết nối TLS tới Mezon. Mọi lệnh gọi và sự kiện sau đó đi qua kết nối này.
3. SDK tham gia mọi clan mà bot thuộc về, tải các kênh tin nhắn trực tiếp của bot, rồi phát sự kiện `ready`.
4. Các hàm xử lý sự kiện của bạn chạy khi sự kiện đến: `onChannelMessage`, `onMessageButtonClicked` và các sự kiện khác.

SDK cũng tạo một tệp SQLite cục bộ, `./mezon-cache/mezon-messages-cache.db`, trong thư mục làm việc. Tệp này giữ các tin nhắn bot đã nhận, để `channel.messages.fetch(id)` tìm được chúng. Lần chạy đầu, SDK thêm `/mezon-cache` vào tệp `.gitignore` của thư mục làm việc.

## Bot có thể làm gì

- Đọc và trả lời tin nhắn trong các kênh bot nhìn thấy: trả lời, sửa, xóa, thêm biểu cảm.
- Gửi tin nhắn trực tiếp và tin nhắn ephemeral (chỉ những thành viên được chọn mới thấy).
- Gửi [tin nhắn tương tác](../../mezon-topics/interactive-message.mdx) và xử lý lượt nhấn nút cùng giá trị biểu mẫu.
- Tạo, xem và kết thúc bình chọn.
- Xem danh sách kênh, thành viên trong kênh thoại và vai trò; cập nhật vai trò.
- Xin quyền phát video vào [kênh phát trực tiếp](../../mezon-topics/streaming-channel.mdx).

:::note
Mezon chỉ cho bot dùng một danh sách API máy chủ cố định. Mọi lệnh gọi khác đều lỗi "Permission denied." (mã 403). Ví dụ, bot không thể lấy danh sách toàn bộ thành viên clan hay đọc lịch sử tin nhắn của kênh. Xem [Bot được phép làm gì](../bot-api-access.md).
:::

## Các trang trong mục này

- [Bắt đầu](./getting-started.md): cài SDK và chạy một bot trả lời `!ping`.
- [Khái niệm cốt lõi](./core-concepts.md): client, đăng nhập và phiên, bộ nhớ đệm, sự kiện và giới hạn.
- [Cách dùng và ví dụ](./usage-and-examples.md): các công thức ngắn cho việc thường gặp.
- [Tham chiếu API](./api-references.md): lớp, phương thức và sự kiện của phiên bản 2.8.66.

## Liên quan

- [`mezon-sdk` trên npm](https://www.npmjs.com/package/mezon-sdk)
- [Mã nguồn trên GitHub](https://github.com/mezonai/mezon-js/tree/master/packages/mezon-sdk)
- [SDK bot cho .NET](../dotnet-sdk.md)
