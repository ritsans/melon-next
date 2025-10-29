import { OnboardingForm } from "@/components/auth/OnboardingForm";

/**
 * オンボーディングページ
 * 初回ユーザー登録後のプロフィール設定画面
 */
export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <OnboardingForm />
    </div>
  );
}
