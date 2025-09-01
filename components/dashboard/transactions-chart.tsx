"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Transaction } from "@/lib/types";
import { format, subMinutes } from "date-fns";

export function TransactionsChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const chartData = React.useMemo(() => {
    const now = new Date();
    const minutes = Array.from({ length: 15 }, (_, i) =>
      subMinutes(now, 14 - i)
    );

    return minutes.map((minute) => {
      const timeLabel = format(minute, "HH:mm");
      const txInMinute = transactions.filter((tx) => {
        const txDate = new Date(tx.timestamp);
        return (
          txDate.getHours() === minute.getHours() &&
          txDate.getMinutes() === minute.getMinutes()
        );
      });
      return {
        time: timeLabel,
        total: txInMinute.length,
        flagged: txInMinute.filter((tx) => tx.status === "Flagged").length,
      };
    });
  }, [transactions]);

  const chartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--primary))",
    },
    flagged: {
      label: "Flagged",
      color: "hsl(var(--destructive))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Volume</CardTitle>
        <CardDescription>Total vs. Flagged transactions in the last 15 minutes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
             />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            <Bar dataKey="flagged" fill="var(--color-flagged)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
