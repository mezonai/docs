---
sidebar_position: 4
---

# Usage and Examples

This section provides practical examples and usage patterns for building channel applications with the `mezon-web-sdk`.

## Basic Setup and Initialization

### Simple Channel App Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Channel App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: var(--mezon-bg-color, #f5f5f5);
            color: var(--mezon-text-color, #333);
            transition: background-color 0.3s, color 0.3s;
        }
    </style>
</head>
<body>
    <div id="app">
        <h1>Channel Application</h1>
        <div id="status"></div>
        <div id="content"></div>
    </div>

    <script src="mezon-web-sdk.js"></script>
    <script>
        // Initialize your channel app
        const app = new ChannelApp();
        app.init();
    </script>
</body>
</html>
```

### Basic Channel App Class

```javascript
class ChannelApp {
    constructor() {
        this.mezonWebView = window.Mezon.WebView;
        this.isReady = false;
    }

    init() {
        this.setupEventListeners();
        this.updateStatus();
        this.loadInitialData();
        
        // Notify Mezon that the app is ready
        this.notifyReady();
    }

    setupEventListeners() {
        // Listen for theme changes
        this.mezonWebView.onEvent('theme_changed', (eventType, eventData) => {
            this.handleThemeChange(eventData);
        });

        // Listen for viewport changes
        this.mezonWebView.onEvent('viewport_changed', (eventType, eventData) => {
            this.handleViewportChange(eventData);
        });
    }

    updateStatus() {
        const statusEl = document.getElementById('status');
        if (this.mezonWebView.isIframe) {
            statusEl.innerHTML = '✅ Connected to Mezon';
        } else {
            statusEl.innerHTML = '⚠️ Running in standalone mode';
        }
    }

    loadInitialData() {
        const params = this.mezonWebView.initParams;
        console.log('Initialization parameters:', params);
        
        // Use initialization parameters to configure your app
        if (params.user_id) {
            this.loadUserData(params.user_id);
        }
        
        if (params.channel_id) {
            this.loadChannelData(params.channel_id);
        }
    }

    notifyReady() {
        this.mezonWebView.postEvent('iframe_ready', {
            app_name: 'My Channel App',
            version: '1.0.0',
            features: ['messaging', 'theming']
        }, (error) => {
            if (error) {
                console.error('Failed to notify ready state:', error);
            } else {
                this.isReady = true;
                console.log('App ready notification sent');
            }
        });
    }

