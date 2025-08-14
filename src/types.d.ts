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
  export function balanceCommand(params: {
    testnet: boolean;
    walletName?: string;
    holderAddress?: string;
    isExternal?: boolean;
    token?: string;
    customTokenAddress?: string;
    walletsData?: any;
  }): Promise<{
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
  export function txCommand(params: {
    testnet: boolean;
    txid: string;
    isExternal?: boolean;
  }): Promise<{
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
  export function deployCommand(params: {
    abiPath: string;
    bytecodePath: string;
    testnet: boolean;
    args?: any[];
    name?: string;
    isExternal?: boolean;
    walletsData?: any;
    password?: string;
  }): Promise<{
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

declare module '@rsksmart/rsk-cli/dist/src/commands/history.js' {
  export function historyCommand(params: {
    testnet: boolean;
    apiKey?: string;
    number?: string;
    walletsData?: any;
    isExternal?: boolean;
  }): Promise<{
    success?: boolean;
    data?: {
      walletAddress: string;
      network: string;
      transfers: Array<{
        from: string;
        to: string;
        asset?: string;
        value?: string;
        hash: string;
        metadata?: {
          blockTimestamp: string;
        };
      }>;
      totalTransfers: number;
    };
    error?: string;
  } | undefined>;
}



declare module '@rsksmart/rsk-cli/dist/src/commands/selectAddress.js' {
  export function selectAddress(): Promise<string>;
} 

declare module '@rsksmart/rsk-cli/dist/src/commands/verify.js' {
  export function verifyCommand(params: {
    jsonPath: string;
    address: string;
    name: string;
    testnet: boolean;
    args?: any[];
    isExternal?: boolean;
  }): Promise<{
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
  export function ReadContract(params: {
    address: string;
    testnet: boolean;
    isExternal?: boolean;
    functionName?: string;
    args?: any[];
  }): Promise<{
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