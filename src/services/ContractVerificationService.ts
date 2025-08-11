import { verifyCommand } from "@rsksmart/rsk-cli/dist/src/commands/verify.js";
import {
  returnContractAddressRequired,
  returnContractNameRequired,
  returnJSONContentRequired,
  returnToVerifyContract,
  returnContractVerifiedSuccessfully,
} from "../utils/responses.js";

export interface ContractVerificationParams {
  testnet: boolean;
  contractAddress: string;
  contractName: string;
  jsonContent: string;
  constructorArgs?: any[];
}

export interface ContractVerificationResult {
  success: boolean;
  data?: any;
  error?: string;
  responseType: string;
}

export class ContractVerificationService {
  /**
   * Validates the required parameters for contract verification
   */
  public validateVerificationParams(params: ContractVerificationParams): string[] {
    const { contractAddress, contractName, jsonContent } = params;
    const missingInfo: string[] = [];

    if (!contractAddress) {
      missingInfo.push(returnContractAddressRequired());
    }

    if (!contractName) {
      missingInfo.push(returnContractNameRequired());
    }

    if (!jsonContent) {
      missingInfo.push(returnJSONContentRequired());
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
   * Validates JSON Standard Input format for Solidity compilation
   */
  public validateStandardJSON(jsonContent: string): { isValid: boolean; error?: string } {
    try {
      const requiredFields = ['solcLongVersion', 'input', 'solcVersion'];
      
      if (!jsonContent.trim().startsWith('{') || !jsonContent.trim().endsWith('}')) {
        return {
          isValid: false,
          error: 'JSON must be a valid object'
        };
      }
      
      const missingFields = requiredFields.filter(field => {
        const fieldPattern = new RegExp(`"${field}"\\s*:`, 'i');
        return !fieldPattern.test(jsonContent);
      });
      
      if (missingFields.length > 0) {
        return {
          isValid: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        };
      }
      
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid JSON format'
      };
    }
  }

  /**
   * Executes the contract verification
   */
  public async executeVerification(params: ContractVerificationParams): Promise<ContractVerificationResult> {
    try {
      const result = await verifyCommand(
        params.jsonContent,
        params.contractAddress,
        params.contractName,
        params.testnet,
        params.constructorArgs || [],
        true
      );

      if (result?.success && result.data) {
        return {
          success: true,
          data: result.data,
          responseType: "ContractVerifiedSuccessfully"
        };
      }

      return {
        success: false,
        error: result?.error || "Contract verification failed with unknown error",
        responseType: "ErrorVerifyingContract"
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        responseType: "ErrorVerifyingContract"
      };
    }
  }

  /**
   * Main method to process contract verification
   */
  public async processContractVerification(params: ContractVerificationParams): Promise<ContractVerificationResult> {
    try {
      const missingInfo = this.validateVerificationParams(params);
      if (missingInfo.length > 0) {
        return {
          success: false,
          error: returnToVerifyContract("", missingInfo),
          responseType: "ToVerifyContract"
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

      const jsonValidation = this.validateStandardJSON(params.jsonContent);
      if (!jsonValidation.isValid) {
        return {
          success: false,
          error: jsonValidation.error || "Invalid JSON Standard Input format",
          responseType: "ErrorInvalidJSON"
        };
      }

      return await this.executeVerification(params);

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        responseType: "ErrorVerifyingContract"
      };
    }
  }
}