declare module '@rsksmart/rsk-cli/dist/src/commands/wallet.js' {
  export function walletCommand(
    _action?: string,
    _password?: string,
    _walletsData?: any,
    _newWalletName?: string,
    _replaceCurrentWallet?: boolean
  ): Promise<{
    success?: boolean;
    message?: string;
    walletsData?: any;
    error?: string;
  } | undefined>;
  export function writeWalletData(filePath: string, data: any): Promise<void>;
}

declare module '@rsksmart/rsk-cli/dist/src/commands/balance.js' {
  export function balanceCommand(
    testnet: boolean,
    walletName?: string,
    holderAddress?: string,
    _isExternal?: boolean,
    _token?: string,
    _customTokenAddress?: string,
    _walletsData?: any
  ): Promise<{
    success?: boolean;
    data?: {
      walletAddress: string;
      network: string;
      balance: string;
      symbol: string;
      tokenType: string;
      tokenName?: string;
      tokenSymbol?: string;
      tokenContract?: string;
      decimals?: number;
    };
    error?: string;
  } | undefined>;
}

declare module '@rsksmart/rsk-cli/dist/src/commands/transfer.js' {
  export function transferCommand(testnet: boolean, address: string, value: number, wallet?: string): Promise<void>;
}

declare module '@rsksmart/rsk-cli/dist/src/commands/deploy.js' {
  export function deployCommand(abi: string, bytecode: string, testnet: boolean, args: any[], wallet?: string): Promise<void>;
}

declare module '@rsksmart/rsk-cli/dist/src/commands/bridge.js' {
  export function bridgeCommand(testnet: boolean, wallet?: string): Promise<void>;
}

declare module '@rsksmart/rsk-cli/dist/src/commands/history.js' {
  export function historyCommand(testnet: boolean, apiKey?: string, number?: string): Promise<void>;
}

declare module '@rsksmart/rsk-cli/dist/src/commands/contract.js' {
  export function ReadContract(address: string, testnet: boolean): Promise<void>;
}

declare module '@rsksmart/rsk-cli/dist/src/commands/selectAddress.js' {
  export function selectAddress(): Promise<string>;
} 