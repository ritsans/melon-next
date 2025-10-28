"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/auth";
import { type ForgotPasswordFormData, forgotPasswordSchema } from "@/lib/validations";

/**
 * パスワード忘れフォームコンポーネント
 */
export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    const result = await forgotPassword(data);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>パスワード再設定</CardTitle>
        <CardDescription>登録したメールアドレスにパスワード再設定用のリンクを送信します</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <p className="text-center text-sm text-green-600">
              パスワード再設定用のメールを送信しました。
              <br />
              メールをご確認ください。
            </p>
            <Link href="/login">
              <Button className="w-full" variant="outline">
                ログインページに戻る
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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

            {/* 送信ボタン */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : "送信する"}
            </Button>

            {/* エラーメッセージ */}
            {error && <p className="text-center text-sm text-red-600">{error}</p>}

            {/* ログインに戻るリンク */}
            <p className="text-center text-sm text-gray-600">
              <Link href="/login" className="text-blue-600 hover:underline">
                ログインページに戻る
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
