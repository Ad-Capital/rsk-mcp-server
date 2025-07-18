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

export function returnABIContentRequired() {
  return `📄 **Contract ABI Required**: Please provide the contract ABI JSON content.

**Format expected:**
\`\`\`json
[
  {
    "inputs": [],
    "name": "myFunction",
    "outputs": [],
    "stateMutability": "view",
    "type": "function"
  }
]
\`\`\`

The ABI should be a valid JSON array containing the contract interface.`;
}

export function returnBytecodeContentRequired() {
  return `🔧 **Contract Bytecode Required**: Please provide the contract bytecode.

**Format expected:**
- Hexadecimal string (with or without 0x prefix)
- Example: "0x608060405234801561001057600080fd5b50..."

You can get this from your contract compilation output.`;
}

export function returnToDeployContract(content: string, args?: string[]) {
  if (!args) return content || "Missing information for contract deployment";

  return `To deploy the contract, I need the following information:

${args.map((info, index) => `${index + 1}. ${info}`).join("\n")}

Please call the deploy-contract function again with these parameters filled in.`;
}

export function returnContractDeployedSuccessfully(content: string, data: any = null) {
  if (!data) return content;

  return `🎉 **Contract Deployed Successfully!**

📍 **Contract Address**: \`${data.contractAddress}\`
🔑 **Transaction Hash**: \`${data.transactionHash}\`
🌐 **Network**: ${data.network}

**🔍 View on Explorer:**
${data.explorerUrl}

**📋 Important Notes:**
- Save the contract address for future interactions
- The contract is now live on ${data.network}
- You can interact with it using the contract address and ABI

**Next Steps:**
- Test your contract functions
- Verify the contract if needed
- Interact with the contract using other tools

What would you like to do next?`;
}

export function returnErrorDeployingContract(content: string) {
  return `❌ **Contract Deployment Failed**

Error: ${content}

**Common issues:**
- Insufficient rBTC balance for gas fees
- Invalid ABI or bytecode format
- Constructor arguments mismatch
- Network connectivity issues
- Wallet not properly configured

**Please verify:**
- Your wallet has sufficient rBTC for gas fees
- The ABI is a valid JSON array
- The bytecode is valid hexadecimal
- Constructor arguments match the contract constructor
- You're connected to the correct network

Try again with corrected parameters.`;
}

export function returnErrorInvalidABI(content: string) {
  return `❌ **Invalid ABI Format**

The provided ABI is not valid JSON or is not properly formatted.

Error: ${content}

**Expected format:**
\`\`\`json
[
  {
    "inputs": [...],
    "name": "functionName",
    "outputs": [...],
    "stateMutability": "view",
    "type": "function"
  }
]
\`\`\`

Please ensure the ABI is a valid JSON array.`;
}

export function returnErrorInvalidBytecode(content: string) {
  return `❌ **Invalid Bytecode Format**

The provided bytecode is not valid.

**Provided:** \`${content.length > 100 ? content.substring(0, 100) + "..." : content}\`

**Expected format:**
- Hexadecimal string (with or without 0x prefix)
- Should start with "0x608060405..." or similar
- Must be valid compiled contract bytecode

Please provide valid contract bytecode from your compilation output.`;
}

export function returnErrorMissingWalletData() {
  return `💼 **Wallet Information**: Please provide either 'walletData' (your complete wallet configuration) or 'walletName' (name of an existing wallet).`;
}

export function returnErrorMissingWalletPassword() {
  return `🔒 **Wallet Password**: Password is required when using walletData to decrypt your wallet.`;
}

export function returnContractAddressRequired() {
  return `📍 **Contract Address Required**: Please provide the contract address to verify.

**Format expected:**
- Ethereum address format: "0x1234567890abcdef1234567890abcdef12345678"
- Must be a valid deployed contract address

**Example:** "0x1234567890abcdef1234567890abcdef12345678"`;
}

