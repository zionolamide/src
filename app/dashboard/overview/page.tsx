
"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import { sub } from "date-fns";
import {
  FileWarning,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { useDashboard } from "@/contexts/DashboardContext";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TransactionsChart } from "@/components/dashboard/transactions-chart";
import {
  TableState,
  TransactionsTable,
} from "@/components/dashboard/transactions-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AlertsSummary } from "@/components/dashboard/alerts-summary";

export default function DashboardOverviewPage() {
  const { transactions, fetchNewTransaction, isFetching } = useDashboard();
  
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: sub(new Date(), { days: 7 }),
    to: new Date(),
  });

  const flaggedTransactions = transactions.filter(
    (tx) => tx.status === "Flagged"
  );
  const totalTransactionValue = transactions.reduce(
    (acc, tx) => acc + tx.amount,
    0
  );
  const atRiskValue = flaggedTransactions.reduce(
    (acc, tx) => acc + tx.amount,
    0
  );

  return (
    <main className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => fetchNewTransaction()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Analyze New Transaction
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Transactions"
          value={transactions.length}
          change="Analyzed via mempool"
          variant="default"
        />
        <KpiCard
          title="Flagged Transactions"
          value={flaggedTransactions.length}
          change="High-risk activity"
          variant="warning"
        />
        <KpiCard
          title="Total Value (USD)"
          value={`$${totalTransactionValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          change="Based on analyzed txs"
          variant="success"
        />
        <KpiCard
          title="Value at Risk (USD)"
          value={`$${atRiskValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          change="Potentially fraudulent"
          variant="danger"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <TrendingUp className="mr-2 h-4 w-4" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="alerts-summary">
            <FileWarning className="mr-2 h-4 w-4" />
            Alerts Summary
            <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {flaggedTransactions.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <TransactionsChart transactions={transactions} />
            </div>
            <div className="col-span-3">
              <TransactionsTable
                transactions={transactions.slice(0, 5)}
                caption="A list of the most recent transactions."
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="alerts-summary" className="space-y-4">
          <AlertsSummary flaggedTransactions={flaggedTransactions} />
          <TransactionsTable
            transactions={flaggedTransactions}
            caption="A list of all transactions flagged for review."
            tableState={TableState.ALERTS}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
