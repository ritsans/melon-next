"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormError } from "@/components/ui/form-error";
import { signup } from "@/lib/auth";
import Image from "next/image";
import { type SignupFormData, signupSchema } from "@/lib/validations";

/**
 * サインアップフォームコンポーネント
 */
export function SignupForm() {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setError(null);
    const result = await signup(data);
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <Card className="w-full max-w-4xl py-0 sm:flex-row sm:gap-0">
      <CardContent className="basis-2/5 px-0">
        <Image
          src="/melon2.jpg"
          alt="Signup Banner"
          width={358}
          height={447}
          className="size-full rounded-l-xl object-cover"
        />
      </CardContent>
      <div className="basis-3/5">
        <div className="px-3 pt-2">
          <Link href="/" className="text-sm text-primary hover:underline">
            Back
          </Link>
        </div>
        <CardHeader className="py-8 px-8">
          <CardTitle>新規登録</CardTitle>
          <CardDescription>メールアドレスとパスワードでアカウントを作成してください</CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 max-w-sm mx-auto">
            {/* メールアドレス */}
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                {...register("email")}
                disabled={isSubmitting}
                className="mt-2"
              />
              <FormError error={errors.email?.message} className="mt-1" />
            </div>

            {/* パスワード */}
            <div>
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("password")}
                disabled={isSubmitting}
                className="mt-2"
              />
              <FormError error={errors.password?.message} className="mt-1" />
            </div>

            {/* パスワード確認 */}
            <div>
              <Label htmlFor="confirmPassword">パスワード（確認）</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                disabled={isSubmitting}
                className="mt-2 mb-2"
              />
              <FormError error={errors.confirmPassword?.message} className="mt-1" />
            </div>

            {/* 認証エラーメッセージ */}
            {error && <ErrorMessage message={error} />}

            {/* サインアップボタン */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "アカウントを作成"}
            </Button>

            {/* ログインリンク */}
            <p className="text-center text-sm text-gray-600">
              すでにアカウントをお持ちの方は
              <Link href="/login" className="text-blue-600 hover:underline ml-1">
                ログイン
              </Link>
            </p>
          </form>
        </CardContent>
      </div>
    </Card>
  );
}