export function returnContractNameRequired() {
  return `📝 **Contract Name Required**: Please provide the name of the contract as defined in the source code.

**Format expected:**
- Exact name from your Solidity contract
- Case-sensitive

**Example:** "MyContract", "SimpleStorage", "ERC20Token"`;
}

export function returnJSONContentRequired() {
  return `📄 **JSON Standard Input Required**: Please provide the JSON Standard Input from your Solidity compilation.

**Required fields in JSON:**
- \`solcVersion\`: Short Solidity version (e.g., "0.8.22")
- \`solcLongVersion\`: Full Solidity version (e.g., "0.8.22+commit.4fc1097e")
- \`input\`: Complete compilation input with sources and settings

**Minimal format expected:**
\`\`\`json
{
  "id": "f5ec174c03684c3b3a0bb78eab96df27",
  "_format": "hh-sol-build-info-1",
  "solcVersion": "0.8.22",
  "solcLongVersion": "0.8.22+commit.4fc1097e",
  "input": {
    "language": "Solidity",
    "sources": {
      "contracts/MyContract.sol": {
        "content": "pragma solidity ^0.8.0;..."
      }
    },
    "settings": {
      "optimizer": {
        "enabled": true,
        "runs": 200
      },
      "outputSelection": {
        "*": {
          "*": ["*"]
        }
      }
    }
  }
}
\`\`\`

**📌 Note**: The system will automatically optimize large JSON files by keeping only the required fields for efficient verification.

You can get this from your Hardhat/Truffle compilation artifacts or Remix IDE.`;
}

export function returnToVerifyContract(content: string, args?: string[]) {
  if (!args) return content || "Missing information for contract verification";

  return `To verify the contract, I need the following information:

${args.map((info, index) => `${index + 1}. ${info}`).join("\n")}

Please call the verify-contract function again with these parameters filled in.`;
}

export function returnContractVerifiedSuccessfully(content: string, data: any = null) {
  if (!data) return content;

  const statusMessage = data.alreadyVerified 
    ? "✅ **Contract Already Verified**" 
    : "🎉 **Contract Verified Successfully!**";

  return `${statusMessage}

📍 **Contract Address**: \`${data.contractAddress}\`
📝 **Contract Name**: ${data.contractName}
🌐 **Network**: ${data.network}
✅ **Status**: ${data.verified ? "Verified" : "Not Verified"}

**🔍 View on Explorer:**
${data.explorerUrl}

**📋 Verification Details:**
- The contract source code has been successfully verified
- You can now view the source code on the explorer
- Contract interactions will show readable function names

**Next Steps:**
- Your contract is now publicly verifiable
- Users can inspect the source code
- Enhanced transparency and trust

What would you like to do next?`;
}

export function returnErrorVerifyingContract(content: string) {
  return `❌ **Contract Verification Failed**

Error: ${content}

**Common issues:**
- Contract address doesn't exist or is invalid
- JSON Standard Input doesn't match deployed bytecode
- Constructor arguments mismatch
- Contract is already verified
- Network connectivity issues
- Solidity version mismatch

**Please verify:**
- The contract address is correct and deployed
- The JSON Standard Input matches the deployed contract
- Constructor arguments are provided if the contract has them
- You're verifying on the correct network (testnet/mainnet)
- The source code matches exactly what was deployed

Try again with corrected parameters.`;
}

export function returnErrorInvalidContractAddress(content: string) {
  return `❌ **Invalid Contract Address**

The provided contract address is not valid.

**Provided:** \`${content}\`

**Expected format:**
- Ethereum address format (42 characters including 0x prefix)
- Example: "0x1234567890abcdef1234567890abcdef12345678"
- Must be a valid deployed contract address

Please provide a valid contract address.`;
}

export function returnErrorInvalidJSON(content: string) {
  return `❌ **Invalid JSON Standard Input**

The provided JSON content is not valid or is missing required fields.

Error: ${content}

**Required fields:**
- \`solcLongVersion\`: Solidity compiler version
- \`input\`: Compilation input with sources and settings

**Example structure:**
\`\`\`json
{
  "solcLongVersion": "0.8.19+commit.7dd6d404.Emscripten.clang",
  "input": {
    "language": "Solidity",
    "sources": { ... },
    "settings": { ... }
  }
}
\`\`\`

Please provide valid JSON Standard Input from your compilation.`;
}

