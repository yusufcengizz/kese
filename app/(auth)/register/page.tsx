"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";

import { registerSchema, type RegisterInput } from "@/lib/schemas";
import { signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    const result = await signUp(data);
    if (result?.error) {
      setServerError(result.error);
    } else if (result?.needsConfirmation) {
      setEmailSent(true);
    }
  }

  if (emailSent) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <MailCheck className="size-10 text-primary" />
            </div>
            <CardTitle className="text-xl font-serif">E-postanı kontrol et</CardTitle>
            <CardDescription>
              <strong>{getValues("email")}</strong> adresine onay linki gönderdik.
              Linke tıkladıktan sonra giriş yapabilirsin.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/login" className="text-sm text-primary underline-offset-4 hover:underline">
              Giriş sayfasına git
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">Kayıt Ol</CardTitle>
          <CardDescription>Ücretsiz hesap oluşturun</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="flex flex-col gap-4">
            {serverError && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {serverError}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">Ad Soyad</Label>
              <Input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="Adınız Soyadınız"
                aria-invalid={!!errors.full_name}
                {...register("full_name")}
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="ornek@mail.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="En az 6 karakter"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm_password">Şifre Tekrar</Label>
              <Input
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                placeholder="Şifrenizi tekrar girin"
                aria-invalid={!!errors.confirm_password}
                {...register("confirm_password")}
              />
              {errors.confirm_password && (
                <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Kayıt yapılıyor…" : "Kayıt Ol"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Giriş Yap
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
