import { ResponseType } from "../tools/types.js";
import { returnCheckBalanceSuccess, returnErrorCheckingBalance, returnErrorCheckingTransaction, returnErrorInvalidWalletData, returnErrorMissingInfo, returnErrorReadingPasswordFile, returnErrorTryAgain, returnErrorTXHashInvalid, returnErrorTXIdRequired, returnErrorTxNotFound, returnInteractionResponse, returnToCheckBalance, returnTransactionFound, returnWalletCreatedSuccessfully, } from "../utils/responses.js";
export function provideResponse(content, type) {
    const text = responseText(content, type);
    return {
        content: [
            {
                type: "text",
                text: text,
            },
        ],
    };
}
function responseText(content, type) {
    switch (type) {
        case ResponseType.Interaction:
            return returnInteractionResponse(content);
        case ResponseType.ErrorReadingPasswordFile:
            return returnErrorReadingPasswordFile(content);
        case ResponseType.ErrorMissingInfo:
            return returnErrorMissingInfo(content);
        case ResponseType.WalletCreatedSuccessfully:
            return returnWalletCreatedSuccessfully(content);
        case ResponseType.ErrorTryAgain:
            return returnErrorTryAgain(content);
        case ResponseType.ToCheckBalance:
            return returnToCheckBalance(content);
        case ResponseType.ErrorInvalidWalletData:
            return returnErrorInvalidWalletData(content);
        case ResponseType.CheckBalanceSuccess:
            return returnCheckBalanceSuccess(content);
        case ResponseType.ErrorCheckingBalance:
            return returnErrorCheckingBalance(content);
        case ResponseType.ErrorTXIdRequired:
            return returnErrorTXIdRequired();
        case ResponseType.ErrorTXHashInvalid:
            return returnErrorTXHashInvalid(content);
        case ResponseType.TransactionFound:
            return returnTransactionFound(content);
        case ResponseType.ErrorTxNotFound:
            return returnErrorTxNotFound(content);
        case ResponseType.ErrorCheckingTransaction:
            return returnErrorCheckingTransaction(content);
        default:
            return content;
    }
}