    handleThemeChange(themeData) {
        console.log('Theme changed:', themeData);
        
        // Apply theme-specific styling
        if (themeData.theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
    }

    handleViewportChange(viewportData) {
        console.log('Viewport changed:', viewportData);
        
        // Adapt layout to viewport changes
        if (viewportData.width < 600) {
            document.body.classList.add('mobile-layout');
        } else {
            document.body.classList.remove('mobile-layout');
        }
    }

    loadUserData(userId) {
        // Implement user data loading logic
        console.log('Loading user data for:', userId);
    }

    loadChannelData(channelId) {
        // Implement channel data loading logic
        console.log('Loading channel data for:', channelId);
    }
}
```

## Interactive Channel Apps

### Counter App with Mezon Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Channel Counter</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 40px;
            background: var(--mezon-bg-color, #ffffff);
            color: var(--mezon-text-color, #000000);
        }
        
        .counter-display {
            font-size: 4rem;
            font-weight: bold;
            margin: 20px 0;
            color: var(--mezon-accent-color, #007bff);
        }
        
        .counter-buttons {
            margin: 20px 0;
        }
        
        button {
            font-size: 1.2rem;
            padding: 10px 20px;
            margin: 0 10px;
            border: none;
            border-radius: 5px;
            background: var(--mezon-button-bg, #007bff);
            color: var(--mezon-button-text, white);
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        button:hover {
            background: var(--mezon-button-hover, #0056b3);
        }
        
        .stats {
            margin-top: 30px;
            padding: 20px;
            background: var(--mezon-card-bg, #f8f9fa);
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <h1>Channel Counter</h1>
    
    <div class="counter-display" id="counterDisplay">0</div>
    
    <div class="counter-buttons">
        <button id="decrementBtn">-</button>
        <button id="incrementBtn">+</button>
        <button id="resetBtn">Reset</button>
    </div>
    
    <div class="stats">
        <p>Total clicks: <span id="totalClicks">0</span></p>
        <p>App running for: <span id="uptime">0s</span></p>
    </div>

    <script src="mezon-web-sdk.js"></script>
    <script>
        class CounterApp {
            constructor() {
                this.mezonWebView = window.Mezon.WebView;
                this.counter = 0;
                this.totalClicks = 0;
                this.startTime = Date.now();
                
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.setupMezonEvents();
                this.startUptime();
                this.loadSavedState();
                this.notifyReady();
            }

            setupEventListeners() {
                document.getElementById('incrementBtn').addEventListener('click', () => {
                    this.increment();
                });
                
                document.getElementById('decrementBtn').addEventListener('click', () => {
                    this.decrement();
                });
                
                document.getElementById('resetBtn').addEventListener('click', () => {
                    this.reset();
                });
            }

            setupMezonEvents() {
                // Listen for theme changes
                this.mezonWebView.onEvent('theme_changed', (eventType, eventData) => {
                    this.applyTheme(eventData);
                });

                // Handle custom reset event from Mezon
                this.mezonWebView.onEvent('counter_reset', () => {
                    this.reset();
                });
            }

            increment() {
                this.counter++;
                this.totalClicks++;
                this.updateDisplay();
                this.saveState();
                this.notifyCounterChange();
            }

            decrement() {
                this.counter--;
                this.totalClicks++;
                this.updateDisplay();
                this.saveState();
                this.notifyCounterChange();
            }

            reset() {
                this.counter = 0;
                this.updateDisplay();
                this.saveState();
                this.notifyCounterReset();
            }

            updateDisplay() {
                document.getElementById('counterDisplay').textContent = this.counter;
                document.getElementById('totalClicks').textContent = this.totalClicks;
            }

            saveState() {
                if (this.mezonWebView.isIframe) {
                    window.Mezon.Utils.sessionStorageSet('counterState', {
                        counter: this.counter,
                        totalClicks: this.totalClicks
                    });
                }
            }

            loadSavedState() {
                if (this.mezonWebView.isIframe) {
                    const savedState = window.Mezon.Utils.sessionStorageGet('counterState');
                    if (savedState) {
                        this.counter = savedState.counter || 0;
                        this.totalClicks = savedState.totalClicks || 0;
                        this.updateDisplay();
                    }
                }
            }

            startUptime() {
                setInterval(() => {
                    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
                    document.getElementById('uptime').textContent = uptime + 's';
                }, 1000);
            }

            notifyReady() {
                this.mezonWebView.postEvent('iframe_ready', {
                    app_type: 'counter',
                    initial_count: this.counter
                });
            }

            notifyCounterChange() {
                this.mezonWebView.postEvent('counter_changed', {
                    value: this.counter,
                    total_clicks: this.totalClicks,
                    timestamp: Date.now()
                });
            }

            notifyCounterReset() {
                this.mezonWebView.postEvent('counter_reset', {
                    previous_value: this.counter,
                    total_clicks: this.totalClicks,
                    timestamp: Date.now()
                });
            }

            applyTheme(themeData) {
                if (themeData && themeData.colors) {
                    const root = document.documentElement;
                    Object.entries(themeData.colors).forEach(([key, value]) => {
                        root.style.setProperty(`--mezon-${key}`, value);
                    });
                }
            }
        }

        // Initialize the counter app
        const counterApp = new CounterApp();
    </script>
</body>
</html>
```

## Real-time Collaboration App

### Collaborative Drawing Canvas

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Collaborative Canvas</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: var(--mezon-bg-color, #f0f0f0);
        }
        
        .canvas-container {
            border: 2px solid var(--mezon-border-color, #ccc);
            border-radius: 8px;
            background: white;
            margin: 20px 0;
        }
        
        #drawingCanvas {
            display: block;
            cursor: crosshair;
        }
        
