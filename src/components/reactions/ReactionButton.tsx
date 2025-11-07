"use client";

import { useState, useTransition } from "react";
import { toggleReaction } from "@/lib/reactions";
import { cn } from "@/lib/utils";

type ReactionButtonProps = {
  postId: string;
  emoji: string;
  count: number;
  userReacted: boolean;
  userCurrentReaction?: string; // ユーザーが現在選択しているリアクション（1投稿1リアクション）
};

export function ReactionButton({ postId, emoji, count, userReacted }: ReactionButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticUserReacted, setOptimisticUserReacted] = useState(userReacted);
  const [optimisticCount, setOptimisticCount] = useState(count);

  const handleClick = () => {
    // 1投稿1リアクションのため、異なるリアクションを選択した場合の最適化UI更新
    const wasReacted = optimisticUserReacted;

    // Optimistic UI update
    if (wasReacted) {
      // 同じリアクションをクリック → 削除
      setOptimisticUserReacted(false);
      setOptimisticCount(optimisticCount - 1);
    } else {
      // 新しいリアクションを選択
      setOptimisticUserReacted(true);
      setOptimisticCount(optimisticCount + 1);
    }

    startTransition(async () => {
      const result = await toggleReaction(postId, emoji);
      if (!result.success) {
        // Revert optimistic update on error
        setOptimisticUserReacted(userReacted);
        setOptimisticCount(count);
        console.error("Failed to toggle reaction:", result.error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition-colors",
        "hover:bg-neutral-100 active:bg-neutral-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        optimisticUserReacted
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-neutral-300 bg-white text-neutral-700",
      )}
    >
      <span className="text-base leading-none">{emoji}</span>
      {optimisticCount > 0 && <span className="font-medium leading-none">{optimisticCount}</span>}
    </button>
  );
}