export function returnFunctionNameRequired() {
  return `📝 **Function Name Required**: Please provide the name of the function to call.

**Format expected:**
- Exact function name from the contract
- Must be a view or pure function (read-only)
- Case-sensitive

**Example:** "balanceOf", "totalSupply", "getName"

**Note:** Only verified contracts can be read. The function must be marked as 'view' or 'pure' in the contract.`;
}

export function returnToReadContract(content: string, args?: string[]) {
  if (!args) return content || "Missing information for contract reading";

  return `To read from the contract, I need the following information:

${args.map((info, index) => `${index + 1}. ${info}`).join("\n")}

Please call the read-contract function again with these parameters filled in.`;
}

// Helper function to serialize BigInt values to strings
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInt(value);
    }
    return result;
  }
  
  return obj;
}

export function returnContractReadSuccessfully(content: string, data: any = null) {
  if (!data) return content;

  // Convert BigInt values to strings before serialization
  const serializedResult = serializeBigInt(data.result);

  return `✅ **Contract Function Called Successfully**

📍 **Contract Address**: \`${data.contractAddress}\`
📝 **Function Name**: ${data.functionName}
🌐 **Network**: ${data.network}

**📊 Function Result:**
\`\`\`
${JSON.stringify(serializedResult, null, 2)}
\`\`\`

**🔍 View on Explorer:**
${data.explorerUrl}

**📋 Details:**
- Function executed successfully
- Result returned from blockchain
- No gas fees for read-only functions

What would you like to do next?`;
}

export function returnErrorReadingContract(content: string) {
  return `❌ **Contract Reading Failed**

Error: ${content}

**Common issues:**
- Contract address doesn't exist or is invalid
- Contract is not verified
- Function name doesn't exist or is not view/pure
- Function arguments are incorrect or missing
- Network connectivity issues

**Please verify:**
- The contract address is correct and deployed
- The contract is verified on the explorer
- The function name exists and is a read function (view/pure)
- Function arguments match the expected types and count
- You're reading from the correct network (testnet/mainnet)

Try again with corrected parameters.`;
}

export function returnErrorContractNotVerified(content: string) {
  return `❌ **Contract Not Verified**

The contract at address \`${content}\` is not verified.

**To read from a contract:**
- The contract must be verified on the Rootstock explorer
- Verification provides the ABI needed to interact with functions

**Solutions:**
1. **Verify the contract first** using the \`verify-contract\` function
2. **Check if you have the correct address** - make sure it's deployed
3. **Wait for verification** if recently submitted

**Verification Benefits:**
- Enables function calls through this interface
- Shows readable source code on explorer
- Increases trust and transparency

Would you like to verify this contract first?`;
}

export function returnAvailableFunctions(content: string, functions: any[] = []) {
  if (functions.length === 0) return content;

  const functionList = functions.map((func, index) => {
    const inputs = func.inputs?.map((input: any) => `${input.name}: ${input.type}`).join(", ") || "";
    const outputs = func.outputs?.map((output: any) => output.type).join(", ") || "void";
    return `${index + 1}. **${func.name}**(${inputs}) → ${outputs}`;
  }).join("\n");

  return `📋 **Available Read Functions**

The contract has the following view/pure functions available:

${functionList}

**To call a function:**
- Use the exact function name
- Provide arguments in the correct order if required
- Only view/pure functions can be called (no gas fees)

**Example:**
\`\`\`json
{
  "contractAddress": "0x...",
  "functionName": "balanceOf",
  "functionArgs": ["0x1234..."]
}
\`\`\`

Which function would you like to call?`;
}

export function returnErrorNoReadFunctions() {
  return "This contract has no view/pure functions available for reading.";
}