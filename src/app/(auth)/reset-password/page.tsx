import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "パスワード再設定",
  description: "新しいパスワードを設定してください",
};

/**
 * パスワード再設定ページ
 */
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <ResetPasswordForm />
    </div>
  );
}