        .controls {
            margin: 20px 0;
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .color-picker {
            width: 40px;
            height: 40px;
            border: none;
            border-radius: 50%;
            cursor: pointer;
        }
        
        .brush-size {
            margin: 0 10px;
        }
        
        button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background: var(--mezon-button-bg, #007bff);
            color: var(--mezon-button-text, white);
            cursor: pointer;
        }
        
        .stats {
            background: var(--mezon-card-bg, #fff);
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h1>Collaborative Canvas</h1>
    
    <div class="controls">
        <input type="color" id="colorPicker" class="color-picker" value="#000000">
        <label for="brushSize" class="brush-size">Brush Size:</label>
        <input type="range" id="brushSize" min="1" max="20" value="5">
        <button id="clearBtn">Clear Canvas</button>
        <button id="saveBtn">Save Drawing</button>
    </div>
    
    <div class="canvas-container">
        <canvas id="drawingCanvas" width="800" height="400"></canvas>
    </div>
    
    <div class="stats">
        <p>Strokes drawn: <span id="strokeCount">0</span></p>
        <p>Collaborators: <span id="collaboratorCount">1</span></p>
    </div>

    <script src="mezon-web-sdk.js"></script>
    <script>
        class CollaborativeCanvas {
            constructor() {
                this.mezonWebView = window.Mezon.WebView;
                this.canvas = document.getElementById('drawingCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.isDrawing = false;
                this.strokeCount = 0;
                this.currentColor = '#000000';
                this.currentBrushSize = 5;
                
                this.init();
            }

            init() {
                this.setupCanvas();
                this.setupControls();
                this.setupMezonEvents();
                this.loadCanvasState();
                this.notifyReady();
            }

            setupCanvas() {
                // Set up canvas drawing
                this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
                this.canvas.addEventListener('mousemove', (e) => this.draw(e));
                this.canvas.addEventListener('mouseup', () => this.stopDrawing());
                this.canvas.addEventListener('mouseout', () => this.stopDrawing());

                // Touch events for mobile
                this.canvas.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const mouseEvent = new MouseEvent('mousedown', {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                    });
                    this.canvas.dispatchEvent(mouseEvent);
                });

                this.canvas.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const mouseEvent = new MouseEvent('mousemove', {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                    });
                    this.canvas.dispatchEvent(mouseEvent);
                });

                this.canvas.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    const mouseEvent = new MouseEvent('mouseup', {});
                    this.canvas.dispatchEvent(mouseEvent);
                });
            }

            setupControls() {
                document.getElementById('colorPicker').addEventListener('change', (e) => {
                    this.currentColor = e.target.value;
                });

                document.getElementById('brushSize').addEventListener('change', (e) => {
                    this.currentBrushSize = e.target.value;
                });

                document.getElementById('clearBtn').addEventListener('click', () => {
                    this.clearCanvas();
                });

                document.getElementById('saveBtn').addEventListener('click', () => {
                    this.saveDrawing();
                });
            }

            setupMezonEvents() {
                // Listen for drawing events from other collaborators
                this.mezonWebView.onEvent('canvas_stroke', (eventType, eventData) => {
                    this.drawRemoteStroke(eventData);
                });

                // Listen for canvas clear events
                this.mezonWebView.onEvent('canvas_clear', () => {
                    this.clearCanvas(false); // false = don't broadcast
                });

                // Listen for collaborator count updates
                this.mezonWebView.onEvent('collaborator_update', (eventType, eventData) => {
                    this.updateCollaboratorCount(eventData.count);
                });

                // Listen for theme changes
                this.mezonWebView.onEvent('theme_changed', (eventType, eventData) => {
                    this.applyTheme(eventData);
                });
            }

            startDrawing(e) {
                this.isDrawing = true;
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                
                this.currentStroke = {
                    points: [{ x, y }],
                    color: this.currentColor,
                    size: this.currentBrushSize,
                    timestamp: Date.now()
                };
            }

            draw(e) {
                if (!this.isDrawing) return;

                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                this.ctx.strokeStyle = this.currentColor;
                this.ctx.lineWidth = this.currentBrushSize;
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';

                this.ctx.lineTo(x, y);
                this.ctx.stroke();

                // Add point to current stroke
                this.currentStroke.points.push({ x, y });
            }

            stopDrawing() {
                if (!this.isDrawing) return;
                
                this.isDrawing = false;
                this.strokeCount++;
                this.updateStrokeCount();
                
                // Broadcast stroke to other collaborators
                this.broadcastStroke(this.currentStroke);
                
                // Save canvas state
                this.saveCanvasState();
            }

            drawRemoteStroke(strokeData) {
                if (!strokeData || !strokeData.points) return;

                this.ctx.strokeStyle = strokeData.color;
                this.ctx.lineWidth = strokeData.size;
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';

                this.ctx.beginPath();
                strokeData.points.forEach((point, index) => {
                    if (index === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                });
                this.ctx.stroke();
            }

            clearCanvas(broadcast = true) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.strokeCount = 0;
                this.updateStrokeCount();
                
                if (broadcast) {
                    this.mezonWebView.postEvent('canvas_clear', {
                        timestamp: Date.now()
                    });
                }
                
                this.saveCanvasState();
            }

            saveDrawing() {
                const dataURL = this.canvas.toDataURL('image/png');
                
                // Send drawing data to Mezon
                this.mezonWebView.postEvent('canvas_save', {
                    image_data: dataURL,
                    stroke_count: this.strokeCount,
                    timestamp: Date.now()
                }, (error) => {
                    if (error) {
                        console.error('Failed to save drawing:', error);
                        alert('Failed to save drawing');
                    } else {
                        alert('Drawing saved successfully!');
                    }
                });
            }

            broadcastStroke(strokeData) {
                this.mezonWebView.postEvent('canvas_stroke', strokeData);
            }

            saveCanvasState() {
                const imageData = this.canvas.toDataURL();
                window.Mezon.Utils.sessionStorageSet('canvasState', {
                    imageData,
                    strokeCount: this.strokeCount
                });
            }

            loadCanvasState() {
                const savedState = window.Mezon.Utils.sessionStorageGet('canvasState');
                if (savedState && savedState.imageData) {
                    const img = new Image();
                    img.onload = () => {
                        this.ctx.drawImage(img, 0, 0);
                    };
                    img.src = savedState.imageData;
                    
                    this.strokeCount = savedState.strokeCount || 0;
                    this.updateStrokeCount();
                }
            }

            updateStrokeCount() {
                document.getElementById('strokeCount').textContent = this.strokeCount;
            }

            updateCollaboratorCount(count) {
                document.getElementById('collaboratorCount').textContent = count;
            }

            applyTheme(themeData) {
                if (themeData && themeData.colors) {
                    const root = document.documentElement;
                    Object.entries(themeData.colors).forEach(([key, value]) => {
                        root.style.setProperty(`--mezon-${key}`, value);
                    });
                }
            }

            notifyReady() {
                this.mezonWebView.postEvent('iframe_ready', {
                    app_type: 'collaborative_canvas',
                    canvas_size: {
                        width: this.canvas.width,
                        height: this.canvas.height
                    },
                    features: ['drawing', 'collaboration', 'save']
                });
            }
        }

        // Initialize the collaborative canvas
        const canvasApp = new CollaborativeCanvas();
    </script>
