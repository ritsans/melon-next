"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth";
import { type ResetPasswordFormData, resetPasswordSchema } from "@/lib/validations";

/**
 * パスワード再設定フォームコンポーネント
 */
export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    const result = await resetPassword(data);
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>新しいパスワードの設定</CardTitle>
        <CardDescription>新しいパスワードを入力してください</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* パスワード */}
          <div>
            <Label htmlFor="password">新しいパスワード</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isSubmitting}
              className="mt-2"
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
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
              className="mt-2"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* 再設定ボタン */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "設定中..." : "パスワードを再設定"}
          </Button>

          {/* エラーメッセージ */}
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
