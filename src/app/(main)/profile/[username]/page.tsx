import { notFound } from "next/navigation";
import { User } from "lucide-react";
import Link from "next/link";
import { getProfileByUsername, getCurrentUser } from "@/lib/auth";
import { getPostsByUser, getReplies } from "@/lib/posts";
import { getFollowStatus, getFollowStats } from "@/lib/follows";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PostCard } from "@/components/posts/PostCard";
import { FollowButton } from "@/components/follows/FollowButton";
import { tagLabel } from "@/lib/tags";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams: Promise<{
    updated?: string;
  }>;
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { username } = await params;
  const { updated } = await searchParams;

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
      {/* 成功メッセージ */}
      {updated === "true" && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          プロフィールを更新しました
        </div>
      )}

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
                  {profile.display_name && <p className="text-neutral-600 text-sm">@{profile.username}</p>}
                </div>

                {/* 編集ボタンまたはフォローボタン */}
                {currentUser && currentUser.id === profile.id ? (
                  <Link href="/profile/edit">
                    <Button variant="outline" size="sm">
                      プロフィールを編集
                    </Button>
                  </Link>
                ) : (
                  <FollowButton
                    targetUserId={profile.id}
                    initialIsFollowing={followStatus.is_following}
                    initialIsFollowedBy={followStatus.is_followed_by}
                    currentUserId={currentUser?.id}
                  />
                )}
              </div>

              {/* フォロー・フォロワー統計 */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-neutral-700">
                  <span className="font-semibold text-neutral-900">{followStats.following_count}</span> フォロー
                </span>
                <span className="text-neutral-700">
                  <span className="font-semibold text-neutral-900">{followStats.followers_count}</span> フォロワー
                </span>
                {(followStats.followers_count > 0 || followStats.following_count > 0) && (
                  <Link href={`/profile/${profile.username}/connections`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      つながり
                    </Button>
                  </Link>
                )}
              </div>

              {/* 関係性バッジ */}
              {currentUser && currentUser.id !== profile.id && (
                <div className="flex flex-wrap gap-2">
                  {!followStatus.is_following && followStatus.is_followed_by && (
                    <Badge variant="secondary" className="text-xs">
                      フォローされています
                    </Badge>
                  )}
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
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.id}
                hideReactions={true}
                replies={replies}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
