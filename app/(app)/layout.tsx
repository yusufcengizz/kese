import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      {/* AppNav — Faz 3'te tamamlanacak */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-sidebar p-4">
        <p className="text-sm font-medium text-sidebar-foreground">Harcama Analiz</p>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
