---
sidebar_label: Overview of Bots/Apps
sidebar_position: 1
---

# Overview of Mezon Bots/Apps

![Overview of Apps](./images/mezon-bot-001.png)

On this page we'll answer the questions:

- [What can bots and apps do?](#what-can-bots-and-apps-do)
- [Where are apps installed?](#where-are-apps-installed)
- [What APIs can apps use?](#what-apis-can-apps-use)

---

## What can bots and apps do?

You'll discover their full potential as you explore the documentation and start building, but let's first look at some key features you can build and integrate into your app.

### Send and manage messages

Messages are fundamental to Mezon, and bots are no exception. Bots can send messages through multiple methods—using the **[Mezon Bot SDK](../mezon-sdk/integration-bot-sdk/overview.md)** for direct messaging, creating and managing webhooks for automated messaging, or responding through bot interactions. With proper permissions, bots can also manage messages by editing, deleting, and reacting to them in channels.

### Create interactive experiences

Bots can create interactive elements in messages, which we call **interactive messages**. Create a polls, reminders, and more... this allows direct interaction with clan members.

### Build embedded channel applications

The **[Channel App SDK](../mezon-sdk/channel-app-sdk/overview.md)** enables apps to create **embedded web applications** that run directly within Mezon channels. These applications operate in secure iframes with bidirectional communication to the Mezon client, powering rich interactive experiences like games, productivity tools, polls, and collaborative workspaces where people are already connected.

### Customize clans and channels

With appropriate API endpoints and proper [permissions](../mezon-sdk/bot-app-sdk/core-concepts#authentication-sessions), apps can customize clan and moderation experiences by accessing and managing core Mezon resources—including [users](../mezon-sdk/bot-app-sdk/api-references#user-class), [channels](../mezon-sdk/bot-app-sdk/api-references#textchannel-class), [clans](../mezon-sdk/bot-app-sdk/api-references#clan-class), roles, and moderation tools. Apps can create channels, manage member permissions, implement automated moderation, and organize clan structures.

### Real-time communication and events

Apps can utilize **WebSocket connections** for real-time bidirectional communication with the Mezon platform. This allows apps to receive instant notifications about messages, user presence changes, voice channel activities, and other clan events. Apps can respond immediately to these events, delivering responsive and interactive experiences.

### Voice and streaming integration

Mezon apps can integrate with **voice channels** and **streaming features**. Apps can manage voice channel memberships, receive voice events, register streaming channels for bots, and create voice-enabled interactive experiences. This opens possibilities for music bots, voice-activated commands, and collaborative voice experiences.

### Token and economy features

Apps can integrate with Mezon's **token system** to build economy-based features. Bots can send and receive tokens between users, track transaction histories, and create reward systems, games, or marketplace features that leverage Mezon's built-in token economy.0



### ...and more

This developer documentation contains extensive features and capabilities to explore. Discover what's possible by browsing the documentation or [building your own app](https://mezon.ai/developers).

---

## Where are apps installed?

Mezon apps can be installed and used in various contexts depending on their type and configuration:

### Bot Applications

**Bot applications** are installed to specific clans by users with the **Manage Clan** permission. Once installed:
- Bots can interact within that clan's channels and with clan members
- Bots can send direct messages to users who interact with them
- Bots are visible to all clan members and can be used by anyone in the clan
- Bots maintain persistent presence and can respond to events 24/7

### Channel Applications

**Channel applications** run as embedded web experiences within specific channels:
- Channel apps are loaded directly in channel interfaces as iframe applications
- They can be accessed by any user with channel viewing permissions
- Channel apps receive initialization parameters from the parent Mezon application
- They communicate with Mezon through secure postMessage APIs for bidirectional interaction

### Installation and Permissions

The installation process and available contexts depend on:
- **Clan permissions**: Users require appropriate permissions to install apps in clans
- **App configuration**: Developers can configure which installation contexts their apps support
- **Security settings**: Apps operate in secure contexts with appropriate permission scoping

---

## What APIs can apps use?

There are several APIs and SDKs you can choose from based on your app's functionality and the Mezon features you want to access. Below is an overview of the main APIs on the Mezon developer platform.

### Mezon Bot SDK (Bot Applications)

The **[Mezon Bot SDK](../mezon-sdk/integration-bot-sdk/overview)** is a comprehensive TypeScript library for building bot applications that interact with the Mezon platform through REST APIs and WebSocket connections.

Use the Mezon SDK to:
- **Authenticate bots** and manage sessions
- **Send and receive messages** in real-time
- **Manage clans, channels, and users**
- **Handle voice and streaming events**
- **Process token transactions**
- **Listen to real-time events** via WebSocket connections

### Channel App SDK (Web Applications)

The **[Channel App SDK](../mezon-sdk/channel-app-sdk/overview)** is a lightweight JavaScript library for building web applications that run embedded within Mezon channels.

Use the Channel App SDK to:
- **Communicate with the parent Mezon application** via secure postMessage APIs
- **Receive initialization parameters** and context from Mezon
- **Handle theme changes** and responsive design updates
- **Send events and data** back to the Mezon client
- **Manage application state** across page reloads

### HTTP REST API

The **HTTP REST API** is a comprehensive interface that allows you to interact with core Mezon resources like channels, clans, users, messages, and more.

Use the HTTP API to:
- **Retrieve information** about Mezon resources
- **Create, update, or delete** channels, messages, and other entities
- **Manage clan and user relationships**
- **Process authentication** and session management
- **Upload and manage attachments**

### WebSocket Gateway API

The **WebSocket Gateway API** provides real-time event streaming for bot applications, delivering instant notifications about activities occurring across Mezon.

Use the Gateway API to:
- **Receive real-time events** like new messages, user joins, voice events
- **Maintain persistent connections** for immediate responsiveness
- **Handle clan and channel events** as they occur
- **Process user presence** and activity updates

### Webhook API

**Webhooks** provide HTTP-based event delivery for applications that prefer REST-based event handling over persistent WebSocket connections.

Use Webhooks to:
- **Receive HTTP POST notifications** about Mezon events
- **Process events asynchronously** in your application
- **Integrate with serverless architectures**
- **Handle events without maintaining persistent connections**

---

## Start Building

Now that we've covered the basics, it's time to start building your Mezon app! You can explore the rest of the documentation, visit the [developer portal](https://mezon.ai/developers), or check out the beginner resources below.

### Bot Applications
Build powerful bot applications that automate, moderate, and enhance clan experiences:

- **[Bot SDK Overview](../mezon-sdk/integration-bot-sdk/overview)** - Learn about the comprehensive Mezon SDK for bot development
- **[Getting Started with Bots](../mezon-sdk/integration-bot-sdk/getting-started)** - Step-by-step guide to create your first Mezon bot
- **[Core Concepts](../mezon-sdk/integration-bot-sdk/core-concepts)** - Understand the fundamental concepts of bot development
- **[Bot Usage Examples](../mezon-sdk/integration-bot-sdk/usage-and-examples)** - Practical examples and implementation patterns

### Channel Applications
Build embedded web applications that run directly within Mezon channels:

- **[Channel App SDK Overview](../mezon-sdk/channel-app-sdk/overview)** - Learn about building embedded channel applications
- **[Channel App Examples](../mezon-sdk/channel-app-sdk/usage-and-examples)** - Interactive examples including games and collaborative tools

### Getting Your First App Running

Ready to build your first Mezon application? Here's how to get started:

1. **[Create a Bot Account](./creating-mezon-bot.md)** - Set up your developer account and create your first bot
2. **Choose your app type** - Select between a bot application or channel application based on your use case
3. **Install the appropriate SDK** - Use the Mezon SDK for bots or Channel App SDK for web applications
4. **Follow the getting started guide** - Complete tutorials for your chosen app type
5. **Deploy and test** - Install your app in a test clan and iterate on your implementation

### Development Resources

- **[API Reference](/docs/mezon-sdk/bot-app-sdk/api-references)** - Complete documentation of all available APIs and methods
- **[Developer Portal](https://mezon.ai/developers)** - Manage your applications and access developer tools
- **[Community Support](https://mezon.ai/)** - Connect with other developers and get help

---

*Ready to transform how people connect and collaborate on Mezon? Start building your app today!*