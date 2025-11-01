"use client";

import { ReactionButton } from "./ReactionButton";
import type { Reaction } from "@/lib/reactions";
import { aggregateReactions, PRESET_EMOJIS } from "@/lib/reaction-utils";

type ReactionPanelProps = {
  postId: string;
  reactions: Reaction[];
  currentUserId?: string;
};

export function ReactionPanel({ postId, reactions, currentUserId }: ReactionPanelProps) {
  // Aggregate reactions by emoji
  const reactionCounts = aggregateReactions(reactions, currentUserId);

  // Create a map for quick lookup
  const reactionMap = new Map(reactionCounts.map((r) => [r.emoji, r]));

  // Get all emojis to display (existing reactions + unreacted preset emojis)
  const displayEmojis = PRESET_EMOJIS.map((emoji) => {
    const existing = reactionMap.get(emoji);
    return {
      emoji,
      count: existing?.count || 0,
      userReacted: existing?.userReacted || false,
    };
  });

  return (
    <div className="flex flex-wrap gap-2">
      {displayEmojis.map(({ emoji, count, userReacted }) => {
        // Only show buttons with count > 0 or if user can add reaction
        if (count === 0 && !currentUserId) {
          return null;
        }

        return <ReactionButton key={emoji} postId={postId} emoji={emoji} count={count} userReacted={userReacted} />;
      })}
    </div>
  );
}
