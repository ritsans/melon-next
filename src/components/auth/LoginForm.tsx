"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
    <Card className="w-full max-w-4xl py-0 sm:flex-row sm:gap-0">
      <CardContent className="basis-2/5 px-0">
        <Image
          src="/melon1.jpg"
          width={358}
          height={447}
          alt="Login Banner"
          className="size-full rounded-l-xl object-cover"
        />
      </CardContent>
      <div className="basis-3/5">
        <CardHeader className="py-8 px-8">
          <CardTitle>ログイン</CardTitle>
          <CardDescription>メールアドレスとパスワードでログインしてください</CardDescription>
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
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            {/* パスワード */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">パスワード</Label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  パスワードを忘れた方はこちら
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                disabled={isSubmitting}
                className="mt-2 mb-2"
              />
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            {/* ログインボタン */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </Button>

            {/* 認証エラーメッセージ */}
            {error && <p className="text-center text-sm text-red-600">{error}</p>}

            {/* 区切り線 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">または</span>
              </div>
            </div>

            {/* Google ログインボタン（未実装） */}
            <Button type="button" variant="outline" className="w-full" disabled>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Googleでログイン（準備中）
            </Button>

            {/* サインアップリンク */}
            <p className="text-center text-sm text-gray-600">
              アカウントをお持ちでない方は
              <Link href="/signup" className="text-blue-600 hover:underline ml-1">
                新規登録
              </Link>
            </p>
          </form>
        </CardContent>
      </div>
    </Card>
  );
}
