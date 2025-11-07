---
sidebar_position: 2
---

# Getting Started

## Prerequisites

In order to work with the library and the Mezon API in general, you must first create a **[Mezon Bot](../../quick-start/creating-mezon-bot.md)** account.

To use the `mezon-sdk`, you'll need the following installed on your system:

- **Node.js**: (Version 18.x or higher recommended)
- **npm** (Node Package Manager, typically comes with Node.js) or **Yarn**
- **TypeScript**: (Version 4.x or higher recommended, if you are working with the SDK's source or want full type support in your project)

## Installation

Install the SDK via npm:

```sh
npm install mezon-sdk
```

Or using Yarn:

```sh
yarn add mezon-sdk
```

:::note

The SDK is available on NPM as `mezon-sdk`. For browser and React Native projects, the same package can be used with appropriate bundlers.

:::

## Quick Start

Here's a simple example to get you started with the Mezon SDK:

```javascript
const { MezonClient } = require('mezon-sdk');

// Initialize the client with bot credentials
const client = new MezonClient({
  botId: 'YOUR_BOT_ID',
  token: 'YOUR_BOT_TOKEN'
});

// Listen for ready event
client.on('ready', () => {
  console.log(`Bot ${client.clientId} is ready!`);
});

// Login to establish connection
client.login()
  .then(() => console.log('Login successful!'))
  .catch(error => console.error('Login failed:', error));
```

## Building from Source

If you need to build from source or contribute to the SDK:

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/mezonai/mezon-js.git
    cd mezon-js
    ```

2.  **Install dependencies:**
    ```sh
    npm install --workspace=mezon-sdk
    ```

3.  **Build the SDK:**
    ```sh
    npm run build --workspace=mezon-sdk
    ```

    This will compile the TypeScript code into JavaScript in the `dist` directory as configured in `tsconfig.json` and `tsconfig.esm.json`.

## Next Steps

- [Core Concepts](./core-concepts.md) - Learn about the fundamental concepts of the SDK
- [Usage and Examples](./usage-and-examples.md) - Explore practical examples
- [API References](./api-references.md) - Detailed API documentation