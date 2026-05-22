import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/shared/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <AppNav />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 pb-24 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}
