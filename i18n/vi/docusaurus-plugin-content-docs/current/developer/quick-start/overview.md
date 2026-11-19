---
sidebar_label: Bạn có thể xây dựng gì
sidebar_position: 1
description: Các cách xây dựng trên Mezon (bot, ứng dụng trong kênh, webhook và OAuth2) và mỗi cách làm được gì.
---

# Bạn có thể xây dựng gì trên Mezon

Có bốn cách để xây dựng trên Mezon. Trang này cho biết mỗi cách làm được gì và bắt đầu từ đâu.

| Bạn muốn | Dùng | Cần có |
|---|---|---|
| Trả lời tin nhắn, chạy lệnh, gửi biểu mẫu và nút bấm | [Bot](#bots) | Một bot trên Developer Portal và một chương trình chạy liên tục |
| Hiển thị trang web của bạn trong clan, biết sẵn người dùng Mezon là ai | [Ứng dụng trong kênh](#channel-apps) | Một ứng dụng trên Developer Portal và một trang web |
| Đăng tin nhắn từ hệ thống khác (CI, giám sát, biểu mẫu) | [Webhook](#webhooks) | URL webhook của một kênh hoặc clan, và một yêu cầu HTTP |
| Cho phép người dùng đăng nhập vào trang web của bạn bằng Mezon | [OAuth2](#oauth2) | Một ứng dụng trên Developer Portal có redirect URI |

## Bot {#bots}

Bot là một tài khoản Mezon riêng do chương trình của bạn điều khiển. Bạn tạo bot trên Developer Portal và nhận **ID Bot** cùng **Token**. Chương trình đăng nhập bằng cả hai giá trị này và giữ kết nối.

Bot có thể:

- Đọc tin nhắn trong các kênh bot nhìn thấy, rồi trả lời, sửa, xóa và thêm biểu cảm.
- Gửi tin nhắn trực tiếp, và tin nhắn ephemeral (chỉ những thành viên được chọn mới thấy).
- Gửi [tin nhắn tương tác](../mezon-topics/interactive-message.mdx) có nút bấm, ô nhập và danh sách chọn, rồi xử lý lượt nhấn.
- Tạo bình chọn, xem danh sách kênh, thành viên trong kênh thoại và vai trò, và cập nhật vai trò.
- Phát video vào [kênh phát trực tiếp](../mezon-topics/streaming-channel.mdx).

Bot chỉ hoạt động trong các clan đã thêm nó. Người có quyền **Quản lý Clan** thêm bot bằng liên kết cài đặt của bot. Bot chỉ được gọi một số API máy chủ: xem [Bot được phép làm gì](../mezon-sdk/bot-api-access.md).

Có hai SDK:

- [`mezon-sdk`](../mezon-sdk/integration-bot-sdk/overview.md) cho JavaScript và TypeScript trên Node.js.
- [`Mezon.Net.Sdk`](../mezon-sdk/dotnet-sdk.md) cho C# và các ngôn ngữ .NET khác.

Bắt đầu với [Tạo bot](./creating-mezon-bot.md).

## Ứng dụng trong kênh {#channel-apps}

Ứng dụng trong kênh là trang web của bạn, được mở từ một kênh của clan. Khi thành viên khởi chạy ứng dụng, Mezon thêm dữ liệu có chữ ký về thành viên đó vào URL trang web. Máy chủ của bạn kiểm tra chữ ký và biết thành viên là ai, không cần đăng nhập riêng.

Bạn không cần SDK: ứng dụng trong kênh là một trang web bình thường. Người có quyền **Quản lý kênh** cài đặt ứng dụng, và ứng dụng hiện ra như một kênh trong clan.

Bắt đầu với [Tạo ứng dụng trong kênh](./creating-mezon-app.md), sau đó đọc [Tổng quan về ứng dụng trong kênh](../mezon-sdk/channel-app-sdk/overview.md).

## Webhook {#webhooks}

Webhook là một URL đăng tin lên Mezon. Chương trình của bạn gửi một yêu cầu HTTP `POST` có nội dung JSON, không cần đăng nhập. Webhook chỉ gửi tin nhắn vào Mezon; nó không báo cho chương trình của bạn về sự kiện trong Mezon.

- [Webhook kênh](../webhooks/channel-webhook.mdx) đăng tin nhắn vào một kênh.
- [Webhook clan](../webhooks/clan-webhook.mdx) gửi tin nhắn đến một thành viên của clan, dưới dạng thông báo trong hộp thư.

## OAuth2 {#oauth2}

[OAuth2](../mezon-topics/oauth2.mdx) cho phép người dùng đăng nhập vào trang web của bạn bằng tài khoản Mezon. Bạn nhận được ID người dùng Mezon, tên người dùng, tên hiển thị và ảnh đại diện của họ.

## Liên quan

- [Mezon Developer Portal](https://mezon.ai/developers/applications)
- [`mezon-sdk` trên npm](https://www.npmjs.com/package/mezon-sdk)
- [`Mezon.Net.Sdk` trên NuGet](https://www.nuget.org/packages/Mezon.Net.Sdk)
