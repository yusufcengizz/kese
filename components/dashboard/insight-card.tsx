"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateInsight } from "@/actions/ai";
import type { AiInsight } from "@/types/database";

interface InsightCardProps {
  insight: AiInsight | null;
  period: string;
}

export function InsightCard({ insight, period }: InsightCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateInsight(period, true);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("İçgörü güncellendi");
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-base font-serif flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          AI Aylık Özet
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isPending}>
          <RefreshCw className={isPending ? "animate-spin" : ""} />
          {isPending ? "Üretiliyor…" : "Yenile"}
        </Button>
      </CardHeader>
      <CardContent>
        {insight ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insight.content.summary}
            </p>
            <ul className="space-y-1.5">
              {insight.content.highlights.map((h, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              Bu ay için henüz içgörü üretilmedi.
            </p>
            <Button size="sm" onClick={handleGenerate} disabled={isPending}>
              {isPending ? <RefreshCw className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              İçgörü Üret
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
