import { deployCommand } from "@rsksmart/rsk-cli/dist/src/commands/deploy.js";
import { WalletData } from "../tools/types.js";
import {
  returnABIContentRequired,
  returnBytecodeContentRequired,
  returnErrorMissingWalletData,
  returnErrorMissingWalletPassword,
  returnToDeployContract,
} from "../utils/responses.js";

export interface ContractDeploymentParams {
  testnet: boolean;
  abiContent: string;
  bytecodeContent: string;
  constructorArgs?: any[];
  walletName?: string;
  walletData?: WalletData | string;
  walletPassword?: string;
}

export interface ContractDeploymentResult {
  success: boolean;
  data?: any;
  error?: string;
  responseType: string;
}

export class ContractDeploymentService {
  /**
   * Validates the required parameters for contract deployment
   */
  public validateDeploymentParams(params: ContractDeploymentParams): string[] {
    const { abiContent, bytecodeContent, walletData, walletName, walletPassword } = params;
    const missingInfo: string[] = [];

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

    return missingInfo;
  }

  /**
   * Validates and parses the ABI content
   */
  public validateABI(abiContent: string): { abi?: any[]; error?: string } {
    try {
      const parsedABI = JSON.parse(abiContent);
      
      if (!Array.isArray(parsedABI)) {
        return { error: "ABI must be a JSON array" };
      }

      return { abi: parsedABI };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  /**
   * Validates and cleans the bytecode
   */
  public validateBytecode(bytecodeContent: string): { bytecode?: string; error?: string } {
    let cleanBytecode = bytecodeContent.trim();
    
    if (!cleanBytecode.startsWith("0x")) {
      cleanBytecode = `0x${cleanBytecode}`;
    }

    const bytecodeRegex = /^0x[a-fA-F0-9]+$/;
    if (!bytecodeRegex.test(cleanBytecode)) {
      return { error: `Invalid bytecode format: ${cleanBytecode}` };
    }

    return { bytecode: cleanBytecode };
  }

  /**
   * Processes wallet data (string to object conversion)
   */
  public processWalletData(walletData?: WalletData | string): { data?: WalletData; error?: string } {
    if (!walletData) return { data: undefined };

    if (typeof walletData === "string") {
      try {
        return { data: JSON.parse(walletData) };
      } catch (error) {
        return { 
          error: error instanceof Error ? error.message : String(error) 
        };
      }
    }

    return { data: walletData };
  }

  /**
   * Executes the contract deployment
   */
  public async executeDeployment(
    abi: any[],
    bytecode: string,
    params: ContractDeploymentParams,
    processedWalletData?: WalletData
  ): Promise<ContractDeploymentResult> {
    try {
      const result = await deployCommand({
        abiPath: JSON.stringify(abi),
        bytecodePath: bytecode,
        testnet: params.testnet,
        args: params.constructorArgs || [],
        name: params.walletName,
        isExternal: true,
        walletsData: processedWalletData,
        password: params.walletPassword
      });

      if (result?.success && result.data) {
        return {
          success: true,
          data: result.data,
          responseType: "ContractDeployedSuccessfully"
        };
      }

      return {
        success: false,
        error: result?.error || "Contract deployment failed with unknown error",
        responseType: "ErrorDeployingContract"
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        responseType: "ErrorDeployingContract"
      };
    }
  }

  /**
   * Main method to process contract deployment
   */
  public async processContractDeployment(params: ContractDeploymentParams): Promise<ContractDeploymentResult> {
    try {
      const missingInfo = this.validateDeploymentParams(params);
      if (missingInfo.length > 0) {
        return {
          success: false,
          error: returnToDeployContract("", missingInfo),
          responseType: "ToDeployContract"
        };
      }

      const abiResult = this.validateABI(params.abiContent);
      if (abiResult.error) {
        return {
          success: false,
          error: abiResult.error,
          responseType: "ErrorInvalidABI"
        };
      }

      const bytecodeResult = this.validateBytecode(params.bytecodeContent);
      if (bytecodeResult.error) {
        return {
          success: false,
          error: bytecodeResult.error,
          responseType: "ErrorInvalidBytecode"
        };
      }

      const walletDataResult = this.processWalletData(params.walletData);
      if (walletDataResult.error) {
        return {
          success: false,
          error: walletDataResult.error,
          responseType: "ErrorInvalidWalletData"
        };
      }

      return await this.executeDeployment(
        abiResult.abi!,
        bytecodeResult.bytecode!,
        params,
        walletDataResult.data
      );

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        responseType: "ErrorDeployingContract"
      };
    }
  }
}