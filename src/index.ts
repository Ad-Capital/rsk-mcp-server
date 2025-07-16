import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { walletCommand } from "@rsksmart/rsk-cli/dist/src/commands/wallet.js";
import { balanceCommand } from "@rsksmart/rsk-cli/dist/src/commands/balance.js";
import { txCommand } from "@rsksmart/rsk-cli/dist/src/commands/tx.js";
import { deployCommand } from "@rsksmart/rsk-cli/dist/src/commands/deploy.js";
import { verifyCommand } from "@rsksmart/rsk-cli/dist/src/commands/verify.js";
import { ReadContract } from "@rsksmart/rsk-cli/dist/src/commands/contract.js";
import { createWalletOptions } from "./tools/constants.js";
import {
  checkBalanceSchema,
  checkTransactionSchema,
  createWalletSchema,
  deployContractSchema,
  readContractSchema,
  useWalletFromCreationSchema,
  verifyContractSchema,
} from "./tools/schemas.js";
import { extractPasswordFromFile } from "./tools/handlers.js";
import { provideResponse } from "./handlers/responsesHandler.js";
import { ResponseType } from "./tools/types.js";
import {
  returnABIContentRequired,
  returnBytecodeContentRequired,
  returnCheckBalanceSuccess,
  returnContractAddressRequired,
  returnContractDeployedSuccessfully,
  returnContractNameRequired,
  returnContractReadSuccessfully,
  returnContractVerifiedSuccessfully,
  returnCustomTokenAddress,
  returnErrorInvalidWalletData,
  returnErrorMissingInfo,
  returnErrorMissingWalletData,
  returnErrorMissingWalletPassword,
  returnErrorNoReadFunctions,
  returnErrorTryAgain,
  returnErrorTxNotFound,
  returnFunctionNameRequired,
  returnJSONContentRequired,
  returnReplaceCurrentWallet,
  returnSecurePasswordMethod,
  returnToCheckBalance,
  returnToDeployContract,
  returnToReadContract,
  returnToVerifyContract,
  returnTokenSelectionOptions,
  returnTransactionFound,
  returnWalletConfigurationFile,
  returnWalletCreatedSuccessfully,
  returnWalletName,
} from "./utils/responses.js";

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
    return provideResponse(optionsText, ResponseType.Interaction);
  }
);

server.tool(
  "create-wallet",
  "Create a new wallet based on the selected option. This function will ask for required information step by step.",
  createWalletSchema.shape,
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
          return provideResponse(passwordResult.error, ResponseType.ErrorReadingPasswordFile);
        }
        finalPassword = passwordResult.password;
      }

      const missingInfo = [];

      if (!finalPassword) {
        missingInfo.push(returnSecurePasswordMethod());
      }

      if (!walletName) {
        missingInfo.push(
          returnWalletName()
        );
      }

      if (replaceCurrentWallet === undefined) {
        missingInfo.push(returnReplaceCurrentWallet());
      }

      if (walletOption === "🔑 Import existing wallet" && !walletData) {
        missingInfo.push(returnWalletConfigurationFile());
      }

      if (missingInfo.length > 0) {
        return provideResponse(returnErrorMissingInfo(walletOption, missingInfo), ResponseType.ErrorMissingInfo);
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
        return provideResponse(
          returnWalletCreatedSuccessfully(walletOption, [
            JSON.stringify(commandResult, null, 2),
            walletConfigJson,
          ]),
          ResponseType.WalletCreatedSuccessfully
        );
      }

      return provideResponse(
        returnErrorTryAgain(walletOption, [
          commandResult?.error || "Unknown error occurred",
        ]),
        ResponseType.ErrorTryAgain
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return provideResponse(
        returnErrorTryAgain(walletOption, [
          errorMsg || "Unknown error occurred",
        ]),
        ResponseType.ErrorTryAgain
      );
    }
  }
);

