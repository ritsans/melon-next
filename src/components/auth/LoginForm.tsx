"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth";
import { type LoginFormData, loginSchema } from "@/lib/validations";

/**
 * ログインフォームコンポーネント
 */
export function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const result = await login(data);
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>ログイン</CardTitle>
        <CardDescription>メールアドレスとパスワードでログインしてください</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* メールアドレス */}
          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="text"
              autoComplete="email"
              placeholder="example@email.com"
              {...register("email")}
              disabled={isSubmitting}
              className="mt-2"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          {/* パスワード */}
          <div>
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isSubmitting}
              className="mt-2"
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          {/* ログインボタン */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </Button>

          {/* 認証エラーメッセージ */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* サインアップリンク */}
          <p className="text-center text-sm text-gray-600">
            アカウントをお持ちでない方は
            <Link href="/signup" className="text-blue-600 hover:underline ml-1">
              新規登録
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