</body>
</html>
```

## Advanced Event Handling

### Multi-Event Channel App

```javascript
class AdvancedChannelApp {
    constructor() {
        this.mezonWebView = window.Mezon.WebView;
        this.eventHistory = [];
        this.eventHandlers = new Map();
        
        this.init();
    }

    init() {
        this.setupDynamicEventHandlers();
        this.setupEventLogging();
        this.notifyReady();
    }

    setupDynamicEventHandlers() {
        // Define event handlers configuration
        const eventConfigs = [
            {
                event: 'theme_changed',
                handler: this.handleThemeChange.bind(this),
                description: 'Handles theme changes from Mezon'
            },
            {
                event: 'viewport_changed',
                handler: this.handleViewportChange.bind(this),
                description: 'Handles viewport size changes'
            },
            {
                event: 'user_action',
                handler: this.handleUserAction.bind(this),
                description: 'Handles custom user actions'
            },
            {
                event: 'channel_update',
                handler: this.handleChannelUpdate.bind(this),
                description: 'Handles channel information updates'
            }
        ];

        // Register all event handlers
        eventConfigs.forEach(config => {
            this.registerEventHandler(config.event, config.handler, config.description);
        });
    }

    registerEventHandler(eventType, handler, description) {
        // Store handler reference for cleanup
        this.eventHandlers.set(eventType, { handler, description });
        
        // Register with Mezon SDK
        this.mezonWebView.onEvent(eventType, (eventType, eventData) => {
            this.logEvent(eventType, eventData);
            handler(eventData);
        });
        
        console.log(`Registered handler for ${eventType}: ${description}`);
    }

