import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

interface MoneyTextProps {
  amount: number | string;
  type?: "income" | "expense" | "neutral";
  className?: string;
  mono?: boolean;
}

export function MoneyText({ amount, type = "neutral", className, mono = true }: MoneyTextProps) {
  return (
    <span
      className={cn(
        mono && "font-mono tabular-nums",
        type === "income" && "text-success",
        type === "expense" && "text-destructive",
        type === "neutral" && "text-foreground",
        className,
      )}
    >
      {type === "income" && "+"}
      {formatMoney(amount)}
    </span>
  );
}
