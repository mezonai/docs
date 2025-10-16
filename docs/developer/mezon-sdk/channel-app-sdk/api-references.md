---
sidebar_position: 5
---

# API References

This section provides comprehensive documentation for all classes, interfaces, and methods available in the `mezon-web-sdk`.

## MezonWebView Class

The main singleton class that handles all communication between your channel app and the Mezon application.

### Properties

| Property        | Type                               | Description                                                                                   |
| --------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `initParams`    | `Record<string, string \| null>`   | Object containing initialization parameters parsed from URL hash and stored in sessionStorage |
| `isIframe`      | `boolean`                          | Boolean indicating whether the app is running inside Mezon's iframe environment               |
| `eventHandlers` | `EventHandlers<unknown>` (private) | Internal map of registered event handlers for different event types                           |
| `locationHash`  | `string` (private)                 | Current location hash string from the URL                                                     |
| `iFrameStyle`   | `HTMLStyleElement` (private)       | Style element for injecting CSS from Mezon application                                        |

### Constructor

```typescript
constructor()
```

The constructor automatically initializes the SDK when instantiated. It performs the following operations:
- Parses initialization parameters from URL hash
- Sets up iframe detection and communication
- Establishes message listeners for parent window communication
- Creates style element for dynamic CSS injection
- Sends ready notification to parent Mezon application

**Usage Note:** The constructor is called automatically when the SDK script loads. You don't need to instantiate it manually.

### Methods

#### postEvent()

```typescript
postEvent<T>(
    eventType: string, 
    eventData: T, 
    callback: Function
): void
```

Sends an event from your channel app to the parent Mezon application.

**Parameters:**
- `eventType` (string): The type/name of the event to send
- `eventData` (T): Any serializable data to send with the event
- `callback` (Function): Callback function executed after the postMessage attempt

**Example:**
```javascript
mezonWebView.postEvent('counter_update', 
    { value: 42, timestamp: Date.now() }, 
    (error) => {
        if (error) {
            console.error('Failed to send event:', error);
        } else {
            console.log('Event sent successfully');
        }
    }
);
```

#### receiveEvent()

```typescript
receiveEvent<T>(eventType: MezonAppEvent, eventData: T): void
```

Processes incoming events from the Mezon application. This method is called internally and triggers registered event handlers.

**Parameters:**
- `eventType` (MezonAppEvent): The type of event received
- `eventData` (T): Data associated with the event

**Usage Note:** This method is called automatically by the SDK's message listener. You typically don't need to call it directly.

#### onEvent()

```typescript
onEvent<T>(
    eventType: MezonAppEvent, 
    callback: MezonEventHandler<T>
): void
```

Registers an event handler for events sent from the Mezon application.

**Parameters:**
- `eventType` (MezonAppEvent): The event type to listen for
- `callback` (MezonEventHandler\<T\>): Function to execute when the event is received

**Example:**
```javascript
mezonWebView.onEvent('theme_changed', (eventType, eventData) => {
    console.log('Theme changed to:', eventData.theme);
    applyTheme(eventData);
});
```

#### offEvent()

```typescript
offEvent<T>(
    eventType: MezonAppEvent, 
    callback: MezonEventHandler<T>
): void
```

Removes a previously registered event handler.

**Parameters:**
- `eventType` (MezonAppEvent): The event type the handler was registered for
- `callback` (MezonEventHandler\<T\>): The exact callback function to remove

**Example:**
```javascript
const themeHandler = (eventType, eventData) => {
    // Handle theme change
};

// Register handler
mezonWebView.onEvent('theme_changed', themeHandler);

// Later, remove handler
mezonWebView.offEvent('theme_changed', themeHandler);
```

## Global Interface

### Window.Mezon

The SDK attaches itself to the global `window.Mezon` object for easy access.

```typescript
declare global {
    interface Window {
        Mezon: {
            WebView?: IMezonWebView;
            Utils?: UtilityFunctions;
        };
    }
}
```

**Usage:**
```javascript
// Access SDK instance
const mezonWebView = window.Mezon.WebView;

// Access utility functions
const utils = window.Mezon.Utils;
```

## Event Types and Enums

### MezonAppEvent

Events sent from the Mezon application to your channel app. These events handle various operations including authentication, data retrieval, voice functionality, and real-time communication.

