import type { Reaction, ReactionCount } from "@/lib/reactions";

/**
 * プリセット絵文字リスト
 * 将来的に追加可能
 */
export const PRESET_EMOJIS = ["👏", "💖", "🤣"];

/**
 * リアクションデータを集計する
 * @param reactions - リアクションの配列
 * @param currentUserId - 現在のユーザーID（省略可）
 * @returns 絵文字ごとのカウントとユーザーのリアクション状態
 */
export function aggregateReactions(reactions: Reaction[], currentUserId?: string): ReactionCount[] {
  const reactionMap = new Map<string, { count: number; userReacted: boolean }>();

  for (const reaction of reactions) {
    const existing = reactionMap.get(reaction.emoji) || { count: 0, userReacted: false };
    reactionMap.set(reaction.emoji, {
      count: existing.count + 1,
      userReacted: existing.userReacted || reaction.user_id === currentUserId,
    });
  }

  return Array.from(reactionMap.entries())
    .map(([emoji, data]) => ({
      emoji,
      count: data.count,
      userReacted: data.userReacted,
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}
