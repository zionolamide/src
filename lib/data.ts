
import type { Transaction } from "./types";

const SATOSHIS_PER_BTC = 100_000_000;
const BTC_PRICE_USD = 65000; // A rough, static price for conversion

/**
 * Adapts a raw transaction object from the mempool.space API to our internal Transaction type.
 * @param apiTx The raw transaction object from the API.
 * @returns A Transaction object that our application can use.
 */
export const adaptApiTransaction = (apiTx: any): Transaction => {
  const btcValue = apiTx.value / SATOSHIS_PER_BTC;
  const usdValue = parseFloat((btcValue * BTC_PRICE_USD).toFixed(2));
  
  return {
    id: apiTx.txid,
    amount: usdValue,
    currency: "USD",
    timestamp: new Date().toISOString(), // API doesn't provide a timestamp for recent txs, so we use now.
    user: {
      id: '', // Will be populated on the client
      name: '', // Will be populated on the client
    },
    location: { // Will be populated on the client
      city: '',
      country: '',
    },
    status: 'Analyzing', // Start with "Analyzing" status
    riskScore: -1, // Default risk score until analyzed
    reason: undefined,
  };
};
