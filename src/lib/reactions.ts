"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export type Reaction = {
  id: string;
  post_id: string;
  user_id: string;
  emoji: string;
  created_at: string | null;
};

export type ReactionCount = {
  emoji: string;
  count: number;
  userReacted: boolean;
};

/**
 * リアクションをトグル（追加/削除/変更）する
 * 1投稿につき1リアクションのみ許可（排他的選択）
 * @param postId - 投稿ID
 * @param emoji - 絵文字
 * @returns Success status and error message if any
 */
export async function toggleReaction(postId: string, emoji: string) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    // Create Supabase client
    const supabase = await createClient();

    // Check if any reaction already exists for this post by this user
    const { data: existingReaction, error: fetchError } = await supabase
      .from("reactions")
      .select("id, emoji")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking existing reaction:", fetchError);
      return { success: false, error: "リアクションの確認に失敗しました" };
    }
    if (existingReaction) {
      // 同じリアクションの場合は削除（トグル）
      if (existingReaction.emoji === emoji) {
        const { error: deleteError } = await supabase.from("reactions").delete().eq("id", existingReaction.id);

        if (deleteError) {
          console.error("Error deleting reaction:", deleteError);
          return { success: false, error: "リアクションの削除に失敗しました" };
        }
      } else {
        // 異なるリアクションの場合は更新（既存のリアクションを新しいリアクションに変更）
        const { data: updateData, error: updateError } = await supabase
          .from("reactions")
          .update({ emoji, created_at: new Date().toISOString() })
          .eq("id", existingReaction.id)
          .select();

        if (updateError) {
          console.error("Error updating reaction:", updateError);
          return { success: false, error: "リアクションの変更に失敗しました" };
        }

        // 投稿者のIDを取得して通知を作成
        const { data: post, error: postError } = await supabase
          .from("posts")
          .select("user_id")
          .eq("id", postId)
          .single();

        if (postError) {
          console.error("Error fetching post:", postError);
        } else if (post) {
          // 通知を作成（自分の投稿へのリアクションは除外される）
          await createNotification(post.user_id, user.id, postId, emoji);
        }
      }
    } else {
      // Add new reaction
      const { error: insertError } = await supabase.from("reactions").insert({
        post_id: postId,
        user_id: user.id,
        emoji,
      });

      if (insertError) {
        console.error("Error adding reaction:", insertError);
        return { success: false, error: "リアクションの追加に失敗しました" };
      }

      // 投稿者のIDを取得して通知を作成
      const { data: post, error: postError } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single();

      if (postError) {
        console.error("Error fetching post:", postError);
        // 通知作成の失敗はリアクション処理自体には影響させない
      } else if (post) {
        // 通知を作成（自分の投稿へのリアクションは除外される）
        await createNotification(post.user_id, user.id, postId, emoji);
      }
    }

    // Revalidate pages that show this post
    revalidatePath("/home");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error in toggleReaction:", error);
    return { success: false, error: "リアクションの処理に失敗しました" };
  }
}
