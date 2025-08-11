declare module '@rsksmart/rsk-cli/dist/src/commands/wallet.js' {
  export function walletCommand(params?: {
    action?: string;
    password?: string;
    walletsData?: any;
    newWalletName?: string;
    replaceCurrentWallet?: boolean;
    isExternal?: boolean;
    pk?: string;
    newMainWallet?: string;
    deleteWalletName?: string;
    previousWallet?: string;
  }): Promise<{
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

declare module '@rsksmart/rsk-cli/dist/src/commands/tx.js' {
  export function txCommand(
    testnet: boolean,
    txid: string,
    _isExternal?: boolean
  ): Promise<{
    success?: boolean;
    data?: {
      txId: string;
      blockHash: string;
      blockNumber: string;
      gasUsed: string;
      status: string;
      from: string;
      to: string | null;
      network: string;
    };
    error?: string;
  } | undefined>;
}

declare module '@rsksmart/rsk-cli/dist/src/commands/transfer.js' {
  export function transferCommand(params: {
    testnet: boolean;
    toAddress: string;
    value: number;
    tokenAddress?: string;
    name?: string;
    walletsData?: any;
    password?: string;
    isExternal?: boolean;
  }): Promise<{
    success?: boolean;
    data?: {
      transactionHash: string;
      from: string;
      to: string;
      amount: string;
      token: string;
      network: string;
      explorerUrl: string;
      gasUsed: string;
      blockNumber: string;
    };
    error?: string;
  } | undefined>;
}

declare module '@rsksmart/rsk-cli/dist/src/commands/deploy.js' {
  export function deployCommand(
    abiPath: string,
    bytecodePath: string,
    testnet: boolean,
    args?: any[],
    name?: string,
    _isExternal?: boolean,
    _walletsData?: any,
    _password?: string
  ): Promise<{
    success?: boolean;
    data?: {
      contractAddress: string;
      transactionHash: string;
      network: string;
      explorerUrl: string;
    };
    error?: string;
  } | undefined>;
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

declare module '@rsksmart/rsk-cli/dist/src/commands/verify.js' {
  export function verifyCommand(
    jsonPath: string,
    address: string,
    name: string,
    testnet: boolean,
    args?: any[],
    _isExternal?: boolean
  ): Promise<{
    success?: boolean;
    data?: {
      contractAddress: string;
      contractName: string;
      network: string;
      explorerUrl: string;
      verified: boolean;
      alreadyVerified?: boolean;
      verificationData?: any;
    };
    error?: string;
  } | undefined>;
}

declare module '@rsksmart/rsk-cli/dist/src/commands/contract.js' {
  export function ReadContract(
    uppercaseAddress: string,
    testnet: boolean,
    _isExternal?: boolean,
    _functionName?: string,
    _args?: any[]
  ): Promise<{
    success?: boolean;
    data?: {
      contractAddress: string;
      network: string;
      functionName: string;
      result: any;
      explorerUrl: string;
    };
    error?: string;
  } | undefined>;
}