---
sidebar_position: 1
sidebar_label: Tổng quan
description: Ứng dụng trong kênh là gì, thành viên mở nó thế nào và Mezon truyền gì cho nó.
---

# Ứng dụng trong kênh

Ứng dụng trong kênh là trang web của bạn, hiện trong clan như một kênh. Thành viên mở nó từ Mezon. Khi thành viên khởi chạy ứng dụng, Mezon thêm dữ liệu có chữ ký về thành viên đó vào URL, nên máy chủ của bạn biết thành viên là ai mà không cần đăng nhập riêng.

Bạn không cần cài SDK nào: ứng dụng trong kênh là một trang web bình thường. Bạn chỉ cần **Token** của ứng dụng (lấy từ Developer Portal) trên máy chủ, để kiểm tra dữ liệu có chữ ký.

Trang này mô tả ứng dụng web Mezon, phiên bản 2.1.5. Cách ứng dụng máy tính và điện thoại mở ứng dụng trong kênh chưa được kiểm tra.

## Thành viên mở ứng dụng thế nào

Sau khi bạn [tạo ứng dụng và cài vào clan](../../quick-start/creating-mezon-app.md), ứng dụng hiện ra như một kênh trong danh sách kênh của clan.

| Thành viên mở bằng cách | Nội dung được tải | Dữ liệu thành viên có chữ ký |
|---|---|---|
| Chọn kênh của ứng dụng | URL của ứng dụng, ngay trong khung kênh | Không |
| Nhấn **Khởi chạy ứng dụng** dưới kênh của ứng dụng, hoặc chọn ứng dụng trong danh sách ứng dụng của clan | URL của ứng dụng trong một cửa sổ trình duyệt mới 900 × 700, có thêm `data`, `clanId` và `clanName` | Có, trong `data` |
| Nhấn một liên kết tới kênh của ứng dụng trong tin nhắn, có tham số `code` | URL của ứng dụng bên trong Mezon, có thêm `code` và một đường dẫn tùy chọn | Không |

## URL khởi chạy chứa gì

Khi thành viên nhấn **Khởi chạy ứng dụng**, Mezon mở:

```text
https://app.example.com/?data=WEB_APP_DATA&clanId=CLAN_ID&clanName=CLAN_NAME
```

| Tham số | Ý nghĩa |
|---|---|
| `data` | Dữ liệu thành viên có chữ ký (đã mã hóa URL). Xem [Kiểm tra ai đã mở ứng dụng](./channel-app-auth-flow.mdx). |
| `clanId` | ID của clan nơi ứng dụng được mở. |
| `clanName` | Tên clan, nếu có. |

`clanId` và `clanName` không có chữ ký. Chỉ tin những gì nằm trong `data`, sau khi máy chủ của bạn đã kiểm tra.

## Liên kết mở ứng dụng

Một liên kết trong tin nhắn có dạng sau sẽ mở kênh của ứng dụng:

```text
https://mezon.ai/chat/clans/CLAN_ID/channels/APP_CHANNEL_ID?code=CODE&subpath=/orders/42
```

Mezon tải URL của ứng dụng, thêm `/orders/42` vào đường dẫn và `?code=CODE` vào chuỗi truy vấn. Nếu không có `code`, liên kết chỉ mở kênh. Hãy dùng `code` để báo ứng dụng cần hiện gì; giá trị này không có chữ ký.

## Bạn cần xây dựng gì

1. Một trang web tại URL bạn đã đăng ký. Thành viên nhìn thấy trang này trong Mezon.
2. Một điểm cuối (endpoint) trên máy chủ nhận `data`, kiểm tra chữ ký bằng token của ứng dụng, rồi tạo phiên cho thành viên trong ứng dụng của bạn.

Cả hai bước có ở trang tiếp theo: [Kiểm tra ai đã mở ứng dụng](./channel-app-auth-flow.mdx).

## Liên quan

- [Tạo ứng dụng trong kênh](../../quick-start/creating-mezon-app.md)
- [Ví dụ ứng dụng trong kênh](./usage-and-examples.md)
