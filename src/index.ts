import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { balanceCommand } from "@rsksmart/rsk-cli/dist/src/commands/balance.js";
import { txCommand } from "@rsksmart/rsk-cli/dist/src/commands/tx.js";
import { createWalletOptions, generalInteractionOptions } from "./tools/constants.js";
import {
  checkBalanceSchema,
  checkTransactionSchema,
  createWalletSchema,
  deployContractSchema,
  readContractSchema,
  transferTokenSchema,
  useWalletFromCreationSchema,
  verifyContractSchema,
} from "./tools/schemas.js";
import { provideResponse } from "./handlers/responsesHandler.js";
import { ResponseType } from "./tools/types.js";
import { WalletService } from "./services/WalletService.js";
import { ContractDeploymentService } from "./services/ContractDeploymentService.js";
import { ContractVerificationService } from "./services/ContractVerificationService.js";
import { ContractReadService } from "./services/ContractReadService.js";
import { TransferService } from "./services/TransferService.js";
import {
  returnCheckBalanceSuccess,
  returnContractDeployedSuccessfully,
  returnContractReadSuccessfully,
  returnContractVerifiedSuccessfully,
  returnCustomTokenAddress,
  returnErrorInvalidWalletData,
  returnErrorTxNotFound,
  returnToCheckBalance,
  returnTokenSelectionOptions,
  returnTransactionFound,
  returnTransferCompletedSuccessfully,
  returnWalletCreatedSuccessfully,
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
    const optionsText = generalInteractionOptions
      .map((option, index) => `${index + 1}. ${option} \n`)
      .join("\n");
    return provideResponse(optionsText, ResponseType.Interaction);
  }
);

server.tool(
  "start-wallet-interaction", 
  "Start wallet management interaction. This shows all available wallet operations and management options.",
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
    privateKey,
    newMainWallet,
    previousWallet,
    newWalletName,
    deleteWalletName,
  }) => {
    if (!createWalletOptions.includes(walletOption as any)) {
      return provideResponse(
        `❌ **Invalid Option**\n\nThe option "${walletOption}" is not recognized. Please select a valid option.`,
        ResponseType.ErrorTryAgain
      );
    }

    const walletService = new WalletService();

    const result = await walletService.processWalletOperation({
      walletOption,
      walletPassword,
      passwordFile,
      walletData,
      walletName,
      replaceCurrentWallet,
      privateKey,
      newMainWallet,
      previousWallet,
      newWalletName,
      deleteWalletName,
    });

    if (result.success) {
      const responseType = result.responseType as keyof typeof ResponseType;
      return provideResponse(
        returnWalletCreatedSuccessfully(walletOption, [
          result.data.result,
          result.data.walletConfig,
        ]),
        ResponseType[responseType] || ResponseType.WalletCreatedSuccessfully
      );
    } else {
      const responseType = result.responseType as keyof typeof ResponseType;
      return provideResponse(
        result.error || "Unknown error occurred",
        ResponseType[responseType] || ResponseType.ErrorTryAgain
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
      const walletService = new WalletService();

      const result = await walletService.checkBalanceFromCreation({
        testnet,
        token,
        customTokenAddress,
        walletCreationResult,
      });

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: walletService.formatBalanceFromCreationResponse(result.data),
            },
          ],
        };
      } else {
        const isParsingError = result.error?.includes("Invalid wallet creation result format") || 
                              result.error?.includes("Invalid wallet data structure");
        
        return {
          content: [
            {
              type: "text",
              text: walletService.formatErrorFromCreationResponse(result.error!, isParsingError),
            },
          ],
        };
      }
    } catch (error) {
      const walletService = new WalletService();
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
    const deploymentService = new ContractDeploymentService();

    const result = await deploymentService.processContractDeployment({
      testnet,
      abiContent,
      bytecodeContent,
      constructorArgs,
      walletName,
      walletData,
      walletPassword,
    });

    if (result.success) {
      const responseType = result.responseType as keyof typeof ResponseType;
      return provideResponse(
        returnContractDeployedSuccessfully("", result.data),
        ResponseType[responseType] || ResponseType.ContractDeployedSuccessfully
      );
    } else {
      const responseType = result.responseType as keyof typeof ResponseType;
      return provideResponse(
        result.error || "Contract deployment failed with unknown error",
        ResponseType[responseType] || ResponseType.ErrorDeployingContract
      );
    }
  }
);

server.tool(
  "verify-contract",
  "Verify a smart contract on the Rootstock blockchain using source code and compilation metadata",
  verifyContractSchema.shape,
  async ({ testnet, contractAddress, contractName, jsonContent, constructorArgs }) => {
    const verificationService = new ContractVerificationService();

    const result = await verificationService.processContractVerification({
      testnet,
      contractAddress,
      contractName,
      jsonContent,
      constructorArgs,
    });

    if (result.success) {
      const responseType = result.responseType as keyof typeof ResponseType;
      return provideResponse(
        returnContractVerifiedSuccessfully("", result.data),
        ResponseType[responseType] || ResponseType.ContractVerifiedSuccessfully
      );
    } else {
      const responseType = result.responseType as keyof typeof ResponseType;
      return provideResponse(
        result.error || "Contract verification failed with unknown error",
        ResponseType[responseType] || ResponseType.ErrorVerifyingContract
      );
    }
  }
);

server.tool(
  "read-contract",
  "Read data from a verified smart contract on the Rootstock blockchain by calling view/pure functions",
  readContractSchema.shape,
  async ({ testnet, contractAddress, functionName, functionArgs }) => {
    const contractReadService = new ContractReadService();

    const result = await contractReadService.processContractRead({
      testnet,
      contractAddress,
      functionName,
      functionArgs,
    });

    if (result.success) {
      const responseType = result.responseType as keyof typeof ResponseType;
      return provideResponse(
        returnContractReadSuccessfully("", result.data),
        ResponseType[responseType] || ResponseType.ContractReadSuccessfully
      );
    } else {
      const responseType = result.responseType as keyof typeof ResponseType;
      return provideResponse(
        result.error || "Contract reading failed with unknown error",
        ResponseType[responseType] || ResponseType.ErrorReadingContract
      );
    }
  }
);

server.tool(
  "transfer-tokens",
  "Transfer RBTC or ERC20 tokens on Rootstock blockchain between wallets",
  transferTokenSchema.shape,
  async ({ testnet, toAddress, value, tokenAddress, walletName, walletData, walletPassword }) => {
    const transferService = new TransferService();

    const result = await transferService.processTransfer({
      testnet,
      toAddress,
      value,
      tokenAddress,
      walletName,
      walletData,
      walletPassword,
    });

    if (result.success) {
      const networkName = result.data.network || (testnet ? "Rootstock Testnet" : "Rootstock Mainnet");
      const responseType = result.responseType as keyof typeof ResponseType;
      
      return provideResponse(
        returnTransferCompletedSuccessfully(networkName, result.data),
        ResponseType[responseType] || ResponseType.TransferCompletedSuccessfully
      );
    } else {
      const responseType = result.responseType as keyof typeof ResponseType;
      return provideResponse(
        result.error || "Transfer failed with unknown error",
        ResponseType[responseType] || ResponseType.ErrorTransferFailed
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