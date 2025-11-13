import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProfileByUsername, getCurrentUser } from "@/lib/auth";
import { getFollowers, getFollowing, getFollowStatus } from "@/lib/follows";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FollowList } from "@/components/follows/FollowList";

interface ConnectionsPageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function ConnectionsPage({ params, searchParams }: ConnectionsPageProps) {
  const { username } = await params;
  const { tab = "followers" } = await searchParams;

  // プロフィール情報を取得
  const profile = await getProfileByUsername(username);

  // プロフィールが存在しない場合は404
  if (!profile) {
    notFound();
  }

  // 現在のユーザーを取得
  const currentUser = await getCurrentUser();

  // フォロワーとフォロー中を取得
  const followers = await getFollowers(profile.id);
  const following = await getFollowing(profile.id);

  // 現在のユーザーが各ユーザーとどういう関係にあるかを取得
  const followerStatuses = currentUser
    ? new Map(
        await Promise.all(
          followers.map(async (follow) => {
            const status = await getFollowStatus(follow.follower_id);
            return [follow.follower_id, status] as const;
          }),
        ),
      )
    : undefined;

  const followingStatuses = currentUser
    ? new Map(
        await Promise.all(
          following.map(async (follow) => {
            const status = await getFollowStatus(follow.following_id);
            return [follow.following_id, status] as const;
          }),
        ),
      )
    : undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link
          href={`/profile/${profile.username}`}
          className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>プロフィールに戻る</span>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-1">{profile.display_name || profile.username}のつながり</h1>
          {profile.display_name && <p className="text-neutral-600 text-sm">@{profile.username}</p>}
        </CardContent>
      </Card>

      {/* タブ */}
      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="followers">フォロワー ({followers.length})</TabsTrigger>
          <TabsTrigger value="following">フォロー中 ({following.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="followers" className="mt-6">
          <FollowList
            follows={followers}
            currentUserId={currentUser?.id}
            viewerFollowStatuses={followerStatuses}
            type="followers"
          />
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <FollowList
            follows={following}
            currentUserId={currentUser?.id}
            viewerFollowStatuses={followingStatuses}
            type="following"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
