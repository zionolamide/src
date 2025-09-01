
"use client";

import * as React from "react";
import type { Transaction } from "@/lib/types";
import { adaptApiTransaction } from "@/lib/data";
import { analyzeTransactionData } from "@/ai/flows/analyze-transaction-data";
import { useToast } from "@/hooks/use-toast";

interface DashboardContextType {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  fetchNewTransaction: () => Promise<void>;
  isFetching: boolean;
}

const DashboardContext = React.createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const processedTxIds = React.useRef(new Set<string>());
  const { toast } = useToast();

  const fetchNewTransaction = async () => {
    if (isFetching) return;
    setIsFetching(true);
    
    const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const randomUsers = [
        "Bitcoin Whale", "Crypto Trader", "NFT Artist", "Dark Web Shopper", "Satoshi's Ghost"
    ];
    const locations = [
      { city: "New York", country: "USA" },
      { city: "London", country: "UK" },
      { city: "Tokyo", country: "Japan" },
      { city: "Sydney", country: "Australia" },
      { city: "São Paulo", country: "Brazil" },
      { city: "Lagos", country: "Nigeria" },
      { city: "Moscow", country: "Russia" },
      { city: "Mumbai", country: "India" },
      { city: "Unknown", country: "Unknown" },
      { city: "Internet", country: "Cyberia"}
    ];
    
    try {
      const response = await fetch("https://mempool.space/api/mempool/recent");

      if (!response.ok) {
        throw new Error("Failed to fetch data from mempool.space");
      }
      const recentTxs: any[] = await response.json();
      
      const txToProcess = recentTxs.find(tx => !processedTxIds.current.has(tx.txid));

      if (!txToProcess) {
        toast({
          title: "No New Transactions",
          description: "All recent transactions from the mempool have been analyzed.",
        });
        setIsFetching(false);
        return;
      }

      const adaptedTx = adaptApiTransaction(txToProcess);
      adaptedTx.user = {
          id: `bitcoin_user_${Math.random().toString(36).substr(2, 9)}`,
          name: getRandomItem(randomUsers),
      };
      adaptedTx.location = getRandomItem(locations);
      
      processedTxIds.current.add(adaptedTx.id);
      
      setTransactions(prev => [adaptedTx, ...prev]);

      toast({
        title: `New Transaction Received`,
        description: `Processing transaction ${adaptedTx.id.substring(0, 8)}...`,
      });
      
      const result = await analyzeTransactionData({ transactionData: JSON.stringify(adaptedTx) });
      
      const isSuspicious = result.isSuspicious;
      const finalStatus = isSuspicious ? "Flagged" : "Completed";
      const riskScore = Math.round(result.riskScore * 100);

      setTransactions(prev =>
        prev.map(t =>
          t.id === adaptedTx.id
            ? { ...t, status: finalStatus, riskScore, reason: result.reason }
            : t
        )
      );

      if (isSuspicious) {
        toast({
          variant: "destructive",
          title: "High-Risk Transaction Detected",
          description: `Transaction ${adaptedTx.id.substring(0, 8)}... flagged. Reason: ${result.reason}`,
        });
      }

    } catch (error) {
      console.error("Error fetching or processing transaction:", error);
      const errorMessage = error instanceof Error && error.message.includes('Failed to fetch')
        ? "Could not fetch data. Please check your internet connection or try disabling your ad-blocker."
        : "Could not process new transaction data.";
      
      toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
      });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <DashboardContext.Provider 
      value={{ transactions, setTransactions, fetchNewTransaction, isFetching }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = React.useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
