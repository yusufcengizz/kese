import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div>
        <h1 className="text-4xl font-serif font-semibold">Harcama Analiz</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Kişisel finanslarını tek yerden takip et. Harcamalarını kategorile, AI ile içgörü al.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/login" className={cn(buttonVariants())}>Giriş Yap</Link>
        <Link href="/register" className={cn(buttonVariants({ variant: "outline" }))}>Kayıt Ol</Link>
      </div>
    </main>
  );
}
