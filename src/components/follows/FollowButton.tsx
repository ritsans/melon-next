"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { followUser, unfollowUser } from "@/lib/follows";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";

type FollowButtonProps = {
  targetUserId: string;
  initialIsFollowing: boolean;
  initialIsFollowedBy: boolean;
  currentUserId?: string;
};

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  initialIsFollowedBy,
  currentUserId,
}: FollowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticIsFollowing, setOptimisticIsFollowing] = useState(initialIsFollowing);
  const [optimisticIsFollowedBy] = useState(initialIsFollowedBy);

  // 自分自身の場合はボタンを表示しない
  if (currentUserId && currentUserId === targetUserId) {
    return null;
  }

  // 相互フォローかどうか
  const isMutual = optimisticIsFollowing && optimisticIsFollowedBy;

  const handleClick = () => {
    const wasFollowing = optimisticIsFollowing;

    // Optimistic UI update
    setOptimisticIsFollowing(!wasFollowing);

    startTransition(async () => {
      const result = wasFollowing ? await unfollowUser(targetUserId) : await followUser(targetUserId);

      if (!result.success) {
        // Revert optimistic update on error
        setOptimisticIsFollowing(wasFollowing);
        toast.error(result.error || "フォロー状態の更新に失敗しました");
      }
    });
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      variant={optimisticIsFollowing ? "outline" : "default"}
      size="sm"
      className="min-w-[100px]"
    >
      {optimisticIsFollowing ? (
        <>
          <UserMinus className="mr-1.5 h-4 w-4" />
          {isMutual ? "相互フォロー中" : "フォロー中"}
        </>
      ) : (
        <>
          <UserPlus className="mr-1.5 h-4 w-4" />
          フォロー
        </>
      )}
    </Button>
  );
}
