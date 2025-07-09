export var ResponseType;
(function (ResponseType) {
    ResponseType["Interaction"] = "interaction";
    ResponseType["ErrorReadingPasswordFile"] = "errorPswFile";
    ResponseType["ErrorMissingInfo"] = "errorMissingInfo";
    ResponseType["WalletCreatedSuccessfully"] = "walletCreatedSuccessfully";
    ResponseType["ErrorTryAgain"] = "errorTryAgain";
    ResponseType["ToCheckBalance"] = "toCheckBalance";
    ResponseType["ErrorInvalidWalletData"] = "errorInvalidWalletData";
    ResponseType["CheckBalanceSuccess"] = "checkBalanceSuccess";
    ResponseType["ErrorCheckingBalance"] = "errorCheckingBalance";
    ResponseType["ErrorTXIdRequired"] = "errorTXIdRequired";
    ResponseType["ErrorTXHashInvalid"] = "errorTXHashInvalid";
    ResponseType["TransactionFound"] = "transactionFound";
    ResponseType["ErrorTxNotFound"] = "errorTxNotFound";
    ResponseType["ErrorCheckingTransaction"] = "errorCheckingTransaction";
})(ResponseType || (ResponseType = {}));
