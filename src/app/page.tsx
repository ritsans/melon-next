import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const user = await getCurrentUser();

  // ログイン済みの場合は適切なページへリダイレクト
  if (user) {
    const profile = await getProfile(user.id);

    if (!profile || !profile.onboarding_completed) {
      redirect("/onboarding");
    }

    redirect("/home");
  }

  // 未ログインの場合はランディングページを表示
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Melon</CardTitle>
          <CardDescription>コミュニティ型コンテンツプラットフォーム</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-neutral-600">
            あなたはまだログインしていません。
            <br />
            アカウントをお持ちの方はログインしてください。
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="w-full">
              <Button className="w-full" size="lg">
                ログイン
              </Button>
            </Link>
            <Link href="/signup" className="w-full">
              <Button variant="outline" className="w-full" size="lg">
                アカウント作成
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
