import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { walletCommand } from "@rsksmart/rsk-cli/dist/src/commands/wallet.js";
import { balanceCommand } from "@rsksmart/rsk-cli/dist/src/commands/balance.js";

const createWalletOptions = [
  "🆕 Create a new wallet",
  "🔑 Import existing wallet",
  "🔍 List saved wallets",
  "🔁 Switch wallet",
  "📝 Update wallet name",
  "📂 Backup wallet data",
  "❌ Delete wallet",
  "📖 Address Book",
] as const;
type WalletData = {
  wallets: {
    [key: string]: WalletItem;
  };
  currentWallet: string;
};
type WalletItem = {
  address: string;
  encryptedPrivateKey: string;
  iv: string;
};

function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 6 || password.length > 20) {
    return {
      valid: false,
      error: "Password must be between 6 and 20 characters",
    };
  }

  const safePasswordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
  if (!safePasswordRegex.test(password)) {
    return {
      valid: false,
      error:
        "Password contains invalid characters. Use only letters, numbers, and safe symbols",
    };
  }

  const dangerousPatterns = [
    /script/i,
    /select/i,
    /insert/i,
    /delete/i,
    /drop/i,
    /union/i,
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /eval\(/i,
    /exec\(/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(password)) {
      return {
        valid: false,
        error: "Password contains potentially unsafe content",
      };
    }
  }

  return { valid: true };
}

function extractPasswordFromFile(fileContent: string): {
  password?: string;
  error?: string;
} {
  try {
    const jsonData = JSON.parse(fileContent);

    if (typeof jsonData !== "object" || jsonData === null) {
      return { error: "Invalid JSON format. Must be an object." };
    }

    if (!jsonData.password) {
      return {
        error:
          'Password field not found in JSON. Expected format: {"password": "yourpassword"}',
      };
    }

    if (typeof jsonData.password !== "string") {
      return { error: "Password must be a string value" };
    }

    const validation = validatePassword(jsonData.password);
    if (!validation.valid) {
      return { error: `Invalid password: ${validation.error}` };
    }

    return { password: jsonData.password };
  } catch (error) {
    return { error: "Invalid JSON format. Please check your file syntax." };
  }
}

