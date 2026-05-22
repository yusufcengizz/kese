"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Açık", icon: Sun },
  { value: "dark", label: "Koyu", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
] as const;

export default function AyarlarPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-6 max-w-lg">
      <PageHeader title="Ayarlar" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tema</CardTitle>
          <CardDescription>Arayüz görünümünü seçin</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Course req: Flexbox */}
          <div className="flex gap-3">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                disabled={!mounted}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                  mounted && theme === value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted",
                )}
              >
                <Icon className="size-5" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
