import { transferCommand } from "@rsksmart/rsk-cli/dist/src/commands/transfer.js";

interface TransferParams {
  testnet: boolean;
  toAddress: string;
  value: number;
  tokenAddress?: string;
  walletName?: string;
  walletData?: any;
  walletPassword?: string;
}

interface TransferResult {
  success: boolean;
  data?: any;
  error?: string;
  responseType: string;
}

export class TransferService {
  async processTransfer(params: TransferParams): Promise<TransferResult> {
    try {
      const missingInfo = [];

      if (!params.toAddress) {
        missingInfo.push("🎯 **Recipient Address**: Enter the recipient's address (0x... format)");
      }

      if (!params.value || params.value <= 0) {
        missingInfo.push("💰 **Transfer Amount**: Enter a positive amount to transfer");
      }

      if (!params.walletData && !params.walletName) {
        missingInfo.push("💼 **Wallet Information**: Provide wallet data or wallet name");
      }

      if (params.walletData && !params.walletPassword) {
        missingInfo.push("🔒 **Wallet Password**: Password is required to decrypt your wallet");
      }

      if (params.toAddress && !/^0x[a-fA-F0-9]{40}$/.test(params.toAddress)) {
        return {
          success: false,
          error: `❌ **Invalid Recipient Address**\n\nThe address "${params.toAddress}" is not a valid Ethereum address format.\n\n**Expected format**: 0x followed by 40 hexadecimal characters\n**Example**: 0x1234567890abcdef1234567890abcdef12345678`,
          responseType: "ErrorInvalidAddress"
        };
      }

      if (params.tokenAddress && !/^0x[a-fA-F0-9]{40}$/.test(params.tokenAddress)) {
        return {
          success: false,
          error: `❌ **Invalid Token Address**\n\nThe token address "${params.tokenAddress}" is not a valid contract address format.\n\n**Expected format**: 0x followed by 40 hexadecimal characters\n**Example**: 0x1234567890abcdef1234567890abcdef12345678`,
          responseType: "ErrorInvalidTokenAddress"
        };
      }

      if (missingInfo.length > 0) {
        return {
          success: false,
          error: this.formatMissingInfoError(missingInfo),
          responseType: "ErrorMissingInfo"
        };
      }

      let processedWalletData = params.walletData;
      if (typeof params.walletData === "string") {
        try {
          processedWalletData = JSON.parse(params.walletData);
        } catch (error) {
          return {
            success: false,
            error: `❌ **Invalid Wallet Data Format**\n\nError parsing wallet data: ${error instanceof Error ? error.message : String(error)}\n\nPlease provide valid JSON wallet data.`,
            responseType: "ErrorInvalidWalletData"
          };
        }
      }

      const transferParams = {
        testnet: params.testnet,
        toAddress: params.toAddress,
        value: params.value,
        tokenAddress: params.tokenAddress,
        name: params.walletName,
        walletsData: processedWalletData,
        password: params.walletPassword,
        isExternal: true
      };

      const result = await transferCommand(transferParams);

      if (result?.success && result.data) {
        return {
          success: true,
          data: result.data,
          responseType: "TransferCompletedSuccessfully"
        };
      }

      return {
        success: false,
        error: result?.error || "Transfer failed with unknown error",
        responseType: "ErrorTransferFailed"
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        responseType: "ErrorTransferFailed"
      };
    }
  }

  private formatMissingInfoError(missingInfo: string[]): string {
    return `❌ **Missing Required Information**\n\nTo complete the transfer, please provide the following:\n\n${missingInfo.map(info => `• ${info}`).join('\n')}\n\nOnce you provide all required information, try the transfer again.`;
  }

  formatTransferResponse(data: any): string {
    const networkName = data.network || (data.testnet ? "Rootstock Testnet" : "Rootstock Mainnet");
    const tokenInfo = data.token === "RBTC" ? "RBTC" : `${data.token} tokens`;
    
    return `✅ **Transfer Completed Successfully!**

💸 **Transfer Details:**
• **Amount**: ${data.amount} ${data.token}
• **From**: ${data.from}
• **To**: ${data.to}
• **Network**: ${networkName}

📦 **Transaction Details:**
• **Transaction Hash**: \`${data.transactionHash}\`
• **Block Number**: ${data.blockNumber}
• **Gas Used**: ${data.gasUsed}

🔗 **View on Explorer**: [${data.transactionHash}](${data.explorerUrl})

✨ Your ${tokenInfo} ${data.token === "RBTC" ? "has" : "have"} been successfully transferred!`;
  }

  formatTransferErrorResponse(error: string): string {
    if (error.includes("Insufficient balance")) {
      return `❌ **Insufficient Balance**

${error}

💡 **Suggestions:**
• Check your current balance using the check-balance tool
• Ensure you have enough tokens/RBTC for the transfer
• Remember that gas fees are deducted from RBTC balance for all transfers

🔄 Please verify your balance and try again with a valid amount.`;
    }

    if (error.includes("not a valid ERC20 token")) {
      return `❌ **Invalid Token Contract**

${error}

💡 **Suggestions:**
• Verify the token contract address is correct
• Ensure the address is a valid ERC20 token contract
• Check the token address on the blockchain explorer

🔄 Please provide a valid ERC20 token address and try again.`;
    }

    return `❌ **Transfer Failed**

${error}

💡 **Common Issues:**
• Invalid recipient address format
• Insufficient balance (including gas fees)
• Network connectivity issues
• Invalid token contract address

🔄 Please check the transfer details and try again.`;
  }
}