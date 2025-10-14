---
sidebar_position: 1
---

# Overview

`mezon-web-sdk` is a lightweight TypeScript library designed to facilitate seamless communication between web applications (running inside iframe channels) and the host Mezon application. It provides a simple and secure event-driven interface using the browser's `postMessage` API for cross-origin communication.

**Why `mezon-web-sdk`?**

This SDK abstracts the complexities of cross-origin iframe communication within Mezon channels, allowing developers to focus on building engaging channel applications. The core features include:

- **🟢 Event-Driven Communication:** Easily send and receive events between your channel app and the Mezon client using a secure postMessage interface.
- **🔵 Secure by Design:** Communication is restricted to trusted Mezon origins, preventing unauthorized interactions and ensuring application security.
- **🟡 Dynamic Integration:** The host Mezon application can dynamically pass parameters, change themes, and inject custom CSS into your channel app at runtime.
- **🔴 State Persistence:** Initialization parameters are automatically persisted in `sessionStorage` to maintain state across page reloads and navigation.
- **🟣 Cross-Platform Compatibility:** Works seamlessly across all modern browsers and platforms where Mezon is supported.
- **🟠 Lightweight & Fast:** Minimal footprint with no external dependencies, ensuring quick loading and optimal performance.
- **⚙️ TypeScript Support:** Built with TypeScript for full type safety and enhanced developer experience with IntelliSense support.

---

## Features

|      | Component                  | Details                                                                                                                                                                                                                           |
| :--- | :------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ⚙️    | **Architecture**           | <ul><li>A singleton `MezonWebView` class that acts as the central point of interaction.</li><li>Event-driven architecture for handling communication between the iframe and the parent window.</li><li>Secure by design, communicating only with trusted target origins.</li></ul> |
| 🔩    | **Core Functionality**     | <ul><li>Handles the `postMessage` API for cross-origin communication.</li><li>Parses initialization parameters from the URL hash.</li><li>Persists `initParams` in `sessionStorage` for stateful reloads.</li></ul>        |
| 🔌    | **Event System**           | <ul><li>Provides `onEvent` and `offEvent` methods for subscribing to events sent from the Mezon application.</li><li>Provides a `postEvent` method to send events to the Mezon application.</li><li>Supports predefined events for lifecycle (`IframeReady`) and theming (`ThemeChanged`).</li></ul> |
| 🎨    | **Dynamic Styling**        | <ul><li>Allows the host Mezon application to inject arbitrary CSS into the channel app's context via the `SetCustomStyle` event.</li><li>Provides utility functions for managing CSS variables and properties.</li></ul> |
| 🧩    | **Utilities**              | <ul><li>Includes helper functions for parsing URL hash and query parameters.</li><li>Provides safe wrappers for `sessionStorage` access with prefixed keys.</li><li>Built-in iframe detection and validation.</li></ul>                                                                                |
| 🛡️    | **Security**               | <ul><li>Origin validation for all incoming messages.</li><li>Trusted target enforcement for sensitive operations.</li><li>Safe parameter parsing and validation.</li></ul>                                                                                                                                  |
| 📦    | **Dependencies**           | <ul><li>Zero external dependencies - pure TypeScript/JavaScript implementation.</li><li>Compatible with all modern browsers supporting `postMessage` API.</li></ul>                                                                                                                                        |
| 🚀    | **Performance**            | <ul><li>Lightweight bundle with minimal overhead.</li><li>Efficient event handling with automatic cleanup.</li><li>Optimized for iframe environments and quick initialization.</li></ul>                                                                                                                   |

---

## Project Structure

```sh
└── mezon-web-js/
    ├── package.json
    ├── README.md
    ├── tsconfig.json
    ├── webpack.config.js
    ├── src/
    │   ├── index.ts
    │   └── webview/
    │       ├── constant.ts
    │       ├── index.ts
    │       ├── types.ts
    │       ├── utils.ts
    │       └── webview.ts
    ├── example/
    │   ├── index.html
    │   ├── main.js
    │   ├── counter.js
    │   ├── style.css
    │   └── public/
    │       └── mezon-sdk.js
    └── build/
        ├── mezon-web-sdk.js
        └── mezon-web-sdk.d.ts
```