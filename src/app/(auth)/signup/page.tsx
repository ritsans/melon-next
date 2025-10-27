import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "新規登録",
  description: "新しいアカウントを作成してください",
};

/**
 * サインアップページ
 */
export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <SignupForm />
    </div>
  );
}
