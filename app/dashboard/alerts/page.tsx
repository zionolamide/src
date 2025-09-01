
"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import { sub } from "date-fns";
import {
  ChevronDown,
  Loader2,
  Sparkles,
} from "lucide-react";

import { useDashboard } from "@/contexts/DashboardContext";

import {
  TableState,
  TransactionsTable,
} from "@/components/dashboard/transactions-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { SidebarTrigger } from "@/components/ui/sidebar";

type RiskLevels = {
  high: boolean;
  medium: boolean;
  low: boolean;
};

export default function DashboardAlertsPage() {
   const { transactions, fetchNewTransaction, isFetching } = useDashboard();
  
   const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: sub(new Date(), { days: 30 }),
    to: new Date(),
  });
  
  const [riskLevels, setRiskLevels] = React.useState<RiskLevels>({
    high: true,
    medium: false,
    low: false,
  });

  const handleRiskChange = (level: keyof RiskLevels, checked: boolean) => {
    setRiskLevels(prev => ({...prev, [level]: checked}));
  }

  const flaggedTransactions = React.useMemo(() => {
    return transactions.filter(
      (tx) => {
          if (tx.status !== "Flagged") return false;

          const { high, medium, low } = riskLevels;
          const score = tx.riskScore;

          if (!high && !medium && !low) return true; // Show all if none are selected

          if (high && score >= 70) return true;
          if (medium && score >= 40 && score < 70) return true;
          if (low && score < 40) return true;

          return false;
      }
    );
  }, [transactions, riskLevels]);

  return (
    <main className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-3xl font-bold tracking-tight">Alerts</h2>
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
       <div className="flex items-center gap-4">
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Filter by Risk <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Risk Level</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem 
                checked={riskLevels.high}
                onCheckedChange={(checked) => handleRiskChange('high', !!checked)}
            >
              High (70-100)
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
                checked={riskLevels.medium}
                onCheckedChange={(checked) => handleRiskChange('medium', !!checked)}
            >
              Medium (40-69)
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
                checked={riskLevels.low}
                onCheckedChange={(checked) => handleRiskChange('low', !!checked)}
            >
              Low (0-39)
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <TransactionsTable
        transactions={flaggedTransactions}
        caption="A list of all transactions flagged for review."
        tableState={TableState.ALERTS}
      />
    </main>
  );
}
