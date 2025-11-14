"use client";

import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FollowButton } from "@/components/follows/FollowButton";
import type { FollowWithProfile } from "@/lib/follows";
import Link from "next/link";

type FollowListProps = {
  follows: FollowWithProfile[];
  currentUserId?: string;
  viewerFollowStatuses?: Map<string, { is_following: boolean; is_followed_by: boolean }>;
  type: "followers" | "following";
};

export function FollowList({ follows, currentUserId, viewerFollowStatuses, type }: FollowListProps) {
  // アバター用のイニシャル取得
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // 各ユーザーのIDを取得（followerかfollowingかで異なる）
  const getUserId = (follow: FollowWithProfile) => {
    return type === "followers" ? follow.follower_id : follow.following_id;
  };

  if (follows.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-neutral-500">
            {type === "followers" ? "まだフォロワーがいません" : "まだフォロー中のユーザーがいません"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {follows.map((follow) => {
        const userId = getUserId(follow);
        const followStatus = viewerFollowStatuses?.get(userId) || {
          is_following: false,
          is_followed_by: false,
        };
        const isMutual = followStatus.is_following && followStatus.is_followed_by;

        return (
          <Card key={follow.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* アバター */}
                <Link href={`/profile/${follow.profile.username}`}>
                  <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={follow.profile.avatar_url || undefined} alt={follow.profile.username} />
                    <AvatarFallback className="bg-neutral-200 text-neutral-700">
                      {follow.profile.display_name || follow.profile.username ? (
                        getInitials(follow.profile.display_name || follow.profile.username)
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                {/* ユーザー情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/profile/${follow.profile.username}`} className="hover:underline">
                        <h3 className="font-semibold truncate">
                          {follow.profile.display_name || follow.profile.username}
                        </h3>
                      </Link>
                      {follow.profile.display_name && (
                        <p className="text-neutral-600 text-sm truncate">@{follow.profile.username}</p>
                      )}

                      {/* 関係性バッジ */}
                      {currentUserId && currentUserId !== userId && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {isMutual && (
                            <Badge variant="default" className="bg-blue-500 text-xs">
                              相互フォロー
                            </Badge>
                          )}
                          {!followStatus.is_following && followStatus.is_followed_by && (
                            <Badge variant="secondary" className="text-xs">
                              フォローされています
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* フォローボタン */}
                    <FollowButton
                      targetUserId={userId}
                      initialIsFollowing={followStatus.is_following}
                      initialIsFollowedBy={followStatus.is_followed_by}
                      currentUserId={currentUserId}
                    />
                  </div>

                  {/* バイオ */}
                  {follow.profile.bio && (
                    <p className="text-neutral-700 text-sm mt-2 line-clamp-2">{follow.profile.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
