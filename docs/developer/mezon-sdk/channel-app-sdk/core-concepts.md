---
sidebar_position: 3
---

# Core Concepts

Understanding these core concepts will help you effectively use the `mezon-web-sdk` for building channel applications.

## MezonWebView

The **`MezonWebView` [[src](https://github.com/mezonai/mezon-web-js/blob/main/src/webview/webview.ts)]** is the singleton class and the primary interface for the SDK. It automatically initializes when the script loads and handles the entire lifecycle of communication with the parent Mezon application:

- **Initialization management** parsing parameters from URL hash and session storage
- **Event communication** establishing message listeners to receive events from parent
- **Cross-origin messaging** providing methods to send events to the parent application
- **Event bus management** managing an internal event bus for your application to subscribe to incoming events
- **State persistence** automatically persisting initialization parameters across page reloads
- **Iframe detection** automatically detecting whether the app is running inside Mezon or standalone

### Key Properties and Methods

- **`initParams`**: Object containing initialization parameters passed from Mezon
- **`isIframe`**: Boolean indicating if the app is running inside Mezon's iframe
- **`postEvent()`**: Sends events from your channel app to the Mezon application
- **`onEvent()`**: Registers event handlers for events sent from Mezon
- **`offEvent()`**: Unregisters previously registered event handlers
- **`receiveEvent()`**: Internal method for processing incoming events (called automatically)

## Initialization & Parameters

When your channel application loads within the Mezon iframe, the Mezon app can pass initial configuration via the URL hash. For example: `https://myapp.com/index.html#user_id=123&theme=dark&channel_id=456`.

The `MezonWebView` SDK automatically:
1. **Parses URL parameters** from `window.location.hash` into the `initParams` object
2. **Persists parameters** in `sessionStorage` with the prefixed key `__mezon__initParams`
3. **Restores on reload** parameters from `sessionStorage` on subsequent loads or reloads
4. **Merges parameters** combining URL parameters with stored parameters, with URL taking precedence

This allows your channel application to be configured dynamically by the host Mezon environment and maintain state across navigation and reloads.

### Parameter Parsing

The SDK uses utility functions to safely parse URL parameters:

- **Hash parsing**: Converts `#key=value&another=data` to `{ key: 'value', another: 'data' }`
- **Path support**: Handles paths like `#mypage?param=value`
- **URL decoding**: Safely decodes URL-encoded parameters with fallback for malformed data
- **Null handling**: Properly handles parameters without values (`#flag` becomes `{ _path: 'flag' }`)

## Iframe Communication (postMessage)

The SDK's communication is built entirely on the standard browser `window.postMessage` API, ensuring secure cross-origin communication between your channel app and Mezon.

### Receiving Events

- **Global listener**: The SDK adds a `'message'` event listener that waits for messages from the parent window
- **Origin validation**: Ensures security by checking that the message `event.origin` matches the `TRUSTED_TARGET` ('https://mezon.ai') for critical events
- **Source validation**: Verifies that messages come from `window.parent` to prevent unauthorized communication
- **JSON parsing**: Safely parses incoming message data with error handling for malformed messages
- **Event routing**: Routes parsed events to registered handlers or processes them internally

### Sending Events

- **Target validation**: When you call `postEvent()`, the SDK sends messages only to `window.parent` with the `TRUSTED_TARGET` as destination
- **JSON serialization**: Automatically serializes event data to JSON format for transmission
- **Error handling**: Provides callback support to handle transmission errors or unavailable parent window
- **Iframe detection**: Gracefully handles cases where the app is not running in an iframe

### Security Model

The SDK implements multiple security layers:

- **Trusted target validation**: Only accepts critical events from the official Mezon origin
- **Parent window verification**: Ensures messages originate from the expected parent window
- **Safe parsing**: Uses try-catch blocks to handle malformed or malicious message data
- **Prefixed storage**: Uses prefixed keys in sessionStorage to avoid conflicts with other applications

## Events

The SDK defines two categories of events, identified by TypeScript enums for type safety:

### MezonAppEvent (Mezon → Channel App)

Events sent **from** the parent Mezon application **to** your channel app. Your application listens for these using `onEvent()`:

- **`ThemeChanged` ('theme_changed')**: Fired when the Mezon application's theme changes, allowing your app to adapt its appearance
- **`ViewPortChanged` ('viewport_changed')**: Fired when the visible area (viewport) of the iframe changes in the Mezon app
- **`SetCustomStyle` ('set_custom_style')**: Fired to inject CSS directly into your channel app's `<head>` (handled automatically)
- **`ReloadIframe` ('reload_iframe')**: Instructs your channel app to reload itself (handled automatically with notification)

### MezonWebViewEvent (Channel App → Mezon)

Events sent **from** your channel app **to** the parent Mezon application. You send these using `postEvent()`:

- **`IframeReady` ('iframe_ready')**: Should be sent when your channel app has finished loading and is ready for interaction (sent automatically)
- **`IframeWillReloaded` ('iframe_will_reload')**: Sent automatically just before honoring a `ReloadIframe` request from Mezon

### Custom Events

Beyond the predefined events, you can send and receive custom events for your specific channel application needs:

```javascript
// Send custom event to Mezon
mezonWebView.postEvent('custom_event_name', {
    customData: 'your data here',
    action: 'user_action'
}, (error) => {
    if (error) console.error('Event failed:', error);
});

// Listen for custom events from Mezon
mezonWebView.onEvent('custom_mezon_event', (eventType, eventData) => {
    console.log('Received custom event:', eventType, eventData);
});
```

## State Management

The SDK provides automatic state management for channel applications:

### Session Storage Integration

- **Automatic persistence**: Initialization parameters are automatically saved to `sessionStorage`
- **Prefixed keys**: All storage keys are prefixed with `__mezon__` to avoid conflicts
- **Safe access**: Utility functions provide error-handling for storage operations
- **Cross-reload persistence**: State is maintained across page reloads and navigation

### CSS Variable Management

- **Dynamic theming**: The SDK can automatically apply CSS custom properties based on Mezon themes
- **Root-level variables**: CSS variables are set on the document root with `--mezon-` prefix
- **Theme adaptation**: Your channel app can respond to theme changes by using CSS custom properties

```css
/* Your CSS can use Mezon theme variables */
body {
    background-color: var(--mezon-bg-color, #ffffff);
    color: var(--mezon-text-color, #000000);
}
```

## Utility Functions

The SDK exposes several utility functions under `window.Mezon.Utils` for common operations:

### URL Parsing

- **`urlParseHashParams(hash)`**: Parses URL hash strings into key-value objects
- **`urlAppendHashParams(url, params)`**: Safely appends parameters to URL hash
- **`urlSafeDecode(encoded)`**: Safely decodes URL-encoded strings with fallback

### Storage Operations

- **`sessionStorageSet(key, value)`**: Safe wrapper for sessionStorage with error handling
- **`sessionStorageGet(key)`**: Safe wrapper for sessionStorage retrieval with parsing

### CSS Management

- **`setCssProperty(name, value)`**: Helper to set CSS custom properties on document root

## Error Handling

The SDK implements comprehensive error handling throughout:

### Message Processing

- **Safe JSON parsing**: All incoming messages are parsed with try-catch blocks
- **Validation checks**: Event data is validated before processing
- **Graceful degradation**: Invalid events are ignored rather than causing crashes

### Event Transmission

- **Callback error reporting**: postEvent callbacks receive error objects when transmission fails
- **Iframe availability**: Graceful handling when parent window is not available
- **Origin validation**: Security errors are handled without exposing sensitive information

### Storage Operations

- **Storage availability**: Handles cases where sessionStorage is not available
- **Quota exceeded**: Graceful handling of storage quota limitations
- **JSON serialization**: Safe serialization with fallback for non-serializable data

This robust error handling ensures your channel application remains stable even in unexpected environments or when communication issues occur.