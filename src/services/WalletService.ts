import { walletCommand } from "@rsksmart/rsk-cli/dist/src/commands/wallet.js";
import { balanceCommand } from "@rsksmart/rsk-cli/dist/src/commands/balance.js";
import { extractPasswordFromFile } from "../tools/handlers.js";
import { WalletData } from "../tools/types.js";
import {
  returnSecurePasswordMethod,
  returnMissingWalletNameNew,
  returnMissingReplaceCurrentWallet,
  returnMissingPrivateKey,
  returnMissingWalletNameImport,
  returnMissingWalletDataFile,
  returnMissingNewMainWallet,
  returnMissingPreviousWallet,
  returnMissingNewWalletName,
  returnMissingDeleteWalletName,
  returnErrorInvalidWalletData,
  returnErrorMissingInfo,
  returnErrorTryAgain,
} from "../utils/responses.js";

export interface CreateWalletParams {
  walletOption: string;
  walletPassword?: string;
  passwordFile?: string;
  walletData?: WalletData | string;
  walletName?: string;
  replaceCurrentWallet?: boolean;
  privateKey?: string;
  newMainWallet?: string;
  previousWallet?: string;
  newWalletName?: string;
  deleteWalletName?: string;
}

export interface UseWalletFromCreationParams {
  testnet: boolean;
  token: string;
  customTokenAddress?: string;
  walletCreationResult: string;
}

export interface WalletServiceResult {
  success: boolean;
  data?: any;
  error?: string;
  responseType: string;
}

export interface WalletFromCreationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class WalletService {
  /**
   * Validates the input parameters for wallet operations
   */
  public validateWalletParams(params: CreateWalletParams): string[] {
    const { walletOption } = params;
    const missingInfo: string[] = [];

    switch (walletOption) {
      case "🆕 Create a new wallet":
        return this.validateCreateWallet(params);
      case "🔑 Import existing wallet":
        return this.validateImportWallet(params);
      case "🔍 List saved wallets":
        return this.validateListWallets(params);
      case "🔁 Switch wallet":
        return this.validateSwitchWallet(params);
      case "📝 Update wallet name":
        return this.validateUpdateWalletName(params);
      case "❌ Delete wallet":
        return this.validateDeleteWallet(params);
      default:
        missingInfo.push(`Invalid option: "${walletOption}"`);
    }

    return missingInfo;
  }

  /**
   * Processes the password from file or direct input
   */
  public processPassword(walletPassword?: string, passwordFile?: string): { password?: string; error?: string } {
    let finalPassword = walletPassword;

    if (passwordFile && !walletPassword) {
      const passwordResult = extractPasswordFromFile(passwordFile);
      if (passwordResult.error) {
        return { error: passwordResult.error };
      }
      finalPassword = passwordResult.password;
    }

    return { password: finalPassword };
  }

