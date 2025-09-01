
"use client";

import * as React from "react";
import type { Transaction } from "@/lib/types";
import { summarizeTransactionAlerts } from "@/ai/flows/summarize-transaction-alerts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bot, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function AlertsSummary({
  flaggedTransactions,
}: {
  flaggedTransactions: Transaction[];
}) {
  const [summary, setSummary] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummary("");

    try {
      if (flaggedTransactions.length === 0) {
        setSummary("There are no flagged transactions to summarize.");
        return;
      }

      // We can simplify the data sent to the model to save tokens
      const transactionDetails = JSON.stringify(
        flaggedTransactions.map(tx => ({ 
            id: tx.id, 
            amount: tx.amount,
            user: tx.user.name,
            location: tx.location.city,
        }))
      );
      const alertDetails = JSON.stringify(
        flaggedTransactions.map(tx => ({
            riskScore: tx.riskScore,
            reason: tx.reason
        }))
      );

      const result = await summarizeTransactionAlerts({
        transactionDetails,
        alertDetails,
      });
      
      setSummary(result.summary);

    } catch (e) {
      console.error(e);
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI-Generated Summary</CardTitle>
        <Button 
          onClick={handleGenerateSummary}
          disabled={isLoading || flaggedTransactions.length === 0}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Bot className="mr-2 h-4 w-4" />
          )}
          Generate Summary
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {summary ? (
          <p className="text-sm text-muted-foreground">{summary}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {flaggedTransactions.length > 0 
                ? "Click 'Generate Summary' to get an AI-powered overview of all high-risk alerts."
                : "No high-risk alerts to summarize."
            }
          </p>
        )}
      </CardContent>
    </Card>
  );
}
