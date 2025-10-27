"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/auth";
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>新規登録</CardTitle>
        <CardDescription>メールアドレスとパスワードでアカウントを作成してください</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* エラーメッセージ */}
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

          {/* メールアドレス */}
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              {...register("email")}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {/* パスワード */}
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isSubmitting}
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {/* パスワード確認 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード（確認）</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

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
    </Card>
  );
}