```typescript
enum MezonAppEvent {
	PONG = 'PONG',
	PING = 'PING',
	SEND_TOKEN = 'SEND_TOKEN',
	GET_CLAN_ROLES = 'GET_CLAN_ROLES',
	SEND_BOT_ID = 'SEND_BOT_ID',
	GET_CLAN_USERS = 'GET_CLAN_USERS',
	JOIN_ROOM = 'JOIN_ROOM',
	LEAVE_ROOM = 'LEAVE_ROOM',
	CREATE_VOICE_ROOM = 'CREATE_VOICE_ROOM',
	CURRENT_USER_INFO = 'CURRENT_USER_INFO',
	CLAN_ROLES_RESPONSE = 'CLAN_ROLES_RESPONSE',
	USER_HASH_INFO = 'USER_HASH_INFO',
	CLAN_USERS_RESPONSE = 'CLAN_USERS_RESPONSE',
	SEND_TOKEN_RESPONSE_SUCCESS = 'SEND_TOKEN_RESPONSE_SUCCESS',
	SEND_TOKEN_RESPONSE_FAILED = 'SEND_TOKEN_RESPONSE_FAILED',
	GET_CHANNELS = 'GET_CHANNELS',
	CHANNELS_RESPONSE = 'CHANNELS_RESPONSE',
	GET_CLAN = 'GET_CLAN',
	CLAN_RESPONSE = 'CLAN_RESPONSE',
	GET_CHANNEL = 'GET_CHANNEL',
	CHANNEL_RESPONSE = 'CHANNEL_RESPONSE',
	CHECK_MICROPHONE_STATUS = 'CHECK_MICROPHONE_STATUS',
	MICROPHONE_STATUS = 'MICROPHONE_STATUS',
	TOGGLE_MICROPHONE = 'TOGGLE_MICROPHONE'
}
```


#### Event Reference Table

| Event                         | Value                           | Direction     | Description                                                                  |
| ----------------------------- | ------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| `PING`                        | `'PING'`                        | Bidirectional | Heartbeat signal to maintain connection and check application responsiveness |
| `PONG`                        | `'PONG'`                        | Response      | Acknowledgment response to PING events, confirms connection is active        |
| `SEND_TOKEN`                  | `'SEND_TOKEN'`                  | Request       | Requests authentication token from the parent Mezon application              |
| `SEND_BOT_ID`                 | `'SEND_BOT_ID'`                 | Request       | Requests bot identification data for authentication purposes                 |
| `CURRENT_USER_INFO`           | `'CURRENT_USER_INFO'`           | Request       | Requests current authenticated user's profile information                    |
| `USER_HASH_INFO`              | `'USER_HASH_INFO'`              | Request       | Requests user hash data for secure identification                            |
| `GET_CLAN`                    | `'GET_CLAN'`                    | Request       | Requests information about the current clan/server                           |
| `CLAN_RESPONSE`               | `'CLAN_RESPONSE'`               | Response      | Contains clan/server data including name, ID, and configuration              |
| `GET_CLAN_ROLES`              | `'GET_CLAN_ROLES'`              | Request       | Requests list of available roles within the current clan                     |
| `CLAN_ROLES_RESPONSE`         | `'CLAN_ROLES_RESPONSE'`         | Response      | Contains array of clan roles with permissions and metadata                   |
| `GET_CLAN_USERS`              | `'GET_CLAN_USERS'`              | Request       | Requests list of members in the current clan                                 |
| `CLAN_USERS_RESPONSE`         | `'CLAN_USERS_RESPONSE'`         | Response      | Contains array of clan members with their roles and status                   |
| `GET_CHANNELS`                | `'GET_CHANNELS'`                | Request       | Requests list of available channels in the current clan                      |
| `CHANNELS_RESPONSE`           | `'CHANNELS_RESPONSE'`           | Response      | Contains array of channels with their properties and permissions             |
| `GET_CHANNEL`                 | `'GET_CHANNEL'`                 | Request       | Requests detailed information about a specific channel                       |
| `CHANNEL_RESPONSE`            | `'CHANNEL_RESPONSE'`            | Response      | Contains specific channel data including settings and metadata               |
| `JOIN_ROOM`                   | `'JOIN_ROOM'`                   | Request       | Requests to join a voice or chat room within a channel                       |
| `LEAVE_ROOM`                  | `'LEAVE_ROOM'`                  | Request       | Requests to leave the currently joined room                                  |
| `CREATE_VOICE_ROOM`           | `'CREATE_VOICE_ROOM'`           | Request       | Requests creation of a new voice room with specified parameters              |
| `CHECK_MICROPHONE_STATUS`     | `'CHECK_MICROPHONE_STATUS'`     | Request       | Checks current microphone permission and availability status                 |
| `MICROPHONE_STATUS`           | `'MICROPHONE_STATUS'`           | Response      | Contains microphone status including permissions and device availability     |
| `TOGGLE_MICROPHONE`           | `'TOGGLE_MICROPHONE'`           | Request       | Requests to enable/disable microphone for voice communication                |
| `SEND_TOKEN_RESPONSE_SUCCESS` | `'SEND_TOKEN_RESPONSE_SUCCESS'` | Response      | Confirms successful authentication token transmission                        |
| `SEND_TOKEN_RESPONSE_FAILED`  | `'SEND_TOKEN_RESPONSE_FAILED'`  | Response      | Indicates authentication token transmission failure with error details       |