  /**
   * Processes and validates wallet data
   */
  public processWalletData(walletData?: WalletData | string, walletOption?: string): { 
    data?: WalletData; 
    error?: string 
  } {
    if (!walletData) return { data: undefined };

    let processedWalletData: WalletData;

    if (typeof walletData === "string") {
      try {
        processedWalletData = JSON.parse(walletData);
      } catch (error) {
        return {
          error: `Invalid JSON format: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    } else {
      processedWalletData = walletData;
    }

    if (!processedWalletData.wallets || typeof processedWalletData.wallets !== 'object') {
      return {
        error: "Invalid wallet data structure: missing 'wallets' object"
      };
    }

    if (walletOption && ["🔁 Switch wallet", "📝 Update wallet name", "❌ Delete wallet"].includes(walletOption)) {
      if (Object.keys(processedWalletData.wallets || {}).length === 0) {
        return {
          error: "No wallets found in wallet data. Please ensure you have existing wallets."
        };
      }
    }

    return { data: processedWalletData };
  }

  /**
   * Builds command parameters based on wallet option
   */
  public buildCommandParams(params: CreateWalletParams, processedWalletData?: WalletData, finalPassword?: string): any {
    const { 
      walletOption, 
      walletName, 
      replaceCurrentWallet, 
      privateKey, 
      newMainWallet, 
      previousWallet, 
      newWalletName, 
      deleteWalletName 
    } = params;

    const commandParams: any = {
      action: walletOption,
      isExternal: true
    };

    switch (walletOption) {
      case "🆕 Create a new wallet":
        commandParams.password = finalPassword;
        commandParams.newWalletName = walletName;
        commandParams.replaceCurrentWallet = replaceCurrentWallet;
        commandParams.walletsData = processedWalletData || { wallets: {}, currentWallet: "" };
        break;

      case "🔑 Import existing wallet":
        commandParams.pk = privateKey;
        commandParams.password = finalPassword;
        commandParams.newWalletName = walletName;
        commandParams.replaceCurrentWallet = replaceCurrentWallet;
        commandParams.walletsData = processedWalletData || { wallets: {}, currentWallet: "" };
        break;

      case "🔍 List saved wallets":
        commandParams.walletsData = processedWalletData;
        break;

      case "🔁 Switch wallet":
        commandParams.walletsData = processedWalletData;
        commandParams.newMainWallet = newMainWallet;
        break;

      case "📝 Update wallet name":
        commandParams.walletsData = processedWalletData;
        commandParams.previousWallet = previousWallet;
        commandParams.newWalletName = newWalletName;
        break;

      case "❌ Delete wallet":
        commandParams.walletsData = processedWalletData;
        commandParams.deleteWalletName = deleteWalletName;
        break;
    }

    return commandParams;
  }

  /**
   * Executes the wallet command with the provided parameters
   */
  public async executeWalletCommand(commandParams: any): Promise<WalletServiceResult> {
    try {
      console.log("Executing wallet command with params:", JSON.stringify(commandParams, null, 2));
      
      const commandResult = await walletCommand(commandParams);
      
      console.log("Wallet command result:", commandResult?.success ? "SUCCESS" : "FAILED");

      if (commandResult?.success) {
        const walletConfigJson = JSON.stringify(commandResult.walletsData, null, 2);
        
        return {
          success: true,
          data: {
            result: JSON.stringify(commandResult, null, 2),
            walletConfig: walletConfigJson,
            option: commandParams.action
          },
          responseType: "WalletCreatedSuccessfully"
        };
      }

      return {
        success: false,
        error: commandResult?.error || "Unknown error occurred",
        responseType: "ErrorTryAgain"
      };

    } catch (error) {
      console.error("Error executing wallet command:", error);
      return {
        success: false,
        error: `Command execution failed: ${error instanceof Error ? error.message : String(error)}`,
        responseType: "ErrorTryAgain"
      };
    }
  }

  /**
   * Main method to process wallet creation/management
   */
  public async processWalletOperation(params: CreateWalletParams): Promise<WalletServiceResult> {
    try {
      const missingInfo = this.validateWalletParams(params);
      if (missingInfo.length > 0) {
        return {
          success: false,
          error: returnErrorMissingInfo(params.walletOption, missingInfo),
          responseType: "ErrorMissingInfo"
        };
      }

      const passwordResult = this.processPassword(params.walletPassword, params.passwordFile);
      if (passwordResult.error) {
        return {
          success: false,
          error: passwordResult.error,
          responseType: "ErrorReadingPasswordFile"
        };
      }

      const walletDataResult = this.processWalletData(params.walletData, params.walletOption);
      if (walletDataResult.error) {
        return {
          success: false,
          error: returnErrorInvalidWalletData(walletDataResult.error),
          responseType: "ErrorInvalidWalletData"
        };
      }

      const commandParams = this.buildCommandParams(params, walletDataResult.data, passwordResult.password);

      return await this.executeWalletCommand(commandParams);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: returnErrorTryAgain(params.walletOption, [errorMsg || "Unknown error occurred"]),
        responseType: "ErrorTryAgain"
      };
    }
  }

  private validateCreateWallet(params: CreateWalletParams): string[] {
    const missingInfo: string[] = [];
    const { walletPassword, passwordFile, walletName, replaceCurrentWallet } = params;

    const passwordResult = this.processPassword(walletPassword, passwordFile);
    if (!passwordResult.password) {
      missingInfo.push(returnSecurePasswordMethod());
    }
    if (!walletName) {
      missingInfo.push(returnMissingWalletNameNew());
    }
    if (replaceCurrentWallet === undefined) {
      missingInfo.push(returnMissingReplaceCurrentWallet());
    }

    return missingInfo;
  }

  private validateImportWallet(params: CreateWalletParams): string[] {
    const missingInfo: string[] = [];
    const { privateKey, walletPassword, passwordFile, walletName, replaceCurrentWallet } = params;

    if (!privateKey) {
      missingInfo.push(returnMissingPrivateKey());
    }

    const passwordResult = this.processPassword(walletPassword, passwordFile);
    if (!passwordResult.password) {
      missingInfo.push(returnSecurePasswordMethod());
    }
    if (!walletName) {
      missingInfo.push(returnMissingWalletNameImport());
    }
    if (replaceCurrentWallet === undefined) {
      missingInfo.push(returnMissingReplaceCurrentWallet());
    }

    return missingInfo;
  }

  private validateListWallets(params: CreateWalletParams): string[] {
    const missingInfo: string[] = [];
    if (!params.walletData) {
      missingInfo.push(returnMissingWalletDataFile());
    }
    return missingInfo;
  }

  private validateSwitchWallet(params: CreateWalletParams): string[] {
    const missingInfo: string[] = [];
    if (!params.walletData) {
      missingInfo.push(returnMissingWalletDataFile());
    }
    if (!params.newMainWallet) {
      missingInfo.push(returnMissingNewMainWallet());
    }
    return missingInfo;
  }

  private validateUpdateWalletName(params: CreateWalletParams): string[] {
    const missingInfo: string[] = [];
    if (!params.walletData) {
      missingInfo.push(returnMissingWalletDataFile());
    }
    if (!params.previousWallet) {
      missingInfo.push(returnMissingPreviousWallet());
    }
    if (!params.newWalletName) {
      missingInfo.push(returnMissingNewWalletName());
    }
    return missingInfo;
  }

  private validateDeleteWallet(params: CreateWalletParams): string[] {
    const missingInfo: string[] = [];
    if (!params.walletData) {
      missingInfo.push(returnMissingWalletDataFile());
    }
    if (!params.deleteWalletName) {
      missingInfo.push(returnMissingDeleteWalletName());
    }
    return missingInfo;
  }

  /**
   * Parses and validates wallet creation result JSON
   */
  public parseWalletCreationResult(walletCreationResult: string): { walletData?: WalletData; error?: string } {
    try {
      const walletResult = JSON.parse(walletCreationResult);
      
      const walletData = walletResult.walletsData;
      if (!walletData || !walletData.wallets || !walletData.currentWallet) {
        return {
          error: "Invalid wallet data structure. The wallet creation result doesn't contain valid wallet data. Please ensure you're using the complete result from create-wallet."
        };
      }

      return { walletData };
    } catch (error) {
      return {
        error: `Invalid wallet creation result format. Please provide the complete JSON result from when you created the wallet. Error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Checks balance using wallet data from creation result
   */
  public async checkBalanceFromCreation(params: UseWalletFromCreationParams): Promise<WalletFromCreationResult> {
    try {
      const parseResult = this.parseWalletCreationResult(params.walletCreationResult);
      if (parseResult.error) {
        return {
          success: false,
          error: parseResult.error
        };
      }

      const result = await balanceCommand(
        params.testnet,
        undefined,
        undefined,
        true,
        params.token,
        params.customTokenAddress,
        parseResult.walletData
      );

      if (result?.success && result.data) {
        return {
          success: true,
          data: result.data
        };
      }

      return {
        success: false,
        error: result?.error || "Unknown error occurred"
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Formats the balance result for use-wallet-from-creation response
   */
  public formatBalanceFromCreationResponse(data: any): string {
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

  /**
   * Formats error response for use-wallet-from-creation
   */
  public formatErrorFromCreationResponse(error: string, isParsingError: boolean = false): string {
    if (isParsingError) {
      return `❌ **Invalid wallet creation result format**

${error}`;
    }

    if (error.includes("Invalid wallet data structure")) {
      return `❌ **Invalid wallet data structure**

${error}`;
    }

    return `❌ **Failed to check balance**

Error: ${error}

Please verify your wallet configuration and try again.`;
  }
}