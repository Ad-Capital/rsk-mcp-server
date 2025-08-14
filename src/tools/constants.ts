export const generalInteractionOptions = [
  "💼 wallet - Manage your wallet: create a new one, use an existing wallet, or import a custom wallet",
  "💰 balance - Check the balance of the saved wallet",
  "💸 transfer - Transfer RBTC or ERC20 tokens to the provided address", 
  "🔍 tx - Check the status of a transaction",
  "🚀 deploy - Deploy a contract",
  "✅ verify - Verify a contract", 
  "📄 contract - Interact with a contract",
  "📊 history - Fetch history for current wallet",
  "❓ help - Display help for command"
] as const;

export const createWalletOptions = [
  "🆕 Create a new wallet",
  "🔑 Import existing wallet",
  "🔍 List saved wallets",
  "🔁 Switch wallet",
  "📝 Update wallet name",
  "❌ Delete wallet",
] as const;


export const dangerousPatterns = [
    /script/i,
    /select/i,
    /insert/i,
    /delete/i,
    /drop/i,
    /union/i,
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /eval\(/i,
    /exec\(/i,
  ];