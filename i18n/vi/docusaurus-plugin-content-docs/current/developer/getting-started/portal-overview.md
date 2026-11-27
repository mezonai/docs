---
sidebar_label: Tổng quan Portal
sidebar_position: 1
description: Tìm hiểu Mezon Developer Portal, những gì bạn có thể xây dựng trên Mezon và cách bot, ứng dụng trong kênh, webhook và OAuth2 phối hợp với nhau.
---

# Tổng quan Developer Portal

[Mezon Developer Portal](https://mezon.ai/developers/applications) là bảng điều khiển trung tâm để đăng ký danh tính trên Mezon, cấp phát khóa bí mật, cấu hình OAuth2 redirect URI và tạo liên kết cài đặt vào clan.

## Bạn có thể xây dựng gì trên Mezon

Hãy chọn cơ chế tích hợp gọn nhất đáp ứng đúng nhu cầu của bạn:

| Mục tiêu | Cơ chế | Thông tin xác thực cần có | Cần tiến trình chạy liên tục? |
| --- | --- | --- | --- |
| Phản hồi tin nhắn, chạy lệnh, gửi thẻ tương tác/bình chọn, quản lý vai trò, chuyển Mezon Đồng | [Bot](./create-a-bot.md) | ID Bot (Snowflake 64-bit) + Token Bot 16 ký tự | Có (kết nối TLS TCP dài hạn) |
| Nhúng ứng dụng web ngay bên trong kênh clan kèm danh tính người dùng Mezon đã xác thực | [Ứng dụng trong kênh](./create-a-channel-app.md) | App ID + App Token 16 ký tự (để xác minh HMAC) | Chỉ cần máy chủ web thông thường |
| Đẩy thông báo tự động từ CI/CD, hệ thống giám sát hoặc script máy chủ vào Mezon | [Webhook](../webhooks/overview.mdx) | URL Webhook kênh hoặc Webhook clan (tạo trong ứng dụng Mezon) | Không (một yêu cầu HTTPS `POST`) |
| Cho phép người dùng đăng nhập vào website bên ngoài bằng tài khoản Mezon | [OAuth2](../oauth2/authorization-code-flow.mdx) | OAuth2 Client ID, Client Secret, Redirect URI | Chỉ cần backend web của bạn |
| Tham gia phòng thoại trực tiếp hoặc phát luồng video trực tiếp | [Thoại SFU & phát trực tiếp](../media-voice-and-streaming/overview.md) | Phiên bot (để xin token phòng họp / quyền phát trực tiếp) | Có (tiến trình phát/nhận media) |

## Cấu trúc một mục trên Developer Portal

Khi tạo mục mới tại [mezon.ai/developers/applications](https://mezon.ai/developers/applications), bạn chọn một trong hai loại:

1. **Bot (`Tạo bot`)** — Tạo tài khoản bot Mezon độc lập với **ID Bot** Snowflake 64-bit và **Token** 16 ký tự. Có tùy chọn chế độ **Bot Ẩn** (`is_shadow: true`) cho mục đích theo dõi gắn với người tạo (xem [Xác thực & vòng đời phiên](../core-concepts/authentication-and-sessions.md#shadow-bots)).
2. **Ứng dụng (`Tạo ứng dụng`)** — Đăng ký một **Ứng dụng trong kênh** gồm **App ID**, **Token** và **URL** đích. Khi cài đặt vào clan, Mezon tạo một kênh ứng dụng chuyên biệt.

Mỗi mục trong Portal gồm các thẻ quản lý chính:

- **Thông tin chung**: Xem ID Ứng dụng/Bot, sửa tên/ảnh đại diện/mô tả, sao chép token khi vừa tạo hoặc nhấn **Đặt lại Token** để xoay vòng khóa nếu bị mất hoặc lộ.
- **Cài đặt**: Sao chép **Liên kết Cài đặt** (`Add to clan`) để cấp quyền đưa bot hoặc cài ứng dụng vào bất kỳ clan nào mà người cài có đủ quyền.
- **OAuth2** (đối với ứng dụng): Cấu hình redirect URI và thông tin xác thực cho tính năng "Đăng nhập bằng Mezon".

## Nguyên tắc bảo mật cốt lõi

:::warning Bảo vệ token cẩn thận
Developer Portal chỉ hiển thị token 16 ký tự **duy nhất một lần** khi tạo. Tuyệt đối không đưa token vào mã nguồn Git, gói JavaScript phía trình duyệt hay tin nhắn chat. Hãy nạp token từ biến môi trường hoặc trình quản lý bí mật (ví dụ `MEZON_BOT_ID` và `MEZON_BOT_TOKEN`), và nhấn **Đặt lại Token** ngay lập tức nếu nghi ngờ rò rỉ.
:::

- **Phạm vi cài đặt**: Bot chỉ có thể quan sát và hoạt động trong các clan đã được thành viên có quyền **Quản lý Clan** cài đặt. Với kênh riêng tư, cần thêm bot vào kênh đó.
- **Quyền cài ứng dụng trong kênh**: Cài ứng dụng sẽ tạo một kênh mới trong clan nên yêu cầu quyền **Quản lý kênh**.
- **Ranh giới API phía máy chủ**: Token bot chỉ được gọi một danh sách RPC cố định do cả `mezon-proto-server` và `mezon-api` kiểm soát. Xem [Phân quyền & danh sách API cho bot](../core-concepts/permissions-and-api-access.md).

## Bước tiếp theo

- [Tạo bot](./create-a-bot.md) — đăng ký tài khoản bot và thêm vào clan thử nghiệm.
- [Tạo ứng dụng trong kênh](./create-a-channel-app.md) — đăng ký và cài đặt ứng dụng web trong kênh.
- [Ma trận hệ sinh thái SDK](./sdk-ecosystem-matrix.md) — chọn SDK chính thức phù hợp với ngôn ngữ của bạn.
