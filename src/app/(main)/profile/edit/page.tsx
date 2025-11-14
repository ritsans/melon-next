import { redirect } from "next/navigation";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { ProfileEditPageContent } from "@/components/profile/ProfileEditPageContent";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "プロフィール編集",
};

/**
 * プロフィール編集ページ
 * 認証済みユーザーのみアクセス可能
 */
export default async function ProfileEditPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // プロフィール情報を取得
  const profile = await getProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  // メールアドレスを取得
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const email = authUser?.email || "";

  return <ProfileEditPageContent profile={profile} email={email} />;
}
