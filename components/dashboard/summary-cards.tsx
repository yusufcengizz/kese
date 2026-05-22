import { TrendingUp, TrendingDown, Wallet, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  income: number;
  expense: number;
  net: number;
  totalBalance: number;
}

// Course req: reusable component with props
export function SummaryCards({ income, expense, net, totalBalance }: SummaryCardsProps) {
  const cards = [
    {
      title: "Bu Ay Gelir",
      value: income,
      icon: TrendingUp,
      valueClass: "text-success",
    },
    {
      title: "Bu Ay Gider",
      value: expense,
      icon: TrendingDown,
      valueClass: "text-foreground",
    },
    {
      title: "Net",
      value: net,
      icon: BarChart3,
      valueClass: net >= 0 ? "text-success" : "text-destructive",
    },
    {
      title: "Toplam Bakiye",
      value: totalBalance,
      icon: Wallet,
      valueClass: totalBalance >= 0 ? "text-foreground" : "text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{card.title}</span>
              <card.icon className="size-4 text-muted-foreground" />
            </div>
            <p className={cn("text-lg font-mono font-semibold tabular-nums", card.valueClass)}>
              {formatMoney(card.value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
