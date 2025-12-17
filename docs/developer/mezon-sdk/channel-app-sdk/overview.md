---
sidebar_position: 1
---

# Overview

The Mezon Channel App SDK enables developers to create web applications that seamlessly integrate with the Mezon platform. Channel apps are web applications that provide extended functionality within Mezon channels, authenticated securely through URL-based parameters.

**Why build channel apps for Mezon?**

Channel apps allow you to extend Mezon's capabilities with custom features, tools, and experiences directly within channels. Whether you're building productivity tools, games, dashboards, or interactive utilities, the Mezon platform provides a secure and straightforward way to reach users.

---

## How Channel Apps Work

### 1. User Opens Channel App

When a user clicks on your channel app within Mezon, the platform:
- Generates authentication data containing user information
- Signs the data with HMAC-SHA256 using your App Secret
- Appends the signed data as a URL parameter
- Opens your app in an iframe

### 2. App Extracts Authentication Data

Your channel app extracts the authentication data from the URL:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const authData = urlParams.get('data');
const decoded = decodeURIComponent(authData);
```

### 3. Backend Validates Hash

Your backend server validates the hash signature:

```javascript
// Cryptographic validation using your App Secret
const isValid = validateMezonHash(authData, APP_SECRET);
```

### 4. App Initializes

After successful validation, your app:
- Stores the authentication token
- Displays personalized content
- Enables user interactions
- Communicates with your backend services

---

## Authentication Flow

Channel apps use secure hash-based authentication with HMAC-SHA256 signatures. When a user opens your app, Mezon passes authentication data via URL parameters that your backend validates using your App Secret.

**Key concepts:**
- URL parameter contains signed user data
- Three-step cryptographic validation (MD5 → HMAC-SHA256 → HMAC-SHA256)
- Backend validation ensures authenticity and integrity
- No OAuth redirects needed

For complete implementation details, backend examples in multiple languages, and security best practices, see the **[Channel App Authentication Flow](./channel-app-auth-flow.mdx)** guide.

---

## Features Breakdown

### URL-Based Authentication

| Feature | Description |
|---------|-------------|
| **Query Parameters** | Authentication data passed via `?data=...` in URL |
| **URL Decoding** | Standard URLSearchParams API for extraction |
| **Base64 Encoding** | Data encoded for secure transmission to backend |
| **Clean URLs** | Remove sensitive data after processing |

### Security

| Feature | Description |
|---------|-------------|
| **HMAC-SHA256** | Industry-standard cryptographic signatures |
| **Backend Validation** | Never trust client-side validation alone |
| **App Secret** | Your secret key for hash verification |
| **Timestamp Validation** | Prevent replay attacks with `auth_date` |
| **HTTPS Required** | Secure transmission in production |

### State Management

| Feature | Description |
|---------|-------------|
| **Session Storage** | Temporary storage for current session |
| **Local Storage** | Persistent storage across sessions |
| **Token Storage** | Store authentication tokens securely |
| **User Data Cache** | Cache user information locally |

### Developer Experience

| Feature | Description |
|---------|-------------|
| **No SDK Required** | Use standard web technologies |
| **Any Backend** | Node.js, Python, Go, PHP - your choice |
| **Local Testing** | Test without Mezon during development |
| **TypeScript Support** | Type definitions available |
| **Comprehensive Docs** | Detailed guides and examples |

---

## Technology Stack

### Frontend

Your channel app can use any modern web technology:

- **Vanilla JavaScript/TypeScript** - No framework required
- **React, Vue, Angular** - Use your favorite framework
- **jQuery, Alpine.js** - Lightweight libraries work great
- **HTML5 Canvas** - Build games and visualizations
- **WebGL, Three.js** - Create 3D experiences

### Backend

Backend validation can be implemented in any language:

- **Node.js** (Express, Fastify, NestJS)
- **Python** (Flask, Django, FastAPI)
- **Go** (Gin, Echo)
- **PHP** (Laravel, Symfony)
- **Ruby** (Rails, Sinatra)
- **Java** (Spring Boot)
- **.NET** (ASP.NET Core)

### Hosting

Deploy your channel app to any web hosting platform:

- **Vercel, Netlify** - Quick deployment for static apps
- **AWS, Google Cloud, Azure** - Enterprise-grade hosting
- **Heroku, Railway** - Simple deployment for full-stack apps
- **DigitalOcean, Linode** - VPS for custom setups
- **Your own servers** - Complete control

---

## Use Cases

### Productivity Tools

- **Task Managers** - Collaborative to-do lists
- **Polls & Surveys** - Gather team feedback
- **Calendars** - Shared event scheduling
- **Note Taking** - Collaborative documentation

### Entertainment

- **Games** - Multiplayer games in channels
- **Music Players** - Shared listening experiences
- **Trivia** - Interactive quiz games
- **Drawing Boards** - Collaborative art

### Utilities

- **Calculators** - Scientific, financial calculators
- **Converters** - Unit conversion tools
- **Timers** - Countdown and stopwatch tools
- **QR Generators** - Create QR codes

### Data Visualization

- **Charts** - Display analytics and metrics
- **Dashboards** - Real-time data monitoring
- **Maps** - Location-based visualizations
- **Reports** - Generate and display reports

### Integration

- **API Clients** - Interface with external services
- **Webhooks** - Receive and process webhooks
- **Notifications** - Custom alert systems
- **Automation** - Workflow automation tools

---

## Getting Started

Ready to build your first channel app? Follow these steps:

1. **[Implement Authentication Flow](./channel-app-auth-flow.mdx)** - Set up secure backend validation
2. **[Explore Examples](./usage-and-examples.md)** - See real-world implementation patterns

---

## Requirements

### Minimum Requirements

- **Modern browser support** (ES6+, URLSearchParams, Web Storage)
- **HTTPS in production** (required for iframe communication)
- **Backend server** (for authentication validation)
- **Mezon App credentials** (App Secret from developer portal)

### Recommended

- **TypeScript** (for better type safety and IntelliSense)
- **Error monitoring** (Sentry, LogRocket, etc.)
- **Analytics** (Google Analytics, Mixpanel, etc.)
- **Testing framework** (Jest, Mocha, etc.)

---

## Support & Community

- **Documentation** - Comprehensive guides and API references
- **Examples** - Sample code and starter templates
- **Developer Portal** - Manage your apps and credentials
- **Community Forums** - Get help from other developers
- **GitHub Issues** - Report bugs and request features

---

## Next Steps

Start building your channel app today:

- 🔐 **[Authentication Flow](./channel-app-auth-flow.mdx)** - Secure implementation
- 💡 **[Usage Examples](./usage-and-examples.md)** - Real-world patterns

:::note Security

Channel apps must implement proper backend validation. Never rely solely on client-side authentication. See the [Authentication Flow](./channel-app-auth-flow.mdx) guide for detailed security implementation.

:::