### MezonWebViewEvent

Events sent from your channel app to the Mezon application.

```typescript
enum MezonWebViewEvent {
    IframeReady = 'iframe_ready',
    IframeWillReloaded = 'iframe_will_reload'
}
```

| Event                | Value                  | Description                                                 |
| -------------------- | ---------------------- | ----------------------------------------------------------- |
| `IframeReady`        | `'iframe_ready'`       | Sent when your app is loaded and ready (sent automatically) |
| `IframeWillReloaded` | `'iframe_will_reload'` | Sent before app reload (sent automatically)                 |

## Type Definitions

### MezonEventHandler

```typescript
type MezonEventHandler<T> = (
    eventType: MezonAppEvent, 
    eventData?: T
) => void;
```

Function signature for event handlers that process events from Mezon.

### EventHandlers

```typescript
type EventHandlers<T> = Record<string, MezonEventHandler<T>[]>;
```

Internal type for managing collections of event handlers.

### InitParams

```typescript
type InitParams = Record<string, string | null>;
```

Type definition for initialization parameters passed from Mezon to your channel app.

### IMezonWebView Interface

```typescript
interface IMezonWebView {
    initParams: InitParams;
    isIframe: boolean;
    onEvent<T>(eventType: MezonAppEvent, callback: MezonEventHandler<T>): void;
    offEvent<T>(eventType: MezonAppEvent, callback: MezonEventHandler<T>): void;
    postEvent<T>(eventType: MezonWebViewEvent, eventData: T, callback: Function): void;
    receiveEvent<T>(event: MezonAppEvent | null, eventData?: T): void;
}
```

Interface defining the contract for the MezonWebView class.

## Utility Functions

The SDK provides utility functions accessible via `window.Mezon.Utils`.

### URL Parsing

#### urlParseHashParams()

```typescript
urlParseHashParams(locationHash: string): Record<string, string | null>
```

Parses URL hash parameters into a key-value object.

**Parameters:**
- `locationHash` (string): The hash portion of a URL (including or excluding the '#')

**Returns:** Object with parsed parameters

**Example:**
```javascript
const params = window.Mezon.Utils.urlParseHashParams('#user=123&theme=dark');
// Returns: { user: '123', theme: 'dark' }
```

#### urlAppendHashParams()

```typescript
urlAppendHashParams(url: string, addHash: string): string
```

Safely appends parameters to a URL's hash portion.

**Parameters:**
- `url` (string): The base URL
- `addHash` (string): Parameters to append

**Returns:** Modified URL with appended parameters

**Example:**
```javascript
const newUrl = window.Mezon.Utils.urlAppendHashParams(
    'https://app.com/#existing=1', 
    'new=2'
);
// Returns: 'https://app.com/#existing=1&new=2'
```

#### urlSafeDecode()

```typescript
urlSafeDecode(urlencoded: string): string
```

Safely decodes URL-encoded strings with fallback for malformed data.

**Parameters:**
- `urlencoded` (string): URL-encoded string to decode

**Returns:** Decoded string, or original string if decoding fails

### Session Storage

#### sessionStorageSet()

```typescript
sessionStorageSet<T>(key: string, value: T): boolean
```

Safely stores data in sessionStorage with prefixed keys and error handling.

**Parameters:**
- `key` (string): Storage key (will be prefixed with '__mezon__')
- `value` (T): Value to store (will be JSON-serialized)

**Returns:** Boolean indicating success

**Example:**
```javascript
const success = window.Mezon.Utils.sessionStorageSet('myData', { 
    count: 42, 
    timestamp: Date.now() 
});
```

#### sessionStorageGet()

