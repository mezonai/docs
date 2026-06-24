---
sidebar_position: 1
---

# Tổng quan

`mezon-sdk` là một SDK TypeScript mạnh mẽ, cung cấp giao diện phía client vững chắc để tương tác với nền tảng Mezon, cho phép giao tiếp thời gian thực và quản lý dữ liệu hiệu quả cho các ứng dụng và bot.

**Vì sao chọn `mezon-sdk`?**

Dự án này đơn giản hóa việc phát triển ứng dụng và bot Mezon bằng cách cung cấp một thư viện TypeScript toàn diện và có cấu trúc tốt. Các tính năng cốt lõi bao gồm:

- **🟢 Giao tiếp thời gian thực:** Tận dụng WebSocket để giao tiếp hai chiều, tức thì với máy chủ Mezon, đảm bảo độ trễ thấp.
- **🔵 API toàn diện:** Cung cấp đầy đủ phương thức để tương tác với mọi khía cạnh của dịch vụ Mezon, bao gồm xác thực, quản lý kênh và xử lý tin nhắn.
- **🟡 An toàn kiểu dữ liệu:** Được xây dựng bằng TypeScript với kiểm tra kiểu nghiêm ngặt, giảm thiểu lỗi lúc chạy và cải thiện khả năng bảo trì mã.
- **🔴 Xử lý tin nhắn hiệu quả:** Sử dụng hàng đợi bất đồng bộ và cơ chế cache để tối ưu hiệu năng, ngay cả khi lượng tin nhắn lớn.
- **🟣 Thiết kế mô-đun:** Kiến trúc có cấu trúc rõ ràng và mô-đun, với các manager riêng cho phiên, socket, kênh và sự kiện, giúp dễ mở rộng, bảo trì và tích hợp vào các dự án hiện có.
- **🟠 Xử lý lỗi vững chắc:** Bao gồm cơ chế xử lý lỗi toàn diện xuyên suốt mã nguồn, đảm bảo ứng dụng ổn định và trải nghiệm người dùng tốt hơn.
- **⚙️ Lưu trữ dữ liệu:** Tích hợp với SQLite để lưu trữ tin nhắn cục bộ, cho phép truy cập ngoại tuyến và cải thiện hiệu năng.

---

## Tính năng

|      | Thành phần         | Chi tiết                                                                                                                                                                                                                                                                               |
| :--- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ⚙️    | **Kiến trúc**  | <ul><li>Mô-đun, với các thành phần như `MezonClient`, `SessionManager`, `SocketManager`, `ChannelManager`, `EventManager`.</li><li>Hướng sự kiện để cập nhật thời gian thực.</li><li>Dùng API client cho yêu cầu HTTP và WebSocket adapter cho giao tiếp thời gian thực.</li></ul> |
| 🔩    | **Chất lượng mã**  | <ul><li>Dùng TypeScript để an toàn kiểu dữ liệu.</li><li>Dùng ESLint và Prettier để kiểm tra và định dạng mã.</li><li>Jest và Jest-Cucumber để kiểm thử.</li></ul>                                                                                                                        |
| 📄    | **Tài liệu** | <ul><li>Toàn diện (chính là tài liệu này).</li><li>Định nghĩa Protocol Buffer được sinh tự động cho API và tin nhắn thời gian thực.</li></ul>                                                                                                                                        |
| 🔌    | **Tích hợp**  | <ul><li>Dùng `ws` cho giao tiếp WebSocket.</li><li>`better-sqlite3` để tương tác với cơ sở dữ liệu SQLite cục bộ (ví dụ `MessageDatabase.ts`).</li><li>Protocol Buffers để tuần tự hóa dữ liệu hiệu quả (`realtime.ts`, `struct.ts`).</li><li>Base64 để mã hóa dữ liệu.</li></ul>       |
| 🧩    | **Tính mô-đun**    | <ul><li>Tổ chức thành các manager, structure, lớp API và hàm tiện ích.</li><li>Phân tách rõ trách nhiệm (ví dụ: tương tác API, quản lý socket, cấu trúc dữ liệu).</li></ul>                                                                                           |
| 🧪    | **Kiểm thử**       | <ul><li>Dùng Jest và Jest-Cucumber.</li><li>Cấu hình trong `jest.config.js`.</li></ul>                                                                                                                                                                                             |
| ⚡️    | **Hiệu năng**   | <ul><li>`AsyncThrottleQueue` để giới hạn tốc độ và quản lý tác vụ bất đồng bộ.</li><li>`CacheManager` để truy xuất dữ liệu hiệu quả.</li><li>SQLite để truy cập dữ liệu cục bộ tối ưu.</li></ul>                                                                                        |
| 🛡️    | **Bảo mật**      | <ul><li>Quản lý phiên bằng JWT (`session.ts`).</li><li>Mặc định dùng HTTPS và WSS.</li><li>Mã hóa Base64 cho một số phép biến đổi dữ liệu.</li></ul>                                                                                                                            |
| 📦    | **Phụ thuộc**  | <ul><li>Cốt lõi: `ws`, `better-sqlite3`, `js-base64`.</li><li>Phát triển: TypeScript, ESLint, Prettier, Jest, Nodemon, ts-node.</li></ul>                                                                                                                                               |
| 🚀    | **Khả năng mở rộng**   | <ul><li>Khả năng mở rộng phía client nhờ quản lý dữ liệu hiệu quả và các thao tác bất đồng bộ.</li><li>Khả năng mở rộng phía máy chủ phụ thuộc vào kiến trúc nền tảng Mezon. SQLite chỉ dùng để cache cục bộ phía client, không phải lưu trữ chính phía máy chủ.</li></ul>                          |

