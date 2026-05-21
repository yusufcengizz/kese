"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/schemas";
import type { LoginInput, RegisterInput } from "@/lib/schemas";

export async function signIn(data: LoginInput): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "E-posta veya şifre hatalı" };
    }
    return { error: "Giriş yapılamadı, tekrar deneyin" };
  }

  redirect("/");
}

export async function signUp(data: RegisterInput): Promise<{ error?: string }> {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Bu e-posta zaten kayıtlı" };
    }
    return { error: "Kayıt olunamadı, tekrar deneyin" };
  }

  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