```typescript
sessionStorageGet(key: string): any | null
```

Safely retrieves and parses data from sessionStorage.

**Parameters:**
- `key` (string): Storage key (will be prefixed with '__mezon__')

**Returns:** Parsed value or null if not found/invalid

**Example:**
```javascript
const data = window.Mezon.Utils.sessionStorageGet('myData');
if (data) {
    console.log('Retrieved data:', data);
}
```

### CSS Management

#### setCssProperty()

```typescript
setCssProperty(name: string, value: string): void
```

Sets CSS custom properties on the document root with Mezon prefix.

**Parameters:**
- `name` (string): Property name (will be prefixed with '--mezon-')
- `value` (string): CSS property value

**Example:**
```javascript
window.Mezon.Utils.setCssProperty('primary-color', '#007bff');
// Sets: --mezon-primary-color: #007bff; on document root
```

## Constants

### TRUSTED_TARGET

```typescript
const TRUSTED_TARGET = 'https://mezon.ai';
```

The trusted origin for secure communication. Only messages from this origin are accepted for critical operations like CSS injection.

## Event Data Interfaces

### Theme Change Event Data

```typescript
interface ThemeChangeData {
    theme: 'light' | 'dark';
    colors?: {
        'bg-color'?: string;
        'text-color'?: string;
        'accent-color'?: string;
        'button-bg'?: string;
        'button-text'?: string;
        'card-bg'?: string;
        'border-color'?: string;
        [key: string]: string | undefined;
    };
}
```

### Viewport Change Event Data

```typescript
interface ViewportChangeData {
    width: number;
    height: number;
    scale?: number;
    orientation?: 'portrait' | 'landscape';
}
```

### Custom Style Event Data

```typescript
interface CustomStyleData {
    css: string;
    target?: 'head' | 'body';
    replace?: boolean;
}
```

## Usage Notes

### Best Practices

1. **Event Handler Cleanup**: Always remove event handlers when they're no longer needed to prevent memory leaks:
   ```javascript
   // Store reference to handler
   const myHandler = (eventType, eventData) => { /* ... */ };
   
   // Register handler
   mezonWebView.onEvent('theme_changed', myHandler);
   
   // Clean up when done
   mezonWebView.offEvent('theme_changed', myHandler);
   ```

2. **Error Handling**: Always provide error handling in postEvent callbacks:
   ```javascript
   mezonWebView.postEvent('my_event', data, (error) => {
       if (error) {
           console.error('Event failed:', error);
           // Handle error appropriately
       }
   });
   ```

3. **Initialization Parameters**: Check for required parameters before using them:
   ```javascript
   const params = mezonWebView.initParams;
   if (params.user_id) {
       // Safe to use user_id
       loadUserData(params.user_id);
   }
   ```

4. **Iframe Detection**: Handle both iframe and standalone modes:
   ```javascript
   if (mezonWebView.isIframe) {
       // Running inside Mezon - full functionality
       setupMezonIntegration();
   } else {
       // Running standalone - provide fallbacks
       setupStandaloneMode();
   }
   ```

### Development Tips

1. **Event Debugging**: Use browser dev tools to monitor postMessage events:
   ```javascript
   // Add this for debugging
   window.addEventListener('message', (event) => {
       console.log('Received message:', event);
   });
   ```

2. **Parameter Testing**: Test with different URL parameters during development:
   ```
   your-app.html#user_id=123&theme=dark&channel_id=456
   ```

3. **Theme Testing**: Implement theme switching for testing:
   ```javascript
   // For development/testing
   function testThemeChange(theme) {
       mezonWebView.receiveEvent('theme_changed', { theme });
   }
   ```

### Security Considerations

1. **Origin Validation**: The SDK automatically validates message origins for security
2. **Data Sanitization**: Always sanitize data received from events before using in DOM
3. **Storage Prefixes**: The SDK uses prefixed storage keys to avoid conflicts
4. **HTTPS Required**: Your channel app must be served over HTTPS in production

### Performance Optimization

1. **Event Throttling**: Consider throttling high-frequency events:
   ```javascript
   let throttleTimer;
   mezonWebView.onEvent('viewport_changed', (eventType, eventData) => {
       clearTimeout(throttleTimer);
       throttleTimer = setTimeout(() => {
           handleViewportChange(eventData);
       }, 100);
   });
   ```

2. **Efficient DOM Updates**: Batch DOM updates when handling multiple events
3. **Memory Management**: Clean up event listeners and references when no longer needed