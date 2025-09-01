
"use client";

import * as React from "react";
import type { Transaction } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldAlert, ThumbsUp } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const RiskIndicator = ({ score, reason }: { score: number; reason?: string }) => {
  let indicatorClass: string;
  if (score < 40) indicatorClass = "bg-success";
  else if (score < 70) indicatorClass = "bg-yellow-500";
  else indicatorClass = "bg-destructive";

  const content = (
    <div className="flex items-center gap-2 w-[120px]">
      <Progress value={score} indicatorClassName={indicatorClass} />
      <span className="font-semibold">{score}</span>
    </div>
  );

  if (reason) {
    return (
       <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">{content}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{reason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};


const StatusBadge = ({ status }: { status: Transaction["status"] }) => {
  const variantMap: { [key in Transaction["status"]]: "default" | "destructive" | "warning" | "success" } = {
    Analyzing: "warning",
    Flagged: "destructive",
    Completed: "success",
    Error: "destructive",
  };
  
  const badgeClass = {
    warning: "bg-yellow-500/80 text-yellow-50",
    destructive: "",
    success: "",
    default: "",
  }[variantMap[status]];
  
  return <Badge variant={variantMap[status]} className={cn(badgeClass, "capitalize")}>{status}</Badge>;
};

const TransactionDetailsDialog = ({ tx, open, onOpenChange }: { tx: Transaction | null, open: boolean, onOpenChange: (open: boolean) => void }) => {
  if (!tx) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
        <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>ID: {tx.id}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold">${tx.amount.toFixed(2)} {tx.currency}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-muted-foreground">Timestamp</span>
            <span>{format(new Date(tx.timestamp), "PPP p")}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-muted-foreground">User</span>
            <span>{tx.user.name}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-muted-foreground">Location</span>
            <span>{tx.location.city}, {tx.location.country}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={tx.status} />
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-muted-foreground">Risk Score</span>
            {tx.riskScore !== -1 ? (
                <RiskIndicator score={tx.riskScore} reason={tx.reason} />
            ) : (
                <span className="text-muted-foreground">N/A</span>
            )}
            </div>
            {tx.reason && (
            <div className="grid grid-cols-[100px_1fr] items-start gap-4">
                <span className="text-muted-foreground">Reason</span>
                <span className="font-semibold text-destructive">{tx.reason}</span>
            </div>
            )}
        </div>
        </DialogContent>
    </Dialog>
  )
}

export enum TableState {
  RECENT_TRANSACTIONS,
  ALERTS,
  REPORTS,
}

type TransactionsTableProps = {
  transactions: Transaction[];
  caption: string;
  tableState?: TableState;
};

export function TransactionsTable({
  transactions,
  caption,
  tableState = TableState.RECENT_TRANSACTIONS,
}: TransactionsTableProps) {
  const [selectedTx, setSelectedTx] = React.useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleRowClick = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsDialogOpen(true);
  }

  const isAlertsOrReport = tableState === TableState.ALERTS || tableState === TableState.REPORTS;
  
  return (
    <>
      <div className="w-full overflow-hidden border rounded-lg">
        <Table>
          <TableCaption>{caption}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk Score</TableHead>
              {isAlertsOrReport && <TableHead className="text-center">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow 
                key={tx.id}
                onClick={() => handleRowClick(tx)}
                className={cn('cursor-pointer', tx.status === 'Flagged' && 'bg-destructive/10 hover:bg-destructive/20')}
              >
                  <TableCell className="font-mono text-xs">{tx.id.substring(0,8)}...</TableCell>
                  <TableCell>{tx.user.name}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {tx.location.city}, {tx.location.country}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(tx.timestamp), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tx.status} />
                  </TableCell>
                  <TableCell>
                    {tx.riskScore !== -1 ? (
                      <RiskIndicator score={tx.riskScore} reason={tx.reason} />
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  {isAlertsOrReport && (
                     <TableCell className="text-center">
                       <TooltipProvider>
                         <div className="flex justify-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><ThumbsUp className="h-4 w-4 text-success" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Mark as Safe</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><ShieldAlert className="h-4 w-4 text-destructive" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Escalate</TooltipContent>
                          </Tooltip>
                         </div>
                       </TooltipProvider>
                     </TableCell>
                  )}
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TransactionDetailsDialog tx={selectedTx} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
