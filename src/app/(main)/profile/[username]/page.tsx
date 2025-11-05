import { notFound } from "next/navigation";
import { User } from "lucide-react";
import { getProfileByUsername } from "@/lib/auth";
import { getPostsByUser } from "@/lib/posts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PostCard } from "@/components/posts/PostCard";
import { tagLabel } from "@/lib/tags";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // プロフィール情報を取得
  const profile = await getProfileByUsername(username);

  // プロフィールが存在しない場合は404
  if (!profile) {
    notFound();
  }

  // ユーザーの投稿を取得
  const posts = await getPostsByUser(profile.id);

  // アバター用のイニシャル取得
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* プロフィールカード */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            {/* アバター */}
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-neutral-200 text-neutral-700 text-xl">
                {profile.display_name || profile.username ? (
                  getInitials(profile.display_name || profile.username)
                ) : (
                  <User className="h-10 w-10" />
                )}
              </AvatarFallback>
            </Avatar>

            {/* ユーザー情報 */}
            <div className="flex-1 space-y-2">
              <div>
                <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
                {profile.display_name && (
                  <p className="text-neutral-600 text-sm">@{profile.username}</p>
                )}
              </div>

              {/* バイオ */}
              {profile.bio && <p className="text-neutral-700">{profile.bio}</p>}

              {/* 興味タグ */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {tagLabel(interest)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 投稿一覧 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">投稿 ({posts.length})</h2>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">まだ投稿がありません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
