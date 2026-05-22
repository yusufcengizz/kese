import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BarChart3, Sparkles, Shield, Wallet, ArrowRight,
  TrendingUp, TrendingDown, Tag, Zap, CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="size-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-semibold text-base">Kese</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#ozellikler" className="hover:text-foreground transition-colors">Özellikler</a>
            <a href="#nasil-calisir" className="hover:text-foreground transition-colors">Nasıl Çalışır?</a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Kayıt Ol
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Sol — Metin */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary font-medium">
              <Sparkles className="size-3" />
              AI destekli akıllı harcama takibi
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-tight">
              Finansını tek <br />
              <span className="text-primary">yerden yönet</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              Gelir ve giderlerini kaydet, kategorilere göre analiz et,
              grafiklerde izle. AI her ay sana özel içgörüler üretir.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
                Ücretsiz başla
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                Giriş yap
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Kredi kartı gerekmez · Tamamen ücretsiz
            </p>
          </div>

          {/* Sağ — Mock Dashboard */}
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card shadow-xl p-5 space-y-4">
              {/* Mini header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Mayıs 2026</span>
                <span className="text-xs text-primary font-medium">Dashboard</span>
              </div>

              {/* Özet kartlar */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Gelir", value: "₺12.500", color: "text-success" },
                  { label: "Gider", value: "₺8.340", color: "text-foreground" },
                  { label: "Net", value: "₺4.160", color: "text-primary" },
                ].map((c) => (
                  <div key={c.label} className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[10px] text-muted-foreground mb-1">{c.label}</p>
                    <p className={cn("text-sm font-mono font-semibold tabular-nums", c.color)}>
                      {c.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Mini bar chart */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-muted-foreground font-medium">Son 6 Ay</p>
                <div className="flex items-end gap-1.5 h-16">
                  {[40, 65, 50, 80, 55, 90].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                      <div
                        className="w-full rounded-t-sm bg-primary/20"
                        style={{ height: `${h * 0.4}px` }}
                      />
                      <div
                        className="w-full rounded-t-sm bg-primary"
                        style={{ height: `${h * 0.25}px` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  {["Ara", "Oca", "Şub", "Mar", "Nis", "May"].map((m) => (
                    <span key={m} className="text-[9px] text-muted-foreground">{m}</span>
                  ))}
                </div>
              </div>

              {/* Son işlemler */}
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground font-medium">Son İşlemler</p>
                {[
                  { name: "Market alışverişi", cat: "Market", amount: "-₺320", income: false },
                  { name: "Maaş", cat: "Maaş", amount: "+₺12.500", income: true },
                  { name: "Elektrik faturası", cat: "Faturalar", amount: "-₺185", income: false },
                ].map((tx) => (
                  <div key={tx.name} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-xs font-medium">{tx.name}</p>
                      <p className="text-[10px] text-muted-foreground">{tx.cat}</p>
                    </div>
                    <span className={cn("text-xs font-mono font-semibold tabular-nums", tx.income ? "text-success" : "text-foreground")}>
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI badge — floating */}
            <div className="absolute -bottom-4 -left-4 rounded-xl border border-primary/20 bg-card px-3 py-2 shadow-lg flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <div>
                <p className="text-[10px] font-medium">AI İçgörü</p>
                <p className="text-[10px] text-muted-foreground">Market harcaman %18 arttı</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ÖZELLİKLER ─────────────────────────────────────── */}
      <section id="ozellikler" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-semibold">Her şey bir arada</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Finansal takip için ihtiyacın olan tüm araçlar, tek bir uygulamada.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Wallet,
                title: "Hesap Yönetimi",
                desc: "Nakit, banka ve kredi kartı hesaplarını ayrı ayrı takip et. Gerçek zamanlı bakiye hesaplama.",
              },
              {
                icon: Tag,
                title: "Akıllı Kategoriler",
                desc: "14 varsayılan kategori ile hemen başla, istediğin kadar özel kategori ekle.",
              },
              {
                icon: BarChart3,
                title: "Görsel Analiz",
                desc: "Pasta grafiği ile harcama dağılımını, trend grafiği ile 6 aylık seyri incele.",
              },
              {
                icon: Sparkles,
                title: "AI İçgörüleri",
                desc: "Her ay verilerini analiz ederek sana özel, somut tasarruf önerileri sunar.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ───────────────────────────────────── */}
      <section id="nasil-calisir" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-semibold">3 adımda başla</h2>
            <p className="text-muted-foreground mt-3">Dakikalar içinde kullanmaya başlayabilirsin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-8 left-[calc(16.7%+1rem)] right-[calc(16.7%+1rem)] h-px bg-border" />

            {[
              {
                step: "01",
                icon: CheckCircle2,
                title: "Hesap oluştur",
                desc: "E-posta ve şifrenle saniyeler içinde kayıt ol. Kredi kartı istenmez.",
              },
              {
                step: "02",
                icon: Zap,
                title: "İşlem ekle",
                desc: "Gelir ve giderlerini gir. AI otomatik olarak kategori önerisi yapar.",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Analiz et",
                desc: "Dashboard'da harcamalarını görselleştir, AI aylık özetini oluşturur.",
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center gap-4">
                <div className="relative size-16 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center">
                  <s.icon className="size-7 text-primary" />
                  <span className="absolute -top-2 -right-2 size-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GÜVEN BANDI ─────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield, value: "Güvenli", desc: "Verilen kullanıcı bazlı izolasyon ile korunur" },
              { icon: Sparkles, value: "AI Destekli", desc: "Claude AI ile akıllı kategori ve içgörü" },
              { icon: TrendingDown, value: "Ücretsiz", desc: "Tüm özellikler tamamen ücretsiz kullanılabilir" },
            ].map((s) => (
              <div key={s.value} className="flex flex-col items-center gap-2">
                <s.icon className="size-6 text-primary" />
                <p className="font-semibold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold">
            Finansal kontrolü geri al
          </h2>
          <p className="text-muted-foreground text-lg">
            Harcamalarını anlamak için ilk adımı şimdi at. Ücretsiz, hızlı, kolay.
          </p>
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "gap-2 px-8")}>
            Hemen başla — ücretsiz
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-border bg-muted/20 py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Marka */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
                  <Wallet className="size-4 text-primary-foreground" />
                </div>
                <span className="font-serif font-semibold">Kese</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Kişisel finans takip uygulaması. Harcamalarını kategorile,
                trendleri izle, AI ile tasarruf et.
              </p>
            </div>

            {/* Uygulama */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">Uygulama</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Giriş Yap</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Kayıt Ol</Link></li>
                <li><a href="#ozellikler" className="hover:text-foreground transition-colors">Özellikler</a></li>
              </ul>
            </div>

            {/* Özellikler */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">Özellikler</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>İşlem Takibi</li>
                <li>Kategori Yönetimi</li>
                <li>Gelir / Gider Grafikleri</li>
                <li>AI Aylık İçgörüler</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Kese. Tüm hakları saklıdır.</p>
            <p>Next.js · Supabase · Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
