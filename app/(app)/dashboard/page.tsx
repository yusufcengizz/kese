import { format, subMonths, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { currentPeriod } from "@/lib/format";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { CategoryPieChart, type PieSlice } from "@/components/dashboard/category-pie-chart";
import { TrendChart, type MonthTrend } from "@/components/dashboard/trend-chart";
import { InsightCard } from "@/components/dashboard/insight-card";
import { PageHeader } from "@/components/shared/page-header";
import type { AiInsight } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const period = currentPeriod();
  const now = new Date();

  const startOfMonth = `${period}-01`;
  const [y, m] = period.split("-").map(Number);
  const endOfMonth = format(new Date(y, m, 0), "yyyy-MM-dd");

  const { data: monthlyTxs } = await supabase
    .from("transactions")
    .select("type, amount, category_id, categories(id, name, color)")
    .gte("occurred_on", startOfMonth)
    .lte("occurred_on", endOfMonth);

  type MonthTx = {
    type: string;
    amount: string;
    category_id: string | null;
    categories: { id: string; name: string; color: string | null } | null;
  };

  const txs = (monthlyTxs as MonthTx[] | null) ?? [];
  const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
  const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
  const net = income - expense;

  const { data: balances } = await supabase.from("account_balances").select("balance");
  const totalBalance =
    (balances as Array<{ balance: string }> | null)?.reduce((s, b) => s + parseFloat(b.balance), 0) ?? 0;

  const CHART_COLORS = ["#F59E0B", "#D97706", "#B45309", "#92400E", "#78350F"];
  const catMap = new Map<string, PieSlice>();
  txs
    .filter((t) => t.type === "expense" && t.categories)
    .forEach((t) => {
      const id = t.category_id!;
      const existing = catMap.get(id) ?? {
        name: t.categories!.name,
        value: 0,
        color: t.categories!.color ?? CHART_COLORS[catMap.size % 5],
      };
      existing.value += parseFloat(t.amount);
      catMap.set(id, existing);
    });
  const pieData: PieSlice[] = Array.from(catMap.values()).sort((a, b) => b.value - a.value).slice(0, 5);

  const trendStart = `${format(subMonths(now, 5), "yyyy-MM")}-01`;
  const { data: trendTxs } = await supabase
    .from("transactions")
    .select("occurred_on, type, amount")
    .gte("occurred_on", trendStart);

  const trendMap = new Map<string, { income: number; expense: number }>();
  for (let i = 0; i <= 5; i++) trendMap.set(format(subMonths(now, 5 - i), "yyyy-MM"), { income: 0, expense: 0 });
  for (const t of (trendTxs as Array<{ occurred_on: string; type: string; amount: string }> | null) ?? []) {
    const key = t.occurred_on.slice(0, 7);
    const entry = trendMap.get(key);
    if (entry) {
      if (t.type === "income") entry.income += parseFloat(t.amount);
      else entry.expense += parseFloat(t.amount);
    }
  }
  const trendData: MonthTrend[] = Array.from(trendMap.entries()).map(([key, data]) => ({
    month: format(parseISO(`${key}-01`), "MMM", { locale: tr }),
    ...data,
  }));

  const { data: insight } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("period", period)
    .single();

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description={format(now, "MMMM yyyy", { locale: tr })} />

      {/* Course req §3.2: CSS Grid — 2D layout */}
      <SummaryCards income={income} expense={expense} net={net} totalBalance={totalBalance} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryPieChart data={pieData} />
        <TrendChart data={trendData} />
      </div>

      <InsightCard insight={insight as AiInsight | null} period={period} />
    </div>
  );
}
