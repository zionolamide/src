
"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import { sub, format } from "date-fns";
import {
  ChevronDown,
  Download,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type RiskLevels = {
  high: boolean;
  medium: boolean;
  low: boolean;
};

export default function DashboardReportsPage() {
  const { transactions, fetchNewTransaction, isFetching } = useDashboard();
  
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: sub(new Date(), { days: 30 }),
    to: new Date(),
  });
  
  const [riskLevels, setRiskLevels] = React.useState<RiskLevels>({
    high: true,
    medium: true,
    low: true,
  });

  const handleRiskChange = (level: keyof RiskLevels, checked: boolean) => {
    setRiskLevels(prev => ({...prev, [level]: checked}));
  }

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(
      (tx) => {
          // Date filtering
          const txDate = new Date(tx.timestamp);
          const fromDate = dateRange?.from;
          const toDate = dateRange?.to;

          if (fromDate && txDate < fromDate) return false;
          if (toDate && txDate > toDate) return false;

          // Risk level filtering
          const { high, medium, low } = riskLevels;
          const score = tx.riskScore;

          // If no risk levels are checked, show all transactions that match the date range
          if (!high && !medium && !low) return true;

          // Otherwise, check against selected risk levels
          if (high && score >= 70) return true;
          if (medium && score >= 40 && score < 70) return true;
          if (low && score < 40 && score > -1) return true;

          return false;
      }
    );
  }, [transactions, dateRange, riskLevels]);

  const handleExport = () => {
    const headers = [
      "ID", "Amount", "Currency", "Timestamp", "User", "Location", "Status", "Risk Score", "Reason"
    ];
    const rows = filteredTransactions.map(tx => [
      tx.id,
      tx.amount,
      tx.currency,
      format(new Date(tx.timestamp), "yyyy-MM-dd HH:mm:ss"),
      tx.user.name,
      `${tx.location.city}, ${tx.location.country}`,
      tx.status,
      tx.riskScore,
      `"${(tx.reason || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fraud_sentinel_report_${format(new Date(), "yyyyMMddHHmmss")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <main className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
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
      <Card>
        <CardHeader>
            <CardTitle>Transaction Report Generator</CardTitle>
            <CardDescription>Filter transactions by date range and risk level to generate a report.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                />
                <div className="flex items-center gap-2">
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
                    <Button variant="default" onClick={handleExport} disabled={filteredTransactions.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>
            <TransactionsTable
                transactions={filteredTransactions}
                caption="A list of all transactions matching the filter criteria."
                tableState={TableState.REPORTS}
            />
        </CardContent>
      </Card>
    </main>
  );
}
