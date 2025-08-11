import { z } from "zod";
import { createWalletOptions } from "./constants.js";
import { WalletData } from "./types.js";

export const createWalletSchema = z.object({
  walletOption: z
    .enum(createWalletOptions)
    .describe("The wallet creation option selected by the user"),
  
  // Common parameters
  walletPassword: z
    .string()
    .optional()
    .describe("The password for the wallet - required for create/import operations"),
  passwordFile: z
    .string()
    .optional()
    .describe('JSON file content with password field - format: {"password": "yourpassword"}'),
  walletData: z
    .custom<WalletData>()
    .optional()
    .describe("Your previously saved wallet configuration file content (my-wallets.json) - required for most operations"),
  
  // For Create/Import new wallet
  walletName: z
    .string()
    .optional()
    .describe("The name for the new wallet - required for create/import operations"),
  replaceCurrentWallet: z
    .boolean()
    .optional()
    .describe("Whether to replace current wallet - for create/import operations"),
    
  // For Import existing wallet  
  privateKey: z
    .string()
    .optional()
    .describe("Private key to import - required for 'Import existing wallet' option"),
    
  // For Switch wallet
  newMainWallet: z
    .string()
    .optional()
    .describe("Name of wallet to switch to - required for 'Switch wallet' option"),
    
  // For Update wallet name
  previousWallet: z
    .string()
    .optional()
    .describe("Current name of wallet to rename - required for 'Update wallet name' option"),
  newWalletName: z
    .string()
    .optional()
    .describe("New name for the wallet - required for 'Update wallet name' option"),
    
  // For Delete wallet
  deleteWalletName: z
    .string()
    .optional()
    .describe("Name of wallet to delete - required for 'Delete wallet' option"),
});

export const checkBalanceSchema = z.object({
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
});

export const useWalletFromCreationSchema = z.object({
  testnet: z.boolean().describe("Use testnet (true) or mainnet (false)"),
  token: z
    .string()
    .describe(
      "Token to check balance for (rBTC, USDT, DOC, BPRO, RIF, FISH, Custom Token, etc.)"
    ),
  customTokenAddress: z
    .string()
    .optional()
    .describe(
      "Custom token contract address - required if token is 'Custom Token'"
    ),
  walletCreationResult: z
    .string()
    .describe(
      "The complete JSON result from create-wallet function including walletsData"
    ),
});

export const checkTransactionSchema = z.object({
  testnet: z.boolean().describe("Use testnet (true) or mainnet (false)"),
  txid: z
    .string()
    .describe(
      "Transaction hash (with or without 0x prefix) to check status and details"
    ),
});

export const deployContractSchema = z.object({
  testnet: z.boolean().describe("Use testnet (true) or mainnet (false)"),
  abiContent: z
    .string()
    .describe(
      "JSON content of the contract ABI - paste the complete ABI JSON array"
    ),
  bytecodeContent: z
    .string()
    .describe(
      "Hexadecimal bytecode of the contract - with or without 0x prefix"
    ),
  constructorArgs: z
    .array(z.any())
    .optional()
    .describe(
      "Array of constructor arguments for the contract deployment (optional)"
    ),
  walletName: z
    .string()
    .optional()
    .describe(
      "Specific wallet name to deploy from - uses current wallet if not provided"
    ),
  walletData: z
    .union([z.custom<WalletData>(), z.string()])
    .optional()
    .describe(
      "Your previously saved wallet configuration file content (my-wallets.json) - required if you want to use specific wallet data"
    ),
  walletPassword: z
    .string()
    .optional()
    .describe(
      "Password to decrypt the wallet - required when using walletData"
    ),
});

export const verifyContractSchema = z.object({
  testnet: z.boolean().describe("Use testnet (true) or mainnet (false)"),
  contractAddress: z
    .string()
    .describe(
      "Contract address to verify (0x... format)"
    ),
  contractName: z
    .string()
    .describe(
      "Name of the contract as defined in the source code"
    ),
  jsonContent: z
    .string()
    .describe(
      "JSON Standard Input content from Solidity compilation - contains solcLongVersion and input fields, it is not necesary to readd the content, just validate it contains an 'input' field and others. If the file is too large, you can delete the 'output' section to reduce file size while keeping the required compilation metadata."
    ),
  constructorArgs: z
    .array(z.any())
    .optional()
    .describe(
      "Array of constructor arguments used during deployment (optional)"
    ),
});

export const readContractSchema = z.object({
  testnet: z.boolean().describe("Use testnet (true) or mainnet (false)"),
  contractAddress: z
    .string()
    .describe(
      "Contract address to read from (0x... format) - must be a verified contract"
    ),
  functionName: z
    .string()
    .optional()
    .describe(
      "Name of the view/pure function to call - if not provided, available functions will be listed"
    ),
  functionArgs: z
    .array(z.any())
    .optional()
    .describe(
      "Array of arguments for the function call (required if the function has parameters)"
    ),
});