**Lưu ý:** Bảng này dựa trên thông tin từ cấu trúc dự án và tóm tắt các tệp.

---

## Cấu trúc dự án

```sh
└── mezon-sdk/
    ├── jest.config.js
    ├── nodemon.json
    ├── package.json
    ├── README.md
    ├── src
    │   ├── api
    │   │   └── api.ts
    │   ├── api.ts
    │   ├── client.ts
    │   ├── constants
    │   │   ├── enum.ts
    │   │   └── index.ts
    │   ├── google
    │   │   └── protobuf
    │   │       ├── struct.ts
    │   │       ├── timestamp.ts
    │   │       └── wrappers.ts
    │   ├── index.ts
    │   ├── interfaces
    │   │   ├── api.ts
    │   │   ├── client.ts
    │   │   ├── index.ts
    │   │   └── socket.ts
    │   ├── message-socket-events
    │   │   ├── base_event.ts
    │   │   ├── index.ts
    │   │   ├── user_channel_added.ts
    │   │   └── user_channel_updated.ts
    │   ├── mezon-client
    │   │   ├── client
    │   │   │   └── MezonClient.ts
    │   │   ├── manager
    │   │   │   ├── channel_manager.ts
    │   │   │   ├── event_manager.ts
    │   │   │   ├── session_manager.ts
    │   │   │   └── socket_manager.ts
    │   │   ├── structures
    │   │   │   ├── Clan.ts
    │   │   │   ├── Message.ts
    │   │   │   ├── TextChannel.ts
    │   │   │   └── User.ts
    │   │   └── utils
    │   │       ├── AsyncThrottleQueue.ts
    │   │       ├── CacheManager.ts
    │   │       └── Collection.ts
    │   ├── rtapi
    │   │   └── realtime.ts
    │   ├── session.ts
    │   ├── socket.ts
    │   ├── sqlite
    │   │   └── MessageDatabase.ts
    │   ├── utils
    │   │   ├── format_message_input.ts
    │   │   ├── generate_reply_message.ts
    │   │   ├── helper.ts
    │   │   └── stack.ts
    │   ├── utils.ts
    │   ├── web_socket_adapter.ts
    │   └── web_socket_adapter_pb.ts
    ├── tsconfig.esm.json
    └── tsconfig.json
```