server.tool(
  "check-balance",
  "Check the balance of a wallet for RBTC or ERC20 tokens on Rootstock blockchain. You can either use an existing wallet file or provide wallet data directly.",
  checkBalanceSchema.shape,
  async ({ testnet, walletName, token, customTokenAddress, walletData }) => {
    try {
      const missingInfo = [];

      if (!token) {
        missingInfo.push(returnTokenSelectionOptions());
      }

      if (token === "Custom Token" && !customTokenAddress) {
        missingInfo.push(returnCustomTokenAddress());
      }

      if (missingInfo.length > 0) {
        return provideResponse(
          returnToCheckBalance("", missingInfo),
          ResponseType.ToCheckBalance
        );
      }

      let processedWalletData = walletData;
      if (typeof walletData === "string") {
        try {
          processedWalletData = JSON.parse(walletData);
        } catch (error) {
          return provideResponse(
            returnErrorInvalidWalletData(
              error instanceof Error ? error.message : String(error)
            ),
            ResponseType.ErrorInvalidWalletData
          );
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

        return provideResponse(
          returnCheckBalanceSuccess("", data),
          ResponseType.CheckBalanceSuccess
        );
      }

      return provideResponse(
        result?.error || "Unknown error occurred",
        ResponseType.ErrorCheckingBalance
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return provideResponse(
        errorMsg,
        ResponseType.ErrorCheckingBalance
      );
      
    }
  }
);

server.tool(
  "use-wallet-from-creation",
  "Use wallet data directly from a previous wallet creation result. This helps avoid re-uploading files.",
  useWalletFromCreationSchema.shape,
  async ({ testnet, token, customTokenAddress, walletCreationResult }) => {
    try {
      let walletResult;
      try {
        walletResult = JSON.parse(walletCreationResult);
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ **Invalid wallet creation result format**

Please provide the complete JSON result from when you created the wallet.

Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }

      const walletData = walletResult.walletsData;
      if (!walletData || !walletData.wallets || !walletData.currentWallet) {
        return {
          content: [
            {
              type: "text",
              text: `❌ **Invalid wallet data structure**

The wallet creation result doesn't contain valid wallet data. Please ensure you're using the complete result from create-wallet.`,
            },
          ],
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

Please verify your wallet configuration and try again.`,
          },
        ],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `❌ **Error processing wallet data**

Error: ${errorMsg}

Please ensure you're providing the complete wallet creation result.`,
          },
        ],
      };
    }
  }
);

server.tool(
  "check-transaction",
  "Check the status and details of a transaction on Rootstock blockchain using the transaction hash",
  checkTransactionSchema.shape,
  async ({ testnet, txid }) => {
    try {
      if (!txid || txid.trim().length === 0) {
        return provideResponse(
          "",
          ResponseType.ErrorTXIdRequired
        );
      }

      const cleanTxid = txid.trim();

      const txidRegex = /^(0x)?[a-fA-F0-9]{64}$/;
      if (!txidRegex.test(cleanTxid)) {
        return provideResponse(
          cleanTxid,
          ResponseType.ErrorTXHashInvalid
        );
      }

      const result = await txCommand(testnet, cleanTxid, true);

      if (result?.success && result.data) {
        const { data } = result;

        return provideResponse(
          returnTransactionFound(testnet ? "testnet" : "mainnet", data),
          ResponseType.TransactionFound
        );
      }

      return provideResponse(
        returnErrorTxNotFound(
          result?.error || "Transaction not found or unknown error occurred",
          [testnet ? "testnet" : "mainnet"]
        ),
        ResponseType.ErrorTxNotFound
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return provideResponse(
        errorMsg,
        ResponseType.ErrorCheckingTransaction
      );
    }
  }
);

server.tool(
  "deploy-contract",
  "Deploy a smart contract to the Rootstock blockchain using ABI and bytecode",
  deployContractSchema.shape,
  async ({ testnet, abiContent, bytecodeContent, constructorArgs, walletName, walletData, walletPassword }) => {
    try {
      const missingInfo = [];

      if (!abiContent) {
        missingInfo.push(returnABIContentRequired());
      }

      if (!bytecodeContent) {
        missingInfo.push(returnBytecodeContentRequired());
      }

      if (!walletData && !walletName) {
        missingInfo.push(returnErrorMissingWalletData());
      }

      if (walletData && !walletPassword) {
        missingInfo.push(returnErrorMissingWalletPassword());
      }

      if (missingInfo.length > 0) {
        return provideResponse(
          returnToDeployContract("", missingInfo),
          ResponseType.ToDeployContract
        );
      }

      let parsedABI;
      try {
        parsedABI = JSON.parse(abiContent);
        if (!Array.isArray(parsedABI)) {
          return provideResponse(
            "ABI must be a JSON array",
            ResponseType.ErrorInvalidABI
          );
        }
      } catch (error) {
        return provideResponse(
          error instanceof Error ? error.message : String(error),
          ResponseType.ErrorInvalidABI
        );
      }

      let cleanBytecode = bytecodeContent.trim();
      if (!cleanBytecode.startsWith("0x")) {
        cleanBytecode = `0x${cleanBytecode}`;
      }

      const bytecodeRegex = /^0x[a-fA-F0-9]+$/;
      if (!bytecodeRegex.test(cleanBytecode)) {
        return provideResponse(
          cleanBytecode,
          ResponseType.ErrorInvalidBytecode
        );
      }

      let processedWalletData = walletData;
      if (typeof walletData === "string") {
        try {
          processedWalletData = JSON.parse(walletData);
        } catch (error) {
          return provideResponse(
            error instanceof Error ? error.message : String(error),
            ResponseType.ErrorInvalidWalletData
          );
        }
      }

      const result = await deployCommand(
        JSON.stringify(parsedABI),
        cleanBytecode,
        testnet,
        constructorArgs || [],
        walletName,
        true,
        processedWalletData,
        walletPassword
      );

      if (result?.success && result.data) {
        const { data } = result;

        return provideResponse(
          returnContractDeployedSuccessfully("", data),
          ResponseType.ContractDeployedSuccessfully
        );
      }

      return provideResponse(
        result?.error || "Contract deployment failed with unknown error",
        ResponseType.ErrorDeployingContract
      );
    } catch (error) {
      return provideResponse(
        error instanceof Error ? error.message : String(error),
        ResponseType.ErrorDeployingContract
      );
    }
  }
);

server.tool(
  "verify-contract",
  "Verify a smart contract on the Rootstock blockchain using source code and compilation metadata",
  verifyContractSchema.shape,
  async ({ testnet, contractAddress, contractName, jsonContent, constructorArgs }) => {
    try {
      const missingInfo = [];

      if (!contractAddress) {
        missingInfo.push(returnContractAddressRequired());
      }

      if (!contractName) {
        missingInfo.push(returnContractNameRequired());
      }

      if (!jsonContent) {
        missingInfo.push(returnJSONContentRequired());
      }

      if (missingInfo.length > 0) {
        return provideResponse(
          returnToVerifyContract("", missingInfo),
          ResponseType.ToVerifyContract
        );
      }

      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!addressRegex.test(contractAddress)) {
        return provideResponse(
          contractAddress,
          ResponseType.ErrorInvalidContractAddress
        );
      }

      let parsedJSON;
      try {
        parsedJSON = JSON.parse(jsonContent);
        if (!parsedJSON.hasOwnProperty("solcLongVersion") || !parsedJSON.hasOwnProperty("input")) {
          return provideResponse(
            "Missing required fields: solcLongVersion and input",
            ResponseType.ErrorInvalidJSON
          );
        }
      } catch (error) {
        return provideResponse(
          error instanceof Error ? error.message : String(error),
          ResponseType.ErrorInvalidJSON
        );
      }

      // Call verify command
      const result = await verifyCommand(
        jsonContent,           // jsonPath parameter contains JSON content when _isExternal is true
        contractAddress,
        contractName,
        testnet,
        constructorArgs || [],
        true                   // _isExternal = true
      );

      if (result?.success && result.data) {
        const { data } = result;

        return provideResponse(
          returnContractVerifiedSuccessfully("", data),
          ResponseType.ContractVerifiedSuccessfully
        );
      }

      return provideResponse(
        result?.error || "Contract verification failed with unknown error",
        ResponseType.ErrorVerifyingContract
      );
    } catch (error) {
      return provideResponse(
        error instanceof Error ? error.message : String(error),
        ResponseType.ErrorVerifyingContract
      );
    }
  }
);

server.tool(
  "read-contract",
  "Read data from a verified smart contract on the Rootstock blockchain by calling view/pure functions",
  readContractSchema.shape,
  async ({ testnet, contractAddress, functionName, functionArgs }) => {
    try {
      const missingInfo = [];

      if (!contractAddress) {
        missingInfo.push(returnContractAddressRequired());
      }

      if (missingInfo.length > 0) {
        return provideResponse(
          returnToReadContract("", missingInfo),
          ResponseType.ToReadContract
        );
      }

      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!addressRegex.test(contractAddress)) {
        return provideResponse(
          contractAddress,
          ResponseType.ErrorInvalidContractAddress
        );
      }

      const result = await ReadContract(
        contractAddress,
        testnet,
        true,
        functionName,
        functionArgs
      );

      if (result?.success && result.data) {
        const { data } = result;

        return provideResponse(
          returnContractReadSuccessfully("", data),
          ResponseType.ContractReadSuccessfully
        );
      }

      if (result?.error) {
        if (result.error.includes("verification not found") || result.error.includes("not verified")) {
          return provideResponse(
            contractAddress,
            ResponseType.ErrorContractNotVerified
          );
        }

        if (result.error.includes("Function name is required")) {
          return provideResponse(
            returnFunctionNameRequired(),
            ResponseType.ToReadContract
          );
        }

        if (result.error.includes("No read functions found")) {
          return provideResponse(
            returnErrorNoReadFunctions(),
            ResponseType.ErrorReadingContract
          );
        }
      }

      return provideResponse(
        result?.error || "Contract reading failed with unknown error",
        ResponseType.ErrorReadingContract
      );
    } catch (error) {
      return provideResponse(
        error instanceof Error ? error.message : String(error),
        ResponseType.ErrorReadingContract
      );
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