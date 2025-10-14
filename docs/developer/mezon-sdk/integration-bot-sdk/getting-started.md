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

1.  **Clone the repository (if you need to build from source):**
    If you are contributing or need the latest unreleased changes:

    ```sh
    git clone <your-fork-url-or-original-repo-url>/mezon-js.git
    cd mezon-js/packages/mezon-sdk
    ```

    For using as a package, you would typically install it via npm after it's published:

    ```sh
    npm install mezon-sdk
    # or
    yarn add mezon-sdk
    ```

2.  **Install dependencies (if building from source):**
    Navigate to the `mezon-sdk` directory:

    ```sh
    cd path/to/mezon-sdk
    ```

    Install the dependencies:

    ```sh
    npm install
    # or
    yarn install
    ```

3.  **Build the SDK (if building from source):**
    The `package.json` specifies build scripts. Typically:
    ```sh
    npm run build
    # or
    yarn build
    ```
    This will compile the TypeScript code into JavaScript, usually in a `dist` directory, as configured in `tsconfig.json` and `tsconfig.esm.json`.

:::note

Installation instructions will depend on the target environment (e.g., npm for Node.js, CDN for browser). Please refer to the specific installation guide for your platform.

:::