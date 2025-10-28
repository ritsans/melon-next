import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "パスワード再設定",
  description: "パスワード再設定用のメールを送信します",
};

/**
 * パスワード忘れページ
 */
export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <ForgotPasswordForm />
    </div>
  );
}
