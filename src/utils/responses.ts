export function returnInteractionResponse(content: string) {
  return `Let's start interacting with the Rootstock CLI functions! 

    First, we need to create a wallet, then we can start interacting with the blockchain.

    Please choose one of the following wallet creation options:

    ${content}

    Which option would you like to use?`;
}

export function returnErrorReadingPasswordFile(content: string) {
  return `❌ Error reading password file: ${content}

Please check your JSON file format and try again.`;
}

export function returnErrorMissingInfo(content: string, args?: string[]) {
  if (!args) return content;

  return `To proceed with "${content}", I need the following information:

${args.map((info, index) => `${index + 1}. ${info}`).join("\n")}

Please call the create-wallet function again with these parameters filled in.`;
}

export function returnSecurePasswordMethod() {
  return `🔒 **Secure Password Method**: 
         
**RECOMMENDED: Upload JSON File** 📁
1. Create a text file (e.g., password.json)
2. Add this exact content:
\`\`\`json
{
  "password": "yourSecurePassword123"
}
\`\`\`
3. Upload the file to this conversation
4. Call create-wallet again

**Password Requirements:**
- Between 6-20 characters
- Letters, numbers, and safe symbols (!@#$%^&*()_+-=[]{};"'|,.<>?/)
- No script or SQL injection patterns

**OR** provide password directly (⚠️ less secure - visible in chat)`;
}

export function returnWalletName() {
  return "📝 **Wallet Name**: Please provide a name for your wallet (e.g., 'MyRootstockWallet')";
}

export function returnReplaceCurrentWallet() {
  return "🔄 **Replace Current Wallet**: Do you want to set this as your main wallet? (true/false)";
}

export function returnWalletConfigurationFile() {
  return `📁 **Wallet Configuration File**: 
         
Upload your previously saved wallet configuration file (my-wallets.json) that contains your existing wallets data.

**Format expected:**
\`\`\`json
{
  "wallets": {
    "WalletName": {
      "address": "0x...",
      "encryptedPrivateKey": "...",
      "iv": "..."
    }
  },
  "currentWallet": "WalletName"
}
\`\`\`

**OR** if importing a single wallet, provide the private key directly.`;
}

export function returnWalletCreatedSuccessfully(
  content: string,
  args?: string[]
) {
  if (!args) return content;

  return `✅ Successfully executed: ${content}

**🎉 Wallet Created Successfully!**

**📄 Wallet Details:**
${args[0]}

**📁 IMPORTANT: Save Your Wallet Configuration**

Please save the following JSON content to a file (e.g., \`my-wallets.json\`):

\`\`\`json
${args[1]}
\`\`\`

**🔐 For Future Use:**

To interact with your wallets in the future, you will need **TWO files**:

1. **🔒 Password File** (password.json):
   \`\`\`json
   {
     "password": "yourSecurePassword123"
   }
   \`\`\`

2. **💼 Wallet Configuration File** (my-wallets.json):
   The JSON content above containing all your wallet data

**Next Steps:**
- Save both files in a secure location
- Use these files when you need to import/access your wallets again
- Keep your password file especially secure

Your wallet operation has been completed. What would you like to do next?`;
}

export function returnErrorTryAgain(content: string, args?: string[]) {
  if (!args) return content;

  return `❌ Failed to execute: ${content}

Error: ${args?.[0] || "Unknown error occurred"}

Please try again or select a different option.`;
}

export function returnTokenSelectionOptions() {
  return `💰 **Token Selection**: Please specify which token to check balance for.
        
**Available options:**
- \`rBTC\` - Rootstock Bitcoin (native token)
- \`USDT\` - Tether USD 
- \`DOC\` - Dollar on Chain
- \`BPRO\` - BitPro
- \`RIF\` - RSK Infrastructure Framework
- \`FISH\` - Fish Token
- \`Custom Token\` - Specify your own token address

**Example:** "rBTC" or "USDT"`;
}

export function returnCustomTokenAddress() {
  return `📄 **Custom Token Address**: Please provide the contract address for your custom token.
         
**Example:** "0x1234567890abcdef1234567890abcdef12345678"`;
}

