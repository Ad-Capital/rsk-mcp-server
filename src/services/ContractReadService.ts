import { ReadContract } from "@rsksmart/rsk-cli/dist/src/commands/contract.js";
import {
  returnContractAddressRequired,
  returnToReadContract,
  returnFunctionNameRequired,
  returnErrorNoReadFunctions,
} from "../utils/responses.js";

export interface ContractReadParams {
  testnet: boolean;
  contractAddress: string;
  functionName?: string;
  functionArgs?: any[];
}

export interface ContractReadResult {
  success: boolean;
  data?: any;
  error?: string;
  responseType: string;
}

export class ContractReadService {
  /**
   * Validates the required parameters for contract reading
   */
  public validateReadParams(params: ContractReadParams): string[] {
    const { contractAddress } = params;
    const missingInfo: string[] = [];

    if (!contractAddress) {
      missingInfo.push(returnContractAddressRequired());
    }

    return missingInfo;
  }

  /**
   * Validates contract address format
   */
  public validateContractAddress(contractAddress: string): { valid: boolean; error?: string } {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    
    if (!addressRegex.test(contractAddress)) {
      return { 
        valid: false, 
        error: `Invalid contract address format: ${contractAddress}` 
      };
    }

    return { valid: true };
  }

  /**
   * Analyzes error messages to determine the appropriate response type
   */
  public analyzeError(error: string): { responseType: string; needsSpecialHandling: boolean } {
    if (error.includes("verification not found") || error.includes("not verified")) {
      return { 
        responseType: "ErrorContractNotVerified", 
        needsSpecialHandling: true 
      };
    }

    if (error.includes("Function name is required")) {
      return { 
        responseType: "ToReadContract", 
        needsSpecialHandling: true 
      };
    }

    if (error.includes("No read functions found")) {
      return { 
        responseType: "ErrorReadingContract", 
        needsSpecialHandling: true 
      };
    }

    return { 
      responseType: "ErrorReadingContract", 
      needsSpecialHandling: false 
    };
  }

  /**
   * Formats error response based on error type
   */
  public formatErrorResponse(error: string, contractAddress: string): string {
    const errorAnalysis = this.analyzeError(error);

    switch (errorAnalysis.responseType) {
      case "ErrorContractNotVerified":
        return contractAddress;

      case "ToReadContract":
        return returnFunctionNameRequired();

      case "ErrorReadingContract":
        if (error.includes("No read functions found")) {
          return returnErrorNoReadFunctions();
        }
        return error;

      default:
        return error;
    }
  }

  /**
   * Executes the contract read operation
   */
  public async executeContractRead(params: ContractReadParams): Promise<ContractReadResult> {
    try {
      const result = await ReadContract({
        address: params.contractAddress,
        testnet: params.testnet,
        isExternal: true,
        functionName: params.functionName,
        args: params.functionArgs
      });

      if (result?.success && result.data) {
        return {
          success: true,
          data: result.data,
          responseType: "ContractReadSuccessfully"
        };
      }

      if (result?.error) {
        const errorAnalysis = this.analyzeError(result.error);
        const formattedError = this.formatErrorResponse(result.error, params.contractAddress);

        return {
          success: false,
          error: formattedError,
          responseType: errorAnalysis.responseType
        };
      }

      return {
        success: false,
        error: "Contract reading failed with unknown error",
        responseType: "ErrorReadingContract"
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        responseType: "ErrorReadingContract"
      };
    }
  }

  /**
   * Main method to process contract reading
   */
  public async processContractRead(params: ContractReadParams): Promise<ContractReadResult> {
    try {
      const missingInfo = this.validateReadParams(params);
      if (missingInfo.length > 0) {
        return {
          success: false,
          error: returnToReadContract("", missingInfo),
          responseType: "ToReadContract"
        };
      }

      const addressValidation = this.validateContractAddress(params.contractAddress);
      if (!addressValidation.valid) {
        return {
          success: false,
          error: addressValidation.error!,
          responseType: "ErrorInvalidContractAddress"
        };
      }

      return await this.executeContractRead(params);

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        responseType: "ErrorReadingContract"
      };
    }
  }
}