    unregisterEventHandler(eventType) {
        const config = this.eventHandlers.get(eventType);
        if (config) {
            this.mezonWebView.offEvent(eventType, config.handler);
            this.eventHandlers.delete(eventType);
            console.log(`Unregistered handler for ${eventType}`);
        }
    }

    setupEventLogging() {
        // Log all outgoing events
        const originalPostEvent = this.mezonWebView.postEvent.bind(this.mezonWebView);
        this.mezonWebView.postEvent = (eventType, eventData, callback) => {
            this.logEvent(`OUTGOING: ${eventType}`, eventData);
            return originalPostEvent(eventType, eventData, callback);
        };
    }

    logEvent(eventType, eventData) {
        const logEntry = {
            timestamp: Date.now(),
            type: eventType,
            data: eventData,
            id: Math.random().toString(36).substr(2, 9)
        };
        
        this.eventHistory.push(logEntry);
        
        // Keep only last 100 events
        if (this.eventHistory.length > 100) {
            this.eventHistory.shift();
        }
        
        console.log(`[${new Date().toISOString()}] ${eventType}:`, eventData);
    }

    handleThemeChange(themeData) {
        console.log('Processing theme change:', themeData);
        
        // Apply theme with animation
        document.body.style.transition = 'all 0.3s ease';
        
        if (themeData.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        // Send acknowledgment
        this.mezonWebView.postEvent('theme_applied', {
            theme: themeData.theme,
            applied_at: Date.now()
        });
    }

    handleViewportChange(viewportData) {
        console.log('Processing viewport change:', viewportData);
        
        // Responsive layout adjustments
        const { width, height } = viewportData;
        
        if (width < 768) {
            document.body.classList.add('mobile');
            document.body.classList.remove('tablet', 'desktop');
        } else if (width < 1024) {
            document.body.classList.add('tablet');
            document.body.classList.remove('mobile', 'desktop');
        } else {
            document.body.classList.add('desktop');
            document.body.classList.remove('mobile', 'tablet');
        }
        
        // Send viewport acknowledgment
        this.mezonWebView.postEvent('viewport_adapted', {
            new_layout: width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop',
            viewport: { width, height }
        });
    }

    handleUserAction(actionData) {
        console.log('Processing user action:', actionData);
        
        // Handle different types of user actions
        switch (actionData.action_type) {
            case 'button_click':
                this.handleButtonClick(actionData);
                break;
            case 'form_submit':
                this.handleFormSubmit(actionData);
                break;
            case 'navigation':
                this.handleNavigation(actionData);
                break;
            default:
                console.log('Unknown user action type:', actionData.action_type);
        }
    }

    handleChannelUpdate(channelData) {
        console.log('Processing channel update:', channelData);
        
        // Update channel-specific UI elements
        if (channelData.name) {
            const channelNameEl = document.getElementById('channelName');
            if (channelNameEl) {
                channelNameEl.textContent = channelData.name;
            }
        }
        
        if (channelData.member_count) {
            const memberCountEl = document.getElementById('memberCount');
            if (memberCountEl) {
                memberCountEl.textContent = `${channelData.member_count} members`;
            }
        }
    }

    // Event debugging and inspection
    getEventHistory() {
        return this.eventHistory.slice(); // Return copy
    }

    getEventStats() {
        const stats = {};
        this.eventHistory.forEach(event => {
            stats[event.type] = (stats[event.type] || 0) + 1;
        });
        return stats;
    }

    exportEventHistory() {
        const data = {
            exported_at: Date.now(),
            app_info: {
                user_agent: navigator.userAgent,
                is_iframe: this.mezonWebView.isIframe,
                init_params: this.mezonWebView.initParams
            },
            event_history: this.eventHistory
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mezon-app-events-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    notifyReady() {
        this.mezonWebView.postEvent('iframe_ready', {
            app_type: 'advanced_channel_app',
            event_handlers: Array.from(this.eventHandlers.keys()),
            features: ['event_logging', 'dynamic_handlers', 'responsive_design'],
            ready_at: Date.now()
        });
    }

    // Cleanup method
    destroy() {
        // Unregister all event handlers
        for (const eventType of this.eventHandlers.keys()) {
            this.unregisterEventHandler(eventType);
        }
        
        // Clear event history
        this.eventHistory = [];
        
        console.log('Advanced channel app destroyed');
    }
}

// Usage
const advancedApp = new AdvancedChannelApp();

// Export for debugging
window.channelApp = advancedApp;
```

## Testing and Development

### Development Helper

```javascript
// Development helper for testing channel apps
class MezonDevHelper {
    constructor() {
        this.mezonWebView = window.Mezon.WebView;
        this.mockEvents = [];
        
        if (!this.mezonWebView.isIframe) {
            this.setupDevelopmentMode();
        }
    }

    setupDevelopmentMode() {
        console.log('🔧 Development mode active - Mezon events simulation available');
        
        // Create development UI
        this.createDevPanel();
        
        // Mock some initialization parameters
        this.mezonWebView.initParams = {
            user_id: 'dev_user_123',
            channel_id: 'dev_channel_456',
            theme: 'light',
            ...this.mezonWebView.initParams
        };
    }

    createDevPanel() {
        const panel = document.createElement('div');
        panel.id = 'mezon-dev-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #000;
            color: #fff;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-width: 300px;
        `;
        
        panel.innerHTML = `
            <div style="margin-bottom: 10px;"><strong>🔧 Mezon Dev Helper</strong></div>
            <button onclick="mezonDev.simulateThemeChange()">Theme Change</button>
            <button onclick="mezonDev.simulateViewportChange()">Viewport Change</button>
            <button onclick="mezonDev.simulateCustomEvent()">Custom Event</button>
            <div style="margin-top: 10px;">
                <input type="text" id="customEventType" placeholder="Event type" style="width: 100%; margin-bottom: 5px;">
                <textarea id="customEventData" placeholder="Event data (JSON)" style="width: 100%; height: 50px;"></textarea>
                <button onclick="mezonDev.sendCustomEvent()">Send Custom</button>
            </div>
        `;
        
        document.body.appendChild(panel);
        window.mezonDev = this;
    }

    simulateThemeChange() {
        const themes = ['light', 'dark'];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        
        const themeData = {
            theme: randomTheme,
            colors: {
                'bg-color': randomTheme === 'dark' ? '#1a1a1a' : '#ffffff',
                'text-color': randomTheme === 'dark' ? '#ffffff' : '#000000',
                'accent-color': '#007bff'
            }
        };
        
        this.mezonWebView.receiveEvent('theme_changed', themeData);
        console.log('🎨 Simulated theme change:', themeData);
    }

    simulateViewportChange() {
        const viewports = [
            { width: 320, height: 568 }, // Mobile
            { width: 768, height: 1024 }, // Tablet
            { width: 1920, height: 1080 }  // Desktop
        ];
        
        const randomViewport = viewports[Math.floor(Math.random() * viewports.length)];
        
        this.mezonWebView.receiveEvent('viewport_changed', randomViewport);
        console.log('📱 Simulated viewport change:', randomViewport);
    }

    simulateCustomEvent() {
        const customEvents = [
            { type: 'user_action', data: { action_type: 'button_click', target: 'main_button' } },
            { type: 'channel_update', data: { name: 'New Channel Name', member_count: 42 } },
            { type: 'notification', data: { message: 'Test notification', type: 'info' } }
        ];
        
        const randomEvent = customEvents[Math.floor(Math.random() * customEvents.length)];
        
        this.mezonWebView.receiveEvent(randomEvent.type, randomEvent.data);
        console.log('⚡ Simulated custom event:', randomEvent);
    }

    sendCustomEvent() {
        const eventType = document.getElementById('customEventType').value;
        const eventDataText = document.getElementById('customEventData').value;
        
        if (!eventType) {
            alert('Please enter an event type');
            return;
        }
        
        let eventData = {};
        if (eventDataText) {
            try {
                eventData = JSON.parse(eventDataText);
            } catch (e) {
                alert('Invalid JSON in event data');
                return;
            }
        }
        
        this.mezonWebView.receiveEvent(eventType, eventData);
        console.log('📤 Sent custom event:', { type: eventType, data: eventData });
    }
}

// Auto-initialize in development
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        new MezonDevHelper();
    });
}
```

This comprehensive usage guide provides practical examples for building various types of channel applications with the `mezon-web-sdk`, from simple interactive apps to complex collaborative tools with real-time features.