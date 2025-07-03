import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { walletCommand } from "@rsksmart/rsk-cli/dist/src/commands/wallet.js";

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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DevX MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