export function returnToCheckBalance(content: string, args?: string[]) {
  if (!args) return content;

  return `To check balance, I need the following information:

${args.map((info, index) => `${index + 1}. ${info}`).join("\n")}

Please call the check-balance function again with these parameters filled in.`;
}

export function returnErrorInvalidWalletData(content: string) {
  return `❌ **Invalid wallet data format**

The walletData provided is not valid JSON. Please ensure it's properly formatted.

Error: ${content}

Expected format:
\`\`\`json
{
  "wallets": {
    "walletName": {
      "address": "0x...",
      "encryptedPrivateKey": "...",
      "iv": "..."
    }
  },
  "currentWallet": "walletName"
}
\`\`\``;
}

export function returnCheckBalanceSuccess(content: string, data: any = null) {
  if (!data) return content;

  return `✅ **Balance Retrieved Successfully**

💰 **Balance**: ${data.balance} ${data.symbol}
📄 **Wallet Address**: ${data.walletAddress}
🌐 **Network**: ${data.network}
🔗 **Token Type**: ${data.tokenType}${
    data.tokenName
      ? `
📝 **Token Name**: ${data.tokenName}
📄 **Contract**: ${data.tokenContract}
🔢 **Decimals**: ${data.decimals}`
      : ""
  }

**Note**: Ensure that transactions are being conducted on the correct network.

What would you like to do next?`;
}

export function returnErrorCheckingBalance(content: string) {
  return `❌ **Failed to check balance**

Error: ${content}

Please verify:
- Your wallet exists and is properly configured
- The token address is correct (if using custom token)
- You're connected to the correct network

**If you don't have a wallet file locally:**
- Upload your wallet configuration file (my-wallets.json) content using the \`walletData\` parameter
- Or create a wallet first using the \`create-wallet\` function

Try again or check your wallet configuration.`;
}

export function returnErrorTXIdRequired() {
  return `❌ **Transaction ID Required**

Please provide a valid transaction hash to check.

**Example:** 
- \`0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef\`
- \`1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef\`

The transaction hash should be 64 characters long (without 0x prefix) or 66 characters (with 0x prefix).`;
}

export function returnErrorTXHashInvalid(content: string) {
  return `❌ **Invalid Transaction Hash Format**

The provided transaction hash appears to be invalid.

**Provided:** \`${content}\`

**Expected format:**
- 64 hexadecimal characters (without 0x prefix)
- 66 hexadecimal characters (with 0x prefix)

**Example:** \`0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef\``;
}

export function returnTransactionFound(content: string, data: any = null) {
  if (!data) return content;

  return `✅ **Transaction Found**

🔑 **Transaction ID**: \`${data.txId}\`
✅ **Status**: ${data.status === "Success" ? "✅ Success" : "❌ Failed"}
🌐 **Network**: ${data.network}

**📊 Transaction Details:**
🔗 **Block Hash**: \`${data.blockHash}\`
🧱 **Block Number**: ${data.blockNumber}
⛽ **Gas Used**: ${data.gasUsed}

**👥 Addresses:**
📤 **From**: \`${data.from}\`
📥 **To**: \`${data.to || "Contract Creation"}\`

**🔍 View on Explorer:**
${
    content === "testnet"
    ? `- **Rootstock Testnet Explorer**: https://explorer.testnet.rsk.co/tx/${data.txId}`
    : `- **Rootstock Mainnet Explorer**: https://explorer.rsk.co/tx/${data.txId}`
}

What would you like to do next?`;
}

export function returnErrorTxNotFound(content: string, args?: string[]) {
  if (!args) return content;

  return `❌ **Transaction Not Found**

Error: ${content}

**Possible reasons:**
- Transaction hash is incorrect
- Transaction doesn't exist on the ${args[0]} network
- Transaction is still pending (try again in a few moments)
- You're checking on the wrong network (try switching between mainnet/testnet)

**Please verify:**
- The transaction hash is correct
- You're checking the correct network (${args[0]})
- The transaction has been confirmed

Try again with a different transaction hash or check the correct network.`;
}

export function returnErrorCheckingTransaction(content: string) {
  return `❌ **Error Checking Transaction**

Error: ${content}

**Please verify:**
- The transaction hash format is correct
- You have network connectivity
- The Rootstock network is accessible

Try again with a valid transaction hash.`;
}