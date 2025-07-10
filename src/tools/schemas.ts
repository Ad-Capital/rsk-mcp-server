import { z } from "zod";
import { createWalletOptions } from "./constants.js";
import { WalletData } from "./types.js";

export const createWalletSchema = z.object({
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
