"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AccountType } from "@/types/database";

export async function createAccount(data: {
  name: string;
  type: AccountType;
  opening_balance: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açık değil");

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    name: data.name,
    type: data.type,
    opening_balance: data.opening_balance,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/hesaplar");
  revalidatePath("/");
}

export async function updateAccount(
  id: string,
  data: { name: string; type: AccountType; opening_balance: number },
) {
  const supabase = await createClient();
  const { error } = await supabase.from("accounts").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/hesaplar");
  revalidatePath("/");
}

export async function archiveAccount(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({ is_archived: true })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/hesaplar");
  revalidatePath("/");
}

export async function deleteAccount(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/hesaplar");
  revalidatePath("/");
}
