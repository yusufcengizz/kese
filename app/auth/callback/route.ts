import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_CATEGORIES = [
  { name: "Market",          type: "expense", icon: "shopping-cart",  color: "#F59E0B" },
  { name: "Restoran & Kafe", type: "expense", icon: "utensils",       color: "#EF4444" },
  { name: "Ulaşım",          type: "expense", icon: "car",            color: "#3B82F6" },
  { name: "Faturalar",       type: "expense", icon: "zap",            color: "#8B5CF6" },
  { name: "Kira",            type: "expense", icon: "home",           color: "#EC4899" },
  { name: "Sağlık",          type: "expense", icon: "heart-pulse",    color: "#10B981" },
  { name: "Giyim",           type: "expense", icon: "shirt",          color: "#F97316" },
  { name: "Eğlence",         type: "expense", icon: "tv",             color: "#06B6D4" },
  { name: "Abonelikler",     type: "expense", icon: "repeat",         color: "#6366F1" },
  { name: "Eğitim",          type: "expense", icon: "graduation-cap", color: "#84CC16" },
  { name: "Diğer Gider",     type: "expense", icon: "more-horizontal",color: "#9CA3AF" },
  { name: "Maaş",            type: "income",  icon: "briefcase",      color: "#10B981" },
  { name: "Ek Gelir",        type: "income",  icon: "plus-circle",    color: "#34D399" },
  { name: "Diğer Gelir",     type: "income",  icon: "wallet",         color: "#6EE7B7" },
];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const admin = createAdminClient();

      // Profil yoksa oluştur
      const { data: existing } = await admin
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existing) {
        await admin.from("profiles").insert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name ?? "",
        });
        await admin.from("categories").insert(
          DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: data.user.id, is_default: true })),
        );
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
