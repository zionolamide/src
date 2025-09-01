import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  title: string;
  value: string | number;
  change: string;
  variant?: "default" | "success" | "warning" | "danger";
};

export function KpiCard({
  title,
  value,
  change,
  variant = "default",
}: KpiCardProps) {
  const variantClasses = {
    default: "text-primary",
    success: "text-success",
    warning: "text-yellow-500",
    danger: "text-destructive",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn("text-3xl font-bold", variantClasses[variant])}
        >
          {value}
        </div>
        <p className="text-xs text-muted-foreground pt-1">{change}</p>
      </CardContent>
    </Card>
  );
}
