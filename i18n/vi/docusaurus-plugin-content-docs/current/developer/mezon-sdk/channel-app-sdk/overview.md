---
sidebar_position: 1
---

# Tổng quan

Mezon Channel App SDK cho phép nhà phát triển tạo các ứng dụng web tích hợp liền mạch với nền tảng Mezon. Channel app là các ứng dụng web cung cấp chức năng mở rộng bên trong các kênh Mezon, được xác thực an toàn thông qua các tham số trên URL.

**Vì sao nên xây dựng channel app cho Mezon?**

Channel app cho phép bạn mở rộng khả năng của Mezon với các tính năng, công cụ và trải nghiệm tùy chỉnh ngay bên trong các kênh. Dù bạn xây dựng công cụ năng suất, trò chơi, bảng điều khiển hay tiện ích tương tác, nền tảng Mezon đều cung cấp một cách an toàn và đơn giản để tiếp cận người dùng.

---

## Channel App hoạt động như thế nào

### 1. Người dùng mở Channel App

Khi người dùng nhấp vào channel app của bạn trong Mezon, nền tảng sẽ:
- Tạo dữ liệu xác thực chứa thông tin người dùng
- Ký dữ liệu bằng HMAC-SHA256 với App Secret của bạn
- Đính kèm dữ liệu đã ký dưới dạng tham số URL
- Mở app của bạn trong một iframe

### 2. App trích xuất dữ liệu xác thực

