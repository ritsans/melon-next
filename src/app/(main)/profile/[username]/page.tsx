import { notFound } from "next/navigation";
import { User } from "lucide-react";
import { getProfileByUsername, getCurrentUser } from "@/lib/auth";
import { getPostsByUser, getReplies } from "@/lib/posts";
import { getFollowStatus, getFollowStats } from "@/lib/follows";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PostCard } from "@/components/posts/PostCard";
import { FollowButton } from "@/components/follows/FollowButton";
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

  // 各投稿のリプライを取得
  const postsWithReplies = await Promise.all(
    posts.map(async (post) => ({
      post,
      replies: await getReplies(post.id),
    })),
  );

  // 現在のユーザーを取得（削除機能とフォロー機能のため）
  const currentUser = await getCurrentUser();

  // フォロー状態とフォロー統計を取得
  const followStatus = await getFollowStatus(profile.id);
  const followStats = await getFollowStats(profile.id);

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
    <div className="mx-auto max-w-2xl space-y-6">
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
                  {profile.display_name && (
                    <p className="text-neutral-600 text-sm">@{profile.username}</p>
                  )}
                </div>

                {/* フォローボタン */}
                <FollowButton
                  targetUserId={profile.id}
                  initialIsFollowing={followStatus.is_following}
                  initialIsFollowedBy={followStatus.is_followed_by}
                  currentUserId={currentUser?.id}
                />
              </div>

              {/* 関係性バッジ */}
              {currentUser && currentUser.id !== profile.id && (
                <div className="flex flex-wrap gap-2 text-sm">
                  {followStatus.is_following && followStatus.is_followed_by && (
                    <Badge variant="default" className="bg-blue-500">
                      相互フォロー
                    </Badge>
                  )}
                  {!followStatus.is_following && followStatus.is_followed_by && (
                    <Badge variant="secondary">
                      フォローされています
                    </Badge>
                  )}
                </div>
              )}

              {/* つながりを見るリンク */}
              {(followStats.followers_count > 0 || followStats.following_count > 0) && (
                <div className="text-sm">
                  <a
                    href={`/profile/${profile.username}/connections`}
                    className="text-blue-600 hover:underline"
                  >
                    つながりを見る
                  </a>
                </div>
              )}

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
        <h2 className="text-lg font-semibold">投稿 ({postsWithReplies.length})</h2>

        {postsWithReplies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">まだ投稿がありません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {postsWithReplies.map(({ post, replies }) => (
              <PostCard key={post.id} post={post} currentUserId={currentUser?.id} hideReactions={true} replies={replies} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
