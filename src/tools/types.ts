export type WalletData = {
  wallets: {
    [key: string]: WalletItem;
  };
  currentWallet: string;
};

type WalletItem = {
  address: string;
  encryptedPrivateKey: string;
  iv: string;
};

export type MCPResponse = {
  content: {
    type: "text";
    text: string;
  }[];
};

export enum ResponseType {
  Interaction = "interaction",
  ErrorReadingPasswordFile = "errorPswFile",
  ErrorMissingInfo = "errorMissingInfo",
  WalletCreatedSuccessfully = "walletCreatedSuccessfully",
  ErrorTryAgain = "errorTryAgain",
  ToCheckBalance = "toCheckBalance",
  ErrorInvalidWalletData = "errorInvalidWalletData",
  CheckBalanceSuccess = "checkBalanceSuccess",
  ErrorCheckingBalance = "errorCheckingBalance",
  ErrorTXIdRequired = "errorTXIdRequired",
  ErrorTXHashInvalid = "errorTXHashInvalid",
  TransactionFound = "transactionFound",
  ErrorTxNotFound = "errorTxNotFound",
  ErrorCheckingTransaction = "errorCheckingTransaction",
  ToDeployContract = "toDeployContract",
  ContractDeployedSuccessfully = "contractDeployedSuccessfully",
  ErrorDeployingContract = "errorDeployingContract",
  ErrorInvalidABI = "errorInvalidABI",
  ErrorInvalidBytecode = "errorInvalidBytecode",
}