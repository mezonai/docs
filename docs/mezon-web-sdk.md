<div id="top">

<!-- HEADER STYLE: BANNER -->
<div align="center">
<img src="https://mezon.ai/assets/preview.png" alt="Mezon">

<!-- BADGES -->
<!-- local repository, no metadata badges. -->

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/JSON-000000.svg?style=plastic&logo=JSON&logoColor=white" alt="JSON">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=plastic&logo=JavaScript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=plastic&logo=TypeScript&logoColor=white" alt="TypeScript">

</div>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Core Concepts](#core-concepts)
  - [MezonWebView](#mezonwebview)
  - [Initialization \& Parameters](#initialization--parameters)
  - [Iframe Communication (postMessage)](#iframe-communication-postmessage)
  - [Events](#events)
- [Usage / API Examples](#usage--api-examples)
  - [Initializing the SDK](#initializing-the-sdk)
  - [Sending Events to the Mezon App](#sending-events-to-the-mezon-app)
  - [Handling Events from the Mezon App](#handling-events-from-the-mezon-app)
- [API Reference (Key Components)](#api-reference-key-components)
  - [MezonWebView (`webview.ts`)](#mezonwebview-webviewts)
    - [**Key Properties**](#key-properties)
    - [**Key Methods**](#key-methods)
      - [`postEvent<T>(eventType: MezonWebViewEvent, eventData: T, callback: Function): void`](#posteventteventtype-mezonwebviewevent-eventdata-t-callback-function-void)
      - [`receiveEvent<T>(event: MezonAppEvent | null, eventData?: T): void`](#receiveeventtevent-mezonappevent--null-eventdata-t-void)
      - [`onEvent<T>(eventType: MezonAppEvent, callback: MezonEventHandler<T>): void`](#oneventteventtype-mezonappevent-callback-mezoneventhandlert-void)
      - [`offEvent<T>(eventType: MezonAppEvent, callback: MezonEventHandler<T>): void`](#offeventteventtype-mezonappevent-callback-mezoneventhandlert-void)
  - [Events](#events-1)
    - [**MezonAppEvent (App -\> WebView)**](#mezonappevent-app---webview)
    - [**MezonWebViewEvent (WebView -\> App)**](#mezonwebviewevent-webview---app)
  - [Utility Functions (`utils.ts`)](#utility-functions-utilsts)
- [Building from Source](#building-from-source)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

The `mezon-web-sdk` is a lightweight TypeScript library designed to facilitate seamless communication between a web application (running inside an iframe) and the host Mezon application. It provides a simple and secure event-driven interface using the browser's `postMessage` API.

**Why `mezon-web-sdk`?**

This SDK abstracts the complexities of cross-origin iframe communication, allowing developers to focus on their application's features.

- **🟢 Event-Driven:** Easily send and receive events between your web app and the Mezon client.
- **🔵 Secure:** Communication is restricted to a trusted Mezon origin, preventing unauthorized interactions.
- **🟡 Dynamic Integration:** The host application can dynamically pass parameters, change the theme, and even inject custom CSS into your web app at runtime.
- **🔴 State Persistence:** Initialization parameters are automatically persisted in `sessionStorage` to maintain state across page reloads.

---

## Features

|      | Component                  | Details                                                                                                                                                                                                                           |
| :--- | :------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ⚙️    | **Architecture**           | <ul><li>A singleton `MezonWebView` class that acts as the central point of interaction.</li><li>Event-driven architecture for handling communication between the iframe and the parent window.</li><li>Secure by design, communicating only with a trusted target origin.</li></ul> |
| 🔩    | **Core Functionality**     | <ul><li>Handles the `postMessage` API for cross-origin communication.</li><li>Parses initialization parameters from the URL hash.</li><li>Persists `initParams` in `sessionStorage` for stateful reloads.</li></ul>        |
| 🔌    | **Event System**           | <ul><li>Provides `onEvent` and `offEvent` methods for subscribing to events sent from the Mezon application.</li><li>Provides a `postEvent` method to send events to the Mezon application.</li><li>Supports predefined events for lifecycle (`IframeReady`) and theming (`ThemeChanged`).</li></ul> |
| 🎨    | **Dynamic Styling**        | <ul><li>Allows the host Mezon application to inject arbitrary CSS into the web app's context via the `SetCustomStyle` event.</li><li>Provides a utility `setCssProperty` to manage CSS variables.</li></ul> |
| 🧩    | **Utilities**              | <ul><li>Includes helper functions for parsing URL hash and query parameters.</li><li>Provides safe wrappers for `sessionStorage` access.</li></ul>                                                                                |

---

## Project Structure

```sh
└── mezon-web-js/
    ├── src
    │   ├── webview
    │   │   ├── constant.ts
    │   │   ├── index.ts
    │   │   ├── types.ts
    │   │   ├── utils.ts
    │   │   └── webview.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

## Getting Started

### Prerequisites

To use the `mezon-web-sdk`, you only need a modern web browser that supports the `postMessage` API and `sessionStorage`. Your web application must be designed to run within an `<iframe>`.

### Installation

The SDK is designed to be included directly in your HTML file via a `<script>` tag.

1.  **Include the SDK script** in your HTML file. This will expose the SDK instance on the global `window` object.

    ```html
    <!DOCTYPE html>
    <html>
      <head>
        <title>My Mezon Web App</title>
      </head>
      <body>
        <!-- Your application content -->

        <script src="path/to/mezon-web-sdk.js"></script>
        <script>
          // You can now access the SDK
          const mezonWebView = window.Mezon.WebView;
          console.log('Mezon SDK loaded. Initial params:', mezonWebView.initParams);
        </script>
      </body>
    </html>
    ```

2.  **Access the SDK instance**: The SDK automatically initializes itself and is available at `window.Mezon.WebView`.

---

## Core Concepts

### MezonWebView

The **`MezonWebView` [src](https://github.com/mezonai/mezon-web-js/blob/main/src/webview/webview.ts)** is the singleton class and the primary interface for the SDK. It is automatically instantiated when the script loads. It handles the entire lifecycle of communication with the parent Mezon application:
-   Initializing parameters from the URL hash and session storage.
-   Establishing the message listener to receive events from the parent.
-   Providing methods to send events to the parent.
-   Managing an event bus for your application to subscribe to incoming events.

### Initialization & Parameters

When the web application loads within the Mezon iframe, the Mezon app can pass initial settings via the URL hash. For example: `https://myapp.com/index.html#user_id=123&theme=dark`.

The `MezonWebView` SDK automatically:
1.  Parses these parameters from `window.location.hash` into the `initParams` object.
2.  Persists these parameters in `sessionStorage`.
3.  On subsequent loads or reloads, it restores the parameters from `sessionStorage`, ensuring that state is not lost.

This allows your application to be configured dynamically by the host environment.

### Iframe Communication (postMessage)

The SDK's communication is built entirely on the standard browser `window.postMessage` API, which allows for secure cross-origin communication.

-   **Receiving Events**: The SDK adds a global `'message'` event listener that waits for messages from the parent window. It ensures security by checking that the message `event.origin` matches the `TRUSTED_TARGET` ('https://mezon.ai') for critical events like `SetCustomStyle`.
-   **Sending Events**: When you call `postEvent()`, the SDK sends a JSON-stringified message to the `window.parent`, specifying the `TRUSTED_TARGET` as the destination. This ensures your data is only sent to the legitimate Mezon application.

### Events

The SDK defines two categories of events, which are identified by string enums.

-   **`MezonAppEvent`**: Events sent **from** the parent Mezon application **to** your web view. Your application listens for these using `onEvent()`. Examples include `ThemeChanged` and `ReloadIframe`.
-   **`MezonWebViewEvent`**: Events sent **from** your web view **to** the parent Mezon application. You send these using `postEvent()`. Examples include `IframeReady`.

---

## Usage / API Examples

Below are common examples of how to use the `mezon-web-sdk`. All examples assume you have installed the SDK as described in the Getting Started section.

```javascript
// Access the global instance of the SDK
const mezonWebView = window.Mezon.WebView;
```

### Initializing the SDK

The SDK initializes automatically. Upon loading, it parses URL hash parameters and notifies the parent Mezon application that it's ready. You can access these parameters to configure your app.

```javascript
// Example of accessing initialization parameters
// URL: https://myapp.com/#theme=dark&version=1.2
document.addEventListener('DOMContentLoaded', () => {
  const params = mezonWebView.initParams;
  console.log(params.theme); // 'dark'
  console.log(params.version); // '1.2'

  if (params.theme === 'dark') {
    document.body.classList.add('dark-mode');
  }
});
```

### Sending Events to the Mezon App

After your application has loaded and is ready for interaction, you should send the `IframeReady` event.

```javascript
// It's good practice to let the Mezon app know when you're ready.
// The SDK does this automatically, but you can also do it manually if needed.
mezonWebView.postEvent('iframe_ready', { customData: 'loaded' }, (err) => {
  if (err) {
    console.error('Failed to post event:', err);
  } else {
    console.log('Successfully posted iframe_ready event to Mezon.');
  }
});
```

### Handling Events from the Mezon App

Your application can react to changes in the Mezon environment by listening for events. A common use case is changing the theme.

```javascript
// Define a handler function
const handleThemeChange = (eventType, eventData) => {
  console.log(`Event received: ${eventType}`);
  console.log('Theme data:', eventData);

  // Assuming eventData is { theme: 'dark' } or { theme: 'light' }
  const theme = eventData.theme;
  document.body.className = `${theme}-theme`;

  // You can also use the utility to set CSS variables
  if (theme === 'dark') {
    window.Mezon.Utils.setCssProperty('primary-color', '#FFFFFF');
    window.Mezon.Utils.setCssProperty('background-color', '#121212');
  } else {
    window.Mezon.Utils.setCssProperty('primary-color', '#000000');
    window.Mezon.Utils.setCssProperty('background-color', '#FFFFFF');
  }
};

// Register the event handler for the 'theme_changed' event
mezonWebView.onEvent('theme_changed', handleThemeChange);

// If you need to clean up, you can unregister the handler
// mezonWebView.offEvent('theme_changed', handleThemeChange);
```

---

## API Reference (Key Components)

This section provides an overview of the primary class and methods in the `mezon-web-sdk`.

### MezonWebView (`webview.ts`)

The singleton class that manages all SDK functionality. An instance is automatically created and attached to `window.Mezon.WebView`.

#### **Key Properties**

| Property     | Type                              | Description                                                                                              |
| :----------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `initParams` | `Record<string, string \| null>`   | An object containing key-value pairs parsed from the URL hash and persisted in `sessionStorage`.         |
| `isIframe`   | `boolean`                         | A boolean that is `true` if the web app is currently running inside an iframe, and `false` otherwise.      |

#### **Key Methods**

##### `postEvent<T>(eventType: MezonWebViewEvent, eventData: T, callback: Function): void`

Posts an event from the web view to the parent Mezon application.

| Parameter   | Type                | Description                                                                       |
| :---------- | :------------------ | :-------------------------------------------------------------------------------- |
| `eventType` | `MezonWebViewEvent` | The name of the event to send. Must be one of the values from `MezonWebViewEvent`. |
| `eventData` | `T`                 | Any serializable data to send along with the event.                               |
| `callback`  | `Function`          | An optional callback function that is executed after the `postMessage` attempt. It receives an error object as its first argument if the call fails (e.g., not in an iframe). |

##### `receiveEvent<T>(event: MezonAppEvent | null, eventData?: T): void`

Called internally to process an incoming event from the Mezon app and trigger any registered handlers. You typically don't call this directly.

##### `onEvent<T>(eventType: MezonAppEvent, callback: MezonEventHandler<T>): void`

Registers a callback function to be executed when a specific event is received from the parent Mezon application.

| Parameter   | Type                 | Description                                                                   |
| :---------- | :------------------- | :---------------------------------------------------------------------------- |
| `eventType` | `MezonAppEvent`      | The name of the event to listen for. Must be one of the values from `MezonAppEvent`. |
| `callback`  | `MezonEventHandler<T>` | The function to execute. It receives `eventType` and `eventData` as arguments. |

##### `offEvent<T>(eventType: MezonAppEvent, callback: MezonEventHandler<T>): void`

Unregisters a previously registered event handler.

| Parameter   | Type                 | Description                                              |
| :---------- | :------------------- | :------------------------------------------------------- |
| `eventType` | `MezonAppEvent`      | The name of the event the handler was registered for.    |
| `callback`  | `MezonEventHandler<T>` | The exact same callback function instance to remove.     |

### Events

#### **MezonAppEvent (App -> WebView)**

These are events that your web application can listen for using `onEvent`.

| Event Name            | Value                | Description                                                                                                   |
| :-------------------- | :------------------- | :------------------------------------------------------------------------------------------------------------ |
| `ThemeChanged`        | `'theme_changed'`    | Fired when the Mezon application's theme changes. The event data typically contains the new theme details.      |
| `ViewPortChanged`     | `'viewport_changed'` | Fired when the visible area (viewport) of the iframe changes in the Mezon app.                                |
| `SetCustomStyle`      | `'set_custom_style'` | Fired to inject a string of CSS directly into a `<style>` tag in your web app's `<head>`. This is handled automatically by the SDK. |
| `ReloadIframe`        | `'reload_iframe'`    | Instructs the web app to reload itself. This is handled automatically by the SDK.                             |

#### **MezonWebViewEvent (WebView -> App)**

These are events that your web application can send to the Mezon app using `postEvent`.

| Event Name           | Value                 | Description                                                                                                   |
| :------------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------ |
| `IframeReady`        | `'iframe_ready'`      | Should be sent when your web application has finished loading and is ready for interaction. This is sent automatically on initialization. |
| `IframeWillReloaded` | `'iframe_will_reload'` | Sent automatically by the SDK just before it honors a `ReloadIframe` request from the parent app.             |

### Utility Functions (`utils.ts`)

The SDK exposes utility functions under `window.Mezon.Utils`.

| Function                | Description                                                                 |
| :---------------------- | :-------------------------------------------------------------------------- |
| `urlParseHashParams`    | Parses a URL hash string (`#key=value&...`) into a key-value object.        |
| `urlAppendHashParams`   | Appends new parameters to a URL's hash string correctly.                    |
| `sessionStorageSet`     | A wrapper for `window.sessionStorage.setItem` that prefixes keys.           |
| `sessionStorageGet`     | A wrapper for `window.sessionStorage.getItem` that prefixes keys.           |
| `setCssProperty`        | A helper to set a CSS custom property (e.g., `--mezon-color`) on the root.    |

---

## Building from Source

The project uses `npm` to manage dependencies and build the source code. The build process compiles the TypeScript files into a single JavaScript file.

To build the SDK from source:

1.  **Install dependencies**:
    ```sh
    npm install
    ```
2.  **Run the build script**:
    ```sh
    npm run build
    ```
This will generate the `mezon-web-sdk.js` file, which you can then include in your project.

---

## Contributing

Contributions are welcome! Here's how you can help:

-   **💬 [Join the Discussions](https://mezon.ai/invite/1840697268164890624)**: Share your insights, provide feedback, or ask questions.
-   **🐛 [Report Issues](https://mezon.ai/invite/1840697268164890624)**: Submit bugs found or log feature requests for the `mezon-web-sdk` project.
-   **💡 [Submit Pull Requests](https://github.com/mezonai/mezon-web-js/pulls)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1.  **Fork the Repository**: Start by forking the project repository to your GitHub account.
2.  **Clone Locally**: Clone the forked repository to your local machine.
    ```sh
    git clone <your-fork-url>
    ```
3.  **Create a New Branch**: Always work on a new branch, giving it a descriptive name (e.g., `feature/add-event-support`).
    ```sh
    git checkout -b feature/new-awesome-feature
    ```
4.  **Make Your Changes**: Develop and test your changes locally. Ensure your code adheres to the project's style guidelines.
5.  **Commit Your Changes**: Commit with a clear and descriptive message.
    ```sh
    git commit -m 'feat: Implemented new awesome feature for XYZ'
    ```
6.  **Push to Your Fork**: Push the changes to your forked repository.
    ```sh
    git push origin feature/new-awesome-feature
    ```7.  **Submit a Pull Request**: Create a Pull Request (PR) against the main branch of the original `mezon-web-sdk` repository. Clearly describe the changes and their motivations in the PR description.
</details>

---

## License

Mezon-web-sdk is protected under a proprietary license. For more details, refer to the `LICENSE` file in the repository.

---

## Acknowledgments

-   Thanks to all developers who have contributed to the libraries and tools used in this project.
-   The Mezon community for their feedback and support.

<div align="right">

[![][back-to-top]](#top)

</div>

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square