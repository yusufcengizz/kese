"use server";

import { revalidatePath } from "next/cache";
import { format, subMonths, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateMonthlyInsight } from "@/lib/claude";
import { currentPeriod } from "@/lib/format";

export async function generateInsight(
  period?: string,
  force = false,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum açık değil" };

  const targetPeriod = period ?? currentPeriod();

  // Check cache unless forced
  if (!force) {
    const { data: cached } = await supabase
      .from("ai_insights")
      .select("id")
      .eq("period", targetPeriod)
      .single();
    if (cached) return {};
  }

  // Fetch this period's transactions aggregated by category
  const startDate = `${targetPeriod}-01`;
  const [y, m] = targetPeriod.split("-").map(Number);
  const endDate = format(new Date(y, m, 0), "yyyy-MM-dd");

  const { data: currentTxs } = await supabase
    .from("transactions")
    .select("type, amount, categories(name)")
    .gte("occurred_on", startDate)
    .lte("occurred_on", endDate);

  const prevPeriod = format(subMonths(parseISO(startDate), 1), "yyyy-MM");
  const prevStart = `${prevPeriod}-01`;
  const [py, pm] = prevPeriod.split("-").map(Number);
  const prevEnd = format(new Date(py, pm, 0), "yyyy-MM-dd");

  const { data: prevTxs } = await supabase
    .from("transactions")
    .select("type, amount, categories(name)")
    .gte("occurred_on", prevStart)
    .lte("occurred_on", prevEnd);

  type TxItem = { type: string; amount: string; categories: { name: string } | null };

  function aggregate(txs: TxItem[] | null) {
    const map = new Map<string, { category: string; total: number; type: string }>();
    for (const t of txs ?? []) {
      const catName = t.categories?.name ?? "Diğer";
      const key = `${catName}|${t.type}`;
      const existing = map.get(key) ?? { category: catName, total: 0, type: t.type };
      existing.total += parseFloat(t.amount);
      map.set(key, existing);
    }
    return Array.from(map.values());
  }

  const insight = await generateMonthlyInsight({
    period: targetPeriod,
    current: aggregate(currentTxs as TxItem[] | null),
    previous: aggregate(prevTxs as TxItem[] | null),
  });

  if (!insight) return { error: "AI içgörü üretilemedi" };

  const admin = createAdminClient();
  const { error } = await admin.from("ai_insights").upsert(
    {
      user_id: user.id,
      period: targetPeriod,
      content: { ...insight, generated_at: new Date().toISOString() },
    },
    { onConflict: "user_id,period" },
  );

  if (error) return { error: error.message };
  revalidatePath("/");
  return {};
}
