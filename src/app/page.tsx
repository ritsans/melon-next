import { redirect } from "next/navigation";
import { getCurrentUser, getProfile } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    // 未ログインの場合はログインページへリダイレクト
    redirect("/login");
  }

  // ログイン済みの場合、オンボーディング完了状態を確認
  const profile = await getProfile(user.id);

  if (!profile || !profile.onboarding_completed) {
    // オンボーディング未完了の場合はオンボーディングページへ
    redirect("/onboarding");
  }

  // オンボーディング完了済みの場合はホームへリダイレクト
  redirect("/home");
}
