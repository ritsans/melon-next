import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "ログイン",
  description: "アカウントにログインしてください",
};

/**
 * ログインページ
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <LoginForm />
    </div>
  );
}
