"use client";

import { useState, useTransition } from "react";
import { toggleReaction } from "@/lib/reactions";
import type { Reaction } from "@/lib/reactions";
import { aggregateReactions, PRESET_EMOJIS } from "@/lib/reaction-utils";
import { cn } from "@/lib/utils";

type ReactionPanelProps = {
  postId: string;
  reactions: Reaction[];
  currentUserId?: string;
  isOwnPost?: boolean;
};

export function ReactionPanel({ postId, reactions, currentUserId, isOwnPost = false }: ReactionPanelProps) {
  // Aggregate reactions by emoji
  const reactionCounts = aggregateReactions(reactions, currentUserId);

  // Create a map for quick lookup
  const reactionMap = new Map(reactionCounts.map((r) => [r.emoji, r]));

  // ユーザーの現在のリアクションを取得（1投稿につき1リアクションのみ）
  const userCurrentReaction = currentUserId ? reactions.find((r) => r.user_id === currentUserId)?.emoji : undefined;

  // オプティミスティックUI用の状態
  const [optimisticReaction, setOptimisticReaction] = useState<string | undefined>(userCurrentReaction);
  const [isPending, startTransition] = useTransition();

  // Get all emojis to display (existing reactions + unreacted preset emojis)
  const displayEmojis = PRESET_EMOJIS.map((emoji) => {
    const existing = reactionMap.get(emoji);
    const baseCount = existing?.count || 0;
    const wasUserReacted = existing?.userReacted || false;

    // オプティミスティックUI: ユーザーのリアクション状態を計算
    let optimisticCount = baseCount;
    let optimisticUserReacted = wasUserReacted;

    if (optimisticReaction === emoji) {
      // このemojiがオプティミスティックに選択されている
      if (!wasUserReacted) {
        optimisticCount += 1;
      }
      optimisticUserReacted = true;
    } else if (wasUserReacted && optimisticReaction !== emoji) {
      // 元々このemojiが選択されていたが、別のemojiに変更された
      optimisticCount -= 1;
      optimisticUserReacted = false;
    }

    return {
      emoji,
      count: optimisticCount,
      userReacted: optimisticUserReacted,
    };
  });

  const handleReactionClick = (emoji: string) => {
    if (!currentUserId || isOwnPost) return;

    // オプティミスティックUI更新
    if (optimisticReaction === emoji) {
      // 同じリアクションをクリック → 削除
      setOptimisticReaction(undefined);
    } else {
      // 新しいリアクションを選択（または変更）
      setOptimisticReaction(emoji);
    }

    startTransition(async () => {
      const result = await toggleReaction(postId, emoji);
      if (!result.success) {
        // エラー時は元に戻す
        setOptimisticReaction(userCurrentReaction);
        console.error("Failed to toggle reaction:", result.error);
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {displayEmojis.map(({ emoji, count, userReacted }) => {
        // 表示条件:
        // - count > 0: 誰かがリアクション済み（自分の投稿でも他人の投稿でも表示）
        // - count === 0 && currentUserId && !isOwnPost: ログイン中で他人の投稿（リアクション追加可能）
        if (count === 0 && (!currentUserId || isOwnPost)) {
          return null;
        }

        return (
          <button
            key={emoji}
            type="button"
            onClick={() => handleReactionClick(emoji)}
            disabled={isPending || isOwnPost}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition-colors",
              !isOwnPost && "hover:bg-neutral-100 active:bg-neutral-200",
              isOwnPost ? "cursor-not-allowed" : "disabled:opacity-50 disabled:cursor-not-allowed",
              userReacted ? "border-blue-500 bg-blue-50 text-blue-700" : "border-neutral-300 bg-white text-neutral-700",
            )}
          >
            <span className="text-base leading-none">{emoji}</span>
            {count > 0 && <span className="font-medium leading-none">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
