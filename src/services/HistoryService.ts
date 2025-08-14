import { historyCommand } from "@rsksmart/rsk-cli/dist/src/commands/history.js";

interface HistoryParams {
  testnet: boolean;
  apiKey?: string;
  number?: string;
  walletData?: any;
}

interface HistoryResult {
  success: boolean;
  data?: any;
  error?: string;
  responseType: string;
}

export class HistoryService {
  async processHistory(params: HistoryParams): Promise<HistoryResult> {
    try {
      const missingInfo = [];

      if (!params.walletData) {
        missingInfo.push("💼 **Wallet Data**: Provide your wallet configuration file (my-wallets.json)");
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

      const historyParams = {
        testnet: params.testnet,
        apiKey: params.apiKey,
        number: params.number,
        walletsData: processedWalletData,
        isExternal: true
      };

      const result = await historyCommand(historyParams);

      if (result?.success && result.data) {
        return {
          success: true,
          data: result.data,
          responseType: "HistoryRetrievedSuccessfully"
        };
      }

      return {
        success: false,
        error: result?.error || "Failed to retrieve transaction history",
        responseType: "ErrorRetrievingHistory"
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        responseType: "ErrorRetrievingHistory"
      };
    }
  }

  private formatMissingInfoError(missingInfo: string[]): string {
    return `❌ **Missing Required Information**\n\nTo retrieve transaction history, please provide the following:\n\n${missingInfo.map(info => `• ${info}`).join('\n')}\n\nOnce you provide all required information, try again.`;
  }

  formatHistoryResponse(data: any): string {
    const { walletAddress, network, transfers, totalTransfers } = data;
    
    if (!transfers || transfers.length === 0) {
      return `📜 **Transaction History**

🔍 **Wallet**: ${walletAddress}
🌐 **Network**: ${network}

📭 **No transactions found**

This wallet has no transaction history on ${network}.`;
    }

    const transactionList = transfers.slice(0, 10).map((transfer: any, index: number) => {
      const date = transfer.metadata?.blockTimestamp ? new Date(transfer.metadata.blockTimestamp).toLocaleString() : 'Unknown date';
      const asset = transfer.asset || 'RBTC';
      const value = transfer.value || 'Unknown';
      
      return `**${index + 1}.** ${asset} Transfer
   • **From**: ${transfer.from}
   • **To**: ${transfer.to}
   • **Amount**: ${value} ${asset}
   • **Hash**: \`${transfer.hash}\`
   • **Date**: ${date}`;
    }).join('\n\n');

    const showingCount = Math.min(transfers.length, 10);
    const moreText = totalTransfers > showingCount ? `\n\n📋 **Showing ${showingCount} of ${totalTransfers} total transactions**` : '';

    return `📜 **Transaction History**

🔍 **Wallet**: ${walletAddress}
🌐 **Network**: ${network}
📊 **Total Transactions**: ${totalTransfers}

${transactionList}${moreText}

💡 **Tip**: Use the 'number' parameter to retrieve a specific number of recent transactions.`;
  }

  formatHistoryErrorResponse(error: string): string {
    if (error.includes("API key")) {
      return `❌ **API Key Required**

${error}

💡 **How to get an Alchemy API Key:**
1. Visit https://www.alchemy.com/
2. Create a free account
3. Create a new app for Rootstock
4. Copy your API key

🔧 **Usage**: Provide the API key as a parameter once, and it will be saved for future use.`;
    }

    if (error.includes("No transactions found")) {
      return `📭 **No Transactions Found**

${error}

💡 **This could mean:**
• The wallet is new and hasn't made any transactions
• All transactions are on a different network
• The wallet address is incorrect

🔄 Please verify the wallet address and network selection.`;
    }

    return `❌ **Error Retrieving History**

${error}

💡 **Common Issues:**
• Invalid or missing Alchemy API key
• Network connectivity issues
• Invalid wallet data format
• API rate limits

🔄 Please check your configuration and try again.`;
  }
}