Channel app của bạn trích xuất dữ liệu xác thực từ URL:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const authData = urlParams.get('data');
const decoded = decodeURIComponent(authData);
```

### 3. Backend kiểm tra hash

Máy chủ backend của bạn kiểm tra chữ ký hash:

```javascript
// Kiểm tra bằng mật mã dùng App Secret của bạn
const isValid = validateMezonHash(authData, APP_SECRET);
```

### 4. App khởi tạo

Sau khi kiểm tra thành công, app của bạn:
- Lưu token xác thực
- Hiển thị nội dung cá nhân hóa
- Cho phép người dùng tương tác
- Giao tiếp với các dịch vụ backend của bạn

---

## Luồng xác thực

Channel app sử dụng cơ chế xác thực dựa trên hash an toàn với chữ ký HMAC-SHA256. Khi người dùng mở app, Mezon truyền dữ liệu xác thực qua tham số URL để backend của bạn kiểm tra bằng App Secret.

**Khái niệm chính:**
- Tham số URL chứa dữ liệu người dùng đã được ký
- Kiểm tra mật mã ba bước (MD5 → HMAC-SHA256 → HMAC-SHA256)
- Việc kiểm tra ở backend đảm bảo tính xác thực và toàn vẹn
- Không cần chuyển hướng OAuth

Để xem chi tiết triển khai đầy đủ, ví dụ backend bằng nhiều ngôn ngữ và các thực hành bảo mật tốt nhất, hãy xem hướng dẫn **[Luồng xác thực Channel App](./channel-app-auth-flow)**.

---

## Chi tiết tính năng

### Xác thực dựa trên URL

| Tính năng | Mô tả |
|---------|-------------|
| **Query Parameters** | Dữ liệu xác thực được truyền qua `?data=...` trên URL |
| **URL Decoding** | Dùng API URLSearchParams chuẩn để trích xuất |
| **Base64 Encoding** | Dữ liệu được mã hóa để truyền an toàn tới backend |
| **Clean URLs** | Xóa dữ liệu nhạy cảm sau khi xử lý |

### Bảo mật

| Tính năng | Mô tả |
|---------|-------------|
| **HMAC-SHA256** | Chữ ký mật mã theo tiêu chuẩn ngành |
| **Backend Validation** | Không bao giờ chỉ tin vào kiểm tra phía client |
| **App Secret** | Khóa bí mật của bạn để xác minh hash |
| **Timestamp Validation** | Ngăn tấn công phát lại (replay) bằng `auth_date` |
| **HTTPS Required** | Truyền tải an toàn trong môi trường production |

### Quản lý trạng thái

| Tính năng | Mô tả |
|---------|-------------|
| **Session Storage** | Lưu trữ tạm thời cho phiên hiện tại |
| **Local Storage** | Lưu trữ bền vững qua nhiều phiên |
| **Token Storage** | Lưu token xác thực một cách an toàn |
| **User Data Cache** | Cache thông tin người dùng cục bộ |

### Trải nghiệm nhà phát triển

| Tính năng | Mô tả |
|---------|-------------|
| **No SDK Required** | Dùng các công nghệ web tiêu chuẩn |
| **Any Backend** | Node.js, Python, Go, PHP - tùy bạn chọn |
| **Local Testing** | Kiểm thử mà không cần Mezon trong lúc phát triển |
| **TypeScript Support** | Có sẵn các định nghĩa kiểu |
| **Comprehensive Docs** | Hướng dẫn và ví dụ chi tiết |

---

## Ngăn xếp công nghệ

### Frontend

Channel app của bạn có thể dùng bất kỳ công nghệ web hiện đại nào:

- **Vanilla JavaScript/TypeScript** - Không cần framework
- **React, Vue, Angular** - Dùng framework yêu thích của bạn
- **jQuery, Alpine.js** - Các thư viện gọn nhẹ hoạt động rất tốt
- **HTML5 Canvas** - Xây dựng trò chơi và đồ họa
- **WebGL, Three.js** - Tạo trải nghiệm 3D

### Backend

Việc kiểm tra ở backend có thể được triển khai bằng bất kỳ ngôn ngữ nào:

- **Node.js** (Express, Fastify, NestJS)
- **Python** (Flask, Django, FastAPI)
- **Go** (Gin, Echo)
- **PHP** (Laravel, Symfony)
- **Ruby** (Rails, Sinatra)
- **Java** (Spring Boot)
- **.NET** (ASP.NET Core)

### Lưu trữ (Hosting)

Triển khai channel app của bạn lên bất kỳ nền tảng hosting nào:

- **Vercel, Netlify** - Triển khai nhanh cho app tĩnh
- **AWS, Google Cloud, Azure** - Hosting cấp doanh nghiệp
- **Heroku, Railway** - Triển khai đơn giản cho app full-stack
- **DigitalOcean, Linode** - VPS cho các thiết lập tùy chỉnh
- **Máy chủ của riêng bạn** - Toàn quyền kiểm soát

---

## Các trường hợp sử dụng

### Công cụ năng suất

- **Trình quản lý công việc** - Danh sách việc cần làm cộng tác
- **Bình chọn & Khảo sát** - Thu thập phản hồi của nhóm
- **Lịch** - Lên lịch sự kiện chung
- **Ghi chú** - Tài liệu cộng tác

### Giải trí

- **Trò chơi** - Trò chơi nhiều người trong kênh
- **Trình phát nhạc** - Trải nghiệm nghe chung
- **Trivia** - Trò chơi đố vui tương tác
- **Bảng vẽ** - Sáng tạo nghệ thuật cộng tác

### Tiện ích

- **Máy tính** - Máy tính khoa học, tài chính
- **Bộ chuyển đổi** - Công cụ chuyển đổi đơn vị
- **Bộ đếm giờ** - Công cụ đếm ngược và bấm giờ
- **Trình tạo QR** - Tạo mã QR

### Trực quan hóa dữ liệu

- **Biểu đồ** - Hiển thị phân tích và số liệu
- **Bảng điều khiển** - Giám sát dữ liệu thời gian thực
- **Bản đồ** - Trực quan hóa theo vị trí
- **Báo cáo** - Tạo và hiển thị báo cáo

### Tích hợp

- **API Client** - Giao tiếp với các dịch vụ bên ngoài
- **Webhook** - Nhận và xử lý webhook
- **Thông báo** - Hệ thống cảnh báo tùy chỉnh
- **Tự động hóa** - Công cụ tự động hóa luồng công việc

---

## Bắt đầu

Sẵn sàng xây dựng channel app đầu tiên của bạn? Hãy làm theo các bước sau:

1. **[Triển khai luồng xác thực](./channel-app-auth-flow)** - Thiết lập kiểm tra an toàn ở backend
2. **[Khám phá ví dụ](./usage-and-examples)** - Xem các mẫu triển khai thực tế

---

## Yêu cầu

### Yêu cầu tối thiểu

- **Hỗ trợ trình duyệt hiện đại** (ES6+, URLSearchParams, Web Storage)
- **HTTPS trong production** (bắt buộc để giao tiếp iframe)
- **Máy chủ backend** (để kiểm tra xác thực)
- **Thông tin App Mezon** (App Secret từ cổng nhà phát triển)

### Khuyến nghị

- **TypeScript** (để an toàn kiểu dữ liệu và gợi ý mã tốt hơn)
- **Giám sát lỗi** (Sentry, LogRocket, v.v.)
- **Phân tích** (Google Analytics, Mixpanel, v.v.)
- **Framework kiểm thử** (Jest, Mocha, v.v.)

---

## Hỗ trợ & Cộng đồng

- **Tài liệu** - Hướng dẫn toàn diện và tài liệu API
- **Ví dụ** - Mã mẫu và mẫu khởi đầu
- **Cổng nhà phát triển** - Quản lý app và thông tin xác thực của bạn
- **Diễn đàn cộng đồng** - Nhận trợ giúp từ các nhà phát triển khác
- **GitHub Issues** - Báo lỗi và đề xuất tính năng

---

## Bước tiếp theo

Bắt đầu xây dựng channel app của bạn ngay hôm nay:

- 🔐 **[Luồng xác thực](./channel-app-auth-flow)** - Triển khai an toàn
- 💡 **[Ví dụ sử dụng](./usage-and-examples)** - Các mẫu thực tế

:::note Bảo mật

Channel app phải triển khai kiểm tra phù hợp ở backend. Không bao giờ chỉ dựa vào xác thực phía client. Xem hướng dẫn [Luồng xác thực](./channel-app-auth-flow) để biết chi tiết triển khai bảo mật.

:::
