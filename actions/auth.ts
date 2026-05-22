"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loginSchema, registerSchema } from "@/lib/schemas";
import type { LoginInput, RegisterInput } from "@/lib/schemas";

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
] as const;

export async function seedNewUser(userId: string, fullName: string): Promise<void> {
  const admin = createAdminClient();

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: userId, full_name: fullName }, { onConflict: "id" });

  if (profileError) {
    console.error("[seedNewUser] profile insert failed:", profileError);
  }

  const { data: existingCats } = await admin
    .from("categories")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (!existingCats || existingCats.length === 0) {
    const { error: catError } = await admin.from("categories").insert(
      DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: userId, is_default: true })),
    );
    if (catError) {
      console.error("[seedNewUser] categories insert failed:", catError);
    }
  }
}

export async function signIn(data: LoginInput): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (
      error.message.includes("Invalid login credentials") ||
      error.message.includes("invalid_credentials")
    ) {
      return { error: "E-posta veya şifre hatalı" };
    }
    return { error: "Giriş yapılamadı, tekrar deneyin" };
  }

  redirect("/dashboard");
}

export async function signUp(data: RegisterInput): Promise<{
  error?: string;
  needsConfirmation?: boolean;
}> {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Ortam değişkeni kontrolü
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { error: "Supabase bağlantısı yapılandırılmamış (.env.local eksik)" };
  }

  const admin = createAdminClient();

  // Admin API ile kullanıcı oluştur — email gönderilmez, direkt onaylı kayıt
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    user_metadata: { full_name: parsed.data.full_name },
    email_confirm: true,
  });

  if (createError) {
    console.error("[signUp] admin createUser error:", createError);
    if (createError.message.toLowerCase().includes("already registered") ||
        createError.message.toLowerCase().includes("already been registered")) {
      return { error: "Bu e-posta adresi zaten kayıtlı" };
    }
    return { error: createError.message };
  }

  const user = created.user;

  // Profil + varsayılan kategorileri oluştur
  await seedNewUser(user.id, parsed.data.full_name);

  // Kullanıcıyı oturuma al
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    return { error: "Kayıt başarılı ama giriş yapılamadı. Lütfen giriş sayfasından deneyin." };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