const server = new McpServer({
  name: "devx-mcp-server",
  version: "0.0.1",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "start-interaction",
  "Start interaction with the Rootstock CLI functions, start this once someone ask something related to the rootstock (rsk) blockchain",
  {},
  async () => {
    const optionsText = createWalletOptions
      .map((option, index) => `${index + 1}. ${option}`)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Let's start interacting with the Rootstock CLI functions! 

                First, we need to create a wallet, then we can start interacting with the blockchain.

                Please choose one of the following wallet creation options:

                ${optionsText}

                Which option would you like to use?`,
        },
      ],
    };
  }
);

server.tool(
  "create-wallet",
  "Create a new wallet based on the selected option. This function will ask for required information step by step.",
  {
    walletOption: z
      .enum(createWalletOptions)
      .describe("The wallet creation option selected by the user"),
    walletPassword: z
      .string()
      .optional()
      .describe(
        "The password for the wallet - or upload a JSON file with password field"
      ),
    passwordFile: z
      .string()
      .optional()
      .describe(
        'JSON file content with password field - format: {"password": "yourpassword"}'
      ),
    walletData: z
      .custom<WalletData>()
      .optional()
      .describe(
        "Your previously saved wallet configuration file content (my-wallets.json) - required for importing existing wallets"
      ),
    walletName: z
      .string()
      .optional()
      .describe(
        "The name for the new wallet - will be requested if not provided"
      ),
    replaceCurrentWallet: z
      .boolean()
      .optional()
      .describe(
        "Whether to replace current wallet - will be requested if not provided"
      ),
  },
  async ({
    walletOption,
    walletPassword,
    passwordFile,
    walletData,
    walletName,
    replaceCurrentWallet,
  }) => {
    try {
      let finalPassword = walletPassword;

      if (passwordFile && !walletPassword) {
        const passwordResult = extractPasswordFromFile(passwordFile);
        if (passwordResult.error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Error reading password file: ${passwordResult.error}

Please check your JSON file format and try again.`,
              },
            ],
          };
        }
        finalPassword = passwordResult.password;
      }

      const missingInfo = [];

      if (!finalPassword) {
        missingInfo.push(`🔒 **Secure Password Method**: 
         
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

**OR** provide password directly (⚠️ less secure - visible in chat)`);
      }

      if (!walletName) {
        missingInfo.push(
          "📝 **Wallet Name**: Please provide a name for your wallet (e.g., 'MyRootstockWallet')"
        );
      }

      if (replaceCurrentWallet === undefined) {
        missingInfo.push(
          "🔄 **Replace Current Wallet**: Do you want to set this as your main wallet? (true/false)"
        );
      }

      if (walletOption === "🔑 Import existing wallet" && !walletData) {
        missingInfo.push(`📁 **Wallet Configuration File**: 
         
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

**OR** if importing a single wallet, provide the private key directly.`);
      }

      if (missingInfo.length > 0) {
        return {
          content: [
            {
              type: "text",
              text: `To proceed with "${walletOption}", I need the following information:

${missingInfo.map((info, index) => `${index + 1}. ${info}`).join("\n")}

Please call the create-wallet function again with these parameters filled in.`,
            },
          ],
        };
      }

      const commandResult = await walletCommand(
        walletOption,
        finalPassword,
        walletData,
        walletName,
        replaceCurrentWallet
      );
      if (commandResult?.success) {
        const walletConfigJson = JSON.stringify(
          commandResult.walletsData,
          null,
          2
        );

        return {
          content: [
            {
              type: "text",
              text: `✅ Successfully executed: ${walletOption}

**🎉 Wallet Created Successfully!**

**📄 Wallet Details:**
${JSON.stringify(commandResult, null, 2)}

**📁 IMPORTANT: Save Your Wallet Configuration**

Please save the following JSON content to a file (e.g., \`my-wallets.json\`):

\`\`\`json
${walletConfigJson}
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

Your wallet operation has been completed. What would you like to do next?`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to execute: ${walletOption}

Error: ${commandResult?.error || "Unknown error occurred"}

Please try again or select a different option.`,
          },
        ],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to execute: ${walletOption}

Error: ${errorMsg}

Please try again or select a different option.`,
          },
        ],
      };
    }
  }
);

server.tool(
  "check-balance",
  "Check the balance of a wallet for RBTC or ERC20 tokens on Rootstock blockchain. You can either use an existing wallet file or provide wallet data directly.",
  {
    testnet: z.boolean().describe("Use testnet (true) or mainnet (false)"),
    walletName: z
      .string()
      .optional()
      .describe(
        "Specific wallet name to check balance for - uses current wallet if not provided"
      ),
    token: z
      .string()
      .optional()
      .describe(
        "Token to check balance for (rBTC, USDT, DOC, BPRO, RIF, FISH, Custom Token, etc.)"
      ),
    customTokenAddress: z
      .string()
      .optional()
      .describe(
        "Custom token contract address - required if token is 'Custom Token'"
      ),
    walletData: z
      .union([z.custom<WalletData>(), z.string()])
      .optional()
      .describe(
        "Your previously saved wallet configuration file content (my-wallets.json) - can be a JSON object or string - required if you want to use specific wallet data"
      ),
  },
  async ({ testnet, walletName, token, customTokenAddress, walletData }) => {
    try {
      const missingInfo = [];

      if (!token) {
        missingInfo.push(`💰 **Token Selection**: Please specify which token to check balance for.
        
**Available options:**
- \`rBTC\` - Rootstock Bitcoin (native token)
- \`USDT\` - Tether USD 
- \`DOC\` - Dollar on Chain
- \`BPRO\` - BitPro
- \`RIF\` - RSK Infrastructure Framework
- \`FISH\` - Fish Token
- \`Custom Token\` - Specify your own token address

**Example:** "rBTC" or "USDT"`);
      }

      if (token === "Custom Token" && !customTokenAddress) {
        missingInfo.push(`📄 **Custom Token Address**: Please provide the contract address for your custom token.
         
**Example:** "0x1234567890abcdef1234567890abcdef12345678"`);
      }

      if (missingInfo.length > 0) {
        return {
          content: [
            {
              type: "text",
              text: `To check balance, I need the following information:

${missingInfo.map((info, index) => `${index + 1}. ${info}`).join("\n")}

Please call the check-balance function again with these parameters filled in.`,
            },
          ],
        };
      }

      let processedWalletData = walletData;
      if (typeof walletData === 'string') {
        try {
          processedWalletData = JSON.parse(walletData);
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ **Invalid wallet data format**

The walletData provided is not valid JSON. Please ensure it's properly formatted.

Error: ${error instanceof Error ? error.message : String(error)}

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
\`\`\``,
              },
            ],
          };
        }
      }

      const result = await balanceCommand(
        testnet,
        walletName,
        undefined,
        true,
        token,
        customTokenAddress,
        processedWalletData
      );

      if (result?.success && result.data) {
        const { data } = result;

        return {
          content: [
            {
              type: "text",
              text: `✅ **Balance Retrieved Successfully**

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

What would you like to do next?`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `❌ **Failed to check balance**

Error: ${result?.error || "Unknown error occurred"}

Please verify:
- Your wallet exists and is properly configured
- The token address is correct (if using custom token)
- You're connected to the correct network

**If you don't have a wallet file locally:**
- Upload your wallet configuration file (my-wallets.json) content using the \`walletData\` parameter
- Or create a wallet first using the \`create-wallet\` function

Try again or check your wallet configuration.`,
          },
        ],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `❌ **Error checking balance**

Error: ${errorMsg}

Please try again or check your wallet setup.`,
          },
        ],
      };
    }
  }
);

