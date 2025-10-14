---
sidebar_position: 2
---

# Getting Started

## Prerequisites

To develop channel applications for Mezon using the `mezon-web-sdk`, you'll need the following:

- **Modern Web Browser**: Any browser supporting the `postMessage` API and `sessionStorage` (all modern browsers)
- **Web Development Environment**: HTML, CSS, and JavaScript/TypeScript knowledge
- **Mezon Account**: Access to Mezon platform for testing your channel applications
- **Basic Web Server**: For local development and testing (can be as simple as Python's `http.server` or Node.js `http-server`)

## Installation

The `mezon-web-sdk` is designed to be included directly in your HTML file via a `<script>` tag. No package managers or build tools are required for basic usage.

### Method 1: Direct Script Include

1. **Download the SDK**: Get the latest `mezon-web-sdk.js` file from the repository or build it from source.

2. **Include in your HTML**:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>My Channel App</title>
   </head>
   <body>
       <div id="app">
           <!-- Your channel app content -->
       </div>
       
       <!-- Include the Mezon Web SDK -->
       <script src="path/to/mezon-web-sdk.js"></script>
       
       <!-- Your application script -->
       <script>
           // Access the SDK instance
           const mezonWebView = window.Mezon.WebView;
           
           // Your channel app logic here
           console.log('Init params:', mezonWebView.initParams);
       </script>
   </body>
   </html>
   ```

### Method 2: Build from Source

If you need to customize the SDK or want the latest development version:

1. **Clone the repository**:
   ```sh
   git clone <repository-url>
   cd mezon-web-js
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Build the SDK**:
   ```sh
   npm run build
   ```

4. **Use the built file**:
   The compiled SDK will be available at `build/mezon-web-sdk.js` with TypeScript definitions at `build/mezon-web-sdk.d.ts`.

## Quick Start Example

Here's a minimal example to get you started:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello Mezon Channel App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: var(--mezon-bg-color, #ffffff);
            color: var(--mezon-text-color, #000000);
        }
        .status {
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .ready { background-color: #d4edda; color: #155724; }
        .info { background-color: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <h1>Hello Mezon Channel App</h1>
    
    <div id="status" class="status">Initializing...</div>
    
    <div>
        <h3>Initialization Parameters:</h3>
        <pre id="params"></pre>
    </div>
    
    <button id="pingBtn">Send Ping to Mezon</button>
    
    <div>
        <h3>Events Log:</h3>
        <ul id="events"></ul>
    </div>

    <!-- Include Mezon Web SDK -->
    <script src="mezon-web-sdk.js"></script>
    
    <script>
        // Access the global SDK instance
        const mezonWebView = window.Mezon.WebView;
        
        // Update status
        document.getElementById('status').innerHTML = 
            mezonWebView.isIframe ? 
            '<div class="ready">✅ Running inside Mezon channel</div>' : 
            '<div class="info">ℹ️ Running standalone (not in Mezon)</div>';
        
        // Display initialization parameters
        document.getElementById('params').textContent = 
            JSON.stringify(mezonWebView.initParams, null, 2);
        
        // Handle theme changes
        mezonWebView.onEvent('theme_changed', (eventType, eventData) => {
            console.log('Theme changed:', eventData);
            addEventLog('Theme Changed', eventData);
            
            // Apply theme if provided
            if (eventData && eventData.theme) {
                document.body.className = `theme-${eventData.theme}`;
            }
        });
        
        // Handle viewport changes
        mezonWebView.onEvent('viewport_changed', (eventType, eventData) => {
            console.log('Viewport changed:', eventData);
            addEventLog('Viewport Changed', eventData);
        });
        
        // Send ping when button is clicked
        document.getElementById('pingBtn').addEventListener('click', () => {
            mezonWebView.postEvent('iframe_ready', {
                message: 'Hello from channel app!',
                timestamp: Date.now()
            }, (error) => {
                if (error) {
                    console.error('Failed to send ping:', error);
                    addEventLog('Ping Failed', error);
                } else {
                    console.log('Ping sent successfully');
                    addEventLog('Ping Sent', { success: true });
                }
            });
        });
        
        // Helper function to add events to log
        function addEventLog(event, data) {
            const eventsList = document.getElementById('events');
            const li = document.createElement('li');
            li.innerHTML = `<strong>${event}:</strong> ${JSON.stringify(data)}`;
            eventsList.appendChild(li);
            
            // Keep only last 10 events
            while (eventsList.children.length > 10) {
                eventsList.removeChild(eventsList.firstChild);
            }
        }
        
        // Log initial ready state
        addEventLog('App Initialized', {
            isIframe: mezonWebView.isIframe,
            paramsCount: Object.keys(mezonWebView.initParams).length
        });
    </script>
</body>
</html>
```

## Development Workflow

1. **Create your channel app** using standard web technologies (HTML, CSS, JavaScript)
2. **Include the Mezon Web SDK** in your application
3. **Test locally** using a web server to serve your files
4. **Handle Mezon events** for theme changes, viewport changes, etc.
5. **Send events to Mezon** when your app state changes
6. **Deploy your channel app** to a web server accessible to Mezon
7. **Register your channel app** in the Mezon platform

## Next Steps

- Learn about [Core Concepts](./core-concepts.md) to understand the SDK architecture
- Explore [Usage and Examples](./usage-and-examples.md) for practical implementation patterns
- Check the [API Reference](./api-references.md) for complete method documentation

:::tip Development Tip

During development, you can test your channel app outside of Mezon by opening it directly in a browser. The SDK will detect that it's not running in an iframe and handle events gracefully, allowing you to develop and debug your application independently.

:::

:::note Security Note

Always ensure your channel app is served over HTTPS when deployed, as Mezon requires secure connections for iframe communication.

:::