"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TransactionType } from "@/types/database";

export async function createTransaction(data: {
  account_id: string;
  category_id?: string;
  type: TransactionType;
  amount: number;
  occurred_on: string;
  description: string;
  note?: string;
  ai_categorized?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açık değil");

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    ...data,
    amount: data.amount.toString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/islemler");
  revalidatePath("/");
}

export async function updateTransaction(
  id: string,
  data: {
    account_id?: string;
    category_id?: string | null;
    type?: TransactionType;
    amount?: number;
    occurred_on?: string;
    description?: string;
    note?: string | null;
  },
) {
  const supabase = await createClient();
  const payload = {
    ...data,
    ...(data.amount !== undefined ? { amount: data.amount.toString() } : {}),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("transactions").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/islemler");
  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/islemler");
  revalidatePath("/");
}