server.tool(
  "use-wallet-from-creation",
  "Use wallet data directly from a previous wallet creation result. This helps avoid re-uploading files.",
  {
    testnet: z.boolean().describe("Use testnet (true) or mainnet (false)"),
    token: z.string().describe("Token to check balance for (rBTC, USDT, DOC, BPRO, RIF, FISH, Custom Token, etc.)"),
    customTokenAddress: z.string().optional().describe("Custom token contract address - required if token is 'Custom Token'"),
    walletCreationResult: z.string().describe("The complete JSON result from create-wallet function including walletsData")
  },
  async ({ testnet, token, customTokenAddress, walletCreationResult }) => {
    try {
      let walletResult;
      try {
        walletResult = JSON.parse(walletCreationResult);
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ **Invalid wallet creation result format**

Please provide the complete JSON result from when you created the wallet.

Error: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }

      const walletData = walletResult.walletsData;
      if (!walletData || !walletData.wallets || !walletData.currentWallet) {
        return {
          content: [{
            type: "text",
            text: `❌ **Invalid wallet data structure**

The wallet creation result doesn't contain valid wallet data. Please ensure you're using the complete result from create-wallet.`
          }]
        };
      }

      const result = await balanceCommand(
        testnet,
        undefined,
        undefined,
        true,
        token,
        customTokenAddress,
        walletData
      );

      if (result?.success && result.data) {
        const { data } = result;
        
        return {
          content: [{
            type: "text",
            text: `✅ **Balance Retrieved Successfully**

💰 **Balance**: ${data.balance} ${data.symbol}
📄 **Wallet Address**: ${data.walletAddress}
🌐 **Network**: ${data.network}
🔗 **Token Type**: ${data.tokenType}${data.tokenName ? `
📝 **Token Name**: ${data.tokenName}
📄 **Contract**: ${data.tokenContract}
🔢 **Decimals**: ${data.decimals}` : ''}

**Note**: Ensure that transactions are being conducted on the correct network.

What would you like to do next?`
          }]
        };
      }

      return {
        content: [{
          type: "text",
          text: `❌ **Failed to check balance**

Error: ${result?.error || "Unknown error occurred"}

Please verify your wallet configuration and try again.`
        }]
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        content: [{
          type: "text",
          text: `❌ **Error processing wallet data**

Error: ${errorMsg}

Please ensure you're providing the complete wallet creation result.`
        }]
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DevX MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
