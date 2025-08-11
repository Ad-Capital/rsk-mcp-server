# DevX MCP Server - Rootstock Blockchain Tools

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-orange.svg)](https://github.com/modelcontextprotocol)

**Rootstock MCP Server** is a Model Context Protocol (MCP) server that provides advanced tools for interacting with the Rootstock (RSK) blockchain. This project enables AI clients to seamlessly connect and execute blockchain operations.

## 🚀 Key Features

- 💼 **Wallet Management**: Create, import, switch and manage multiple wallets
- 💰 **Balance Queries**: Check rBTC and ERC20 token balances
- 💸 **Transfers**: Send rBTC and tokens to other addresses
- 🔍 **Transaction Tracking**: Verify transaction status by hash
- 🚀 **Contract Deployment**: Deploy smart contracts on Rootstock
- ✅ **Contract Verification**: Verify deployed contracts
- 📄 **Contract Interaction**: Read data from verified contracts
- 🌉 **RSK Bridge**: Interact with the Rootstock bridge
- 📊 **History**: Query transaction history
- 📦 **Batch Transfers**: Execute multiple transfers

## 📋 Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **TypeScript** (included in dev dependencies)

## 🛠️ Installation and Build

### 1. Clone the Repository

```bash
git clone https://github.com/rsksmart/rsk-mcp-server
cd rsk-mcp-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Project

```bash
npm run build
```

This command:
- Compiles TypeScript to JavaScript in the `build/` folder
- Makes the main file executable (`build/index.js`)

### 4. Verify Installation

```bash
node build/index.js
```

## ⚙️ AI Client Configuration

### 🏠 Local Configuration

### For Claude Desktop (Anthropic)

Edit your Claude Desktop configuration file:

**macOS/Linux:**
```bash
~/.config/claude-desktop/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

Add the following configuration:

```json
{
  "mcpServers": {
    "rsk-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/your/project/rsk-mcp-server/build/index.js"],
      "env": {}
    }
  }
}
```
> **Note:** For install reference on Claude, please follow these instructions [Here](https://modelcontextprotocol.io/quickstart/user)


### For Cursor IDE

In Cursor, go to Settings > Extensions > MCP and add:

```json
{
  "mcpServers": {
    "rsk-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/your/project/rsk-mcp-server/build/index.js"]
    }
  }
}
```
> **Note:** For install reference on Cursor, please follow these instructions [Here](https://docs.cursor.com/en/context/mcp)

#### For Other MCP Implementations

Any MCP-compatible client can connect using:

```bash
node /path/to/project/DevXMcp/build/index.js
```

### 🌐 Remote Configuration (URL)

> **Note:** This functionality will be available when the server is deployed to a public endpoint.

#### Remote Client Configuration

```json
{
  "mcpServers": {
    "rsk-mcp": {
      "url": "https://your-server.com/mcp-endpoint",
      "headers": {
        "Authorization": "Bearer your-api-key"
      }
    }
  }
}
```
## 🔧 Detailed Functionality

### 1. 💼 Wallet Management

#### Available Tools:
- `start-wallet-interaction`: Initialize wallet management
- `create-wallet`: Create/import/manage wallets

#### Supported Operations:

**🆕 Create New Wallet**
```typescript
// Creates a wallet with secure password
{
  walletOption: "🆕 Create a new wallet",
  walletName: "MyWallet",
  walletPassword: "secure_password",
  replaceCurrentWallet: false
}
```

**🔑 Import Existing Wallet**
```typescript
// Import using private key
{
  walletOption: "🔑 Import existing wallet",
  walletName: "ImportedWallet",
  privateKey: "0x...",
  walletPassword: "secure_password"
}
```

**🔍 List Saved Wallets**
```typescript
// List all available wallets
{
  walletOption: "🔍 List saved wallets",
  walletData: "my-wallets.json_content"
}
```

**🔁 Switch Active Wallet**
```typescript
// Switch to another wallet
{
  walletOption: "🔁 Switch wallet", 
  newMainWallet: "WalletName"
}
```

### 2. 💰 Balance Queries

#### Tool: `check-balance`

**Supported Tokens:**
- **rBTC** - Rootstock native token
- **USDT** - Tether USD 
- **DOC** - Dollar on Chain
- **BPRO** - BitPro
- **RIF** - RIF Token
- **FISH** - Fish Token
- **Custom Token** - Any ERC20 token

**Example:**
```typescript
{
  testnet: true, // true for testnet, false for mainnet
  token: "rBTC",
  walletName: "MyWallet" // optional, uses current wallet if not specified
}
```

**For Custom Tokens:**
```typescript
{
  testnet: true,
  token: "Custom Token",
  customTokenAddress: "0x...", // token contract address
  walletName: "MyWallet"
}
```

### 3. 🔍 Transaction Tracking

#### Tool: `check-transaction`

```typescript
{
  testnet: true, // network to check
  txid: "0x..." // transaction hash (with or without 0x prefix)
}
```

**Returned Information:**
- Transaction status (pending/confirmed/failed)
- Block number
- Gas used
- Transfer details
- Timestamps

### 4. 🚀 Contract Deployment

#### Tool: `deploy-contract`

**Requirements:**
- Contract ABI (JSON)
- Compiled bytecode (hex)
- Constructor arguments (optional)
- Wallet with sufficient funds

**Example:**
```typescript
{
  testnet: true,
  abiContent: `[{"inputs":[],"name":"myFunction"...}]`, // complete ABI
  bytecodeContent: "0x608060405234801561001057600080fd5b50...", // bytecode
  constructorArgs: ["arg1", "arg2"], // constructor arguments
  walletData: "my-wallets.json_content",
  walletPassword: "wallet_password"
}
```

### 5. ✅ Contract Verification

#### Tool: `verify-contract`

**Requirements:**
- Deployed contract address
- Solidity source code
- Compilation metadata (JSON Standard Input)
- Constructor arguments used

**Example:**
```typescript
{
  testnet: true,
  contractAddress: "0x...", // contract address
  contractName: "MyContract", // exact name in source code
  jsonContent: `{"language":"Solidity","sources":{...}}`, // compilation metadata
  constructorArgs: ["arg1", "arg2"] // arguments used in deployment
}
```

### 6. 📄 Contract Reading

#### Tool: `read-contract`

**To List Available Functions:**
```typescript
{
  testnet: true,
  contractAddress: "0x..." // must be a verified contract
}
```

**To Call a Function:**
```typescript
{
  testnet: true,
  contractAddress: "0x...",
  functionName: "balanceOf", // view/pure function name
  functionArgs: ["0x..."] // function arguments
}
```

### 7. 🌐 Supported Networks

#### Rootstock Mainnet
- **RPC URL:** `https://public-node.rsk.co`
- **Chain ID:** 30
- **Explorer:** `https://explorer.rsk.co`

#### Rootstock Testnet  
- **RPC URL:** `https://public-node.testnet.rsk.co`
- **Chain ID:** 31
- **Explorer:** `https://explorer.testnet.rsk.co`

## 📁 Project Structure

```
DevXMcp/
├── src/
│   ├── handlers/
│   │   └── responsesHandler.ts    # MCP response handling
│   ├── tools/
│   │   ├── constants.ts           # Constants and options
│   │   ├── handlers.ts            # Auxiliary handlers
│   │   ├── schemas.ts             # Zod validation schemas
│   │   └── types.ts               # TypeScript types
│   ├── utils/
│   │   └── responses.ts           # Response utilities
│   ├── index.ts                   # Main entry point
│   └── types.d.ts                 # Type declarations
├── build/                         # Compiled code (generated)
├── package.json                  # Project configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This documentation
```

## 🔐 Security

### Private Key Management
- Private keys are stored encrypted using AES-256
- Each wallet has its own unique IV (initialization vector)
- Passwords are never stored in plain text

### Configuration Files
- `my-wallets.json`: Contains encrypted wallets
- `password.json`: Optional file for automation (use with caution)

### Best Practices
- Use strong and unique passwords
- Maintain secure backups of `my-wallets.json`
- Do not share configuration files
- Use testnet for testing

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
npm install
npm run build
```

### Error: "Permission denied"
```bash
chmod +x build/index.js
```

### MCP Connection Error
- Verify absolute path in configuration
- Ensure the project is compiled
- Check MCP client logs

### Wallet Issues
- Verify `my-wallets.json` format
- Check password in `password.json`
- Ensure sufficient funds for transactions

## 📚 Usage Examples

### Complete User Flow

1. **Start Interaction:**
   ```typescript
   // AI client executes:
   start-interaction()
   ```

2. **Create Wallet:**
   ```typescript
   create-wallet({
     walletOption: "🆕 Create a new wallet",
     walletName: "MyFirstWallet",
     walletPassword: "super_secure_password"
   })
   ```

3. **Check Balance:**
   ```typescript
   check-balance({
     testnet: true,
     token: "rBTC"
   })
   ```

4. **Deploy Contract:**
   ```typescript
   deploy-contract({
     testnet: true,
     abiContent: "[...]",
     bytecodeContent: "0x...",
     walletPassword: "super_secure_password"
   })
   ```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🆘 Support

For support and questions:
- Create an Issue on GitHub
- Contact the Rootstock DevX team

## 🔗 Useful Links

- [Rootstock Documentation](https://rootstock.io/developers/)
- [RSK CLI](https://github.com/rsksmart/rsk-cli)
- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [Claude Desktop](https://claude.ai/desktop)
- [Cursor IDE](https://cursor.sh/)

---

**Developed by:** Sebastian G  
**Team:** Rootstock DevX  
**Version:** 0.0.1