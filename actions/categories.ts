"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TransactionType } from "@/types/database";

export async function createCategory(data: {
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
  parent_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açık değil");

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    ...data,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/kategoriler");
}

export async function updateCategory(
  id: string,
  data: { name: string; color?: string; icon?: string },
) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/kategoriler");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/kategoriler");
}
