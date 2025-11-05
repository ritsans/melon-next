"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 通知を作成する
 * @param userId - 通知を受け取るユーザーID（投稿者）
 * @param actorId - リアクションしたユーザーID
 * @param postId - 投稿ID
 * @param reactionEmoji - リアクションの絵文字
 */
export async function createNotification(
  userId: string,
  actorId: string,
  postId: string,
  reactionEmoji: string,
) {
  const supabase = await createClient();

  // 自分の投稿へのリアクションには通知を作成しない
  if (userId === actorId) {
    return { success: true };
  }

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    actor_id: actorId,
    post_id: postId,
    reaction_emoji: reactionEmoji,
    is_read: false,
  });

  if (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 通知一覧を取得する（actorとpostの情報を含む）
 * @param userId - 通知を取得するユーザーID
 */
export async function getNotifications(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      id,
      reaction_emoji,
      is_read,
      created_at,
      actor:profiles!notifications_actor_id_fkey (
        id,
        username,
        display_name,
        avatar_url
      ),
      post:posts!notifications_post_id_fkey (
        id,
        content
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return data || [];
}

/**
 * 未読通知数を取得する
 * @param userId - ユーザーID
 */
export async function getUnreadCount(userId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * 通知を既読にする
 * @param notificationId - 通知ID
 */
export async function markAsRead(notificationId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/notifications");
  revalidatePath("/home");

  return { success: true };
}

/**
 * すべての通知を既読にする
 * @param userId - ユーザーID
 */
export async function markAllAsRead(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/notifications");
  revalidatePath("/home");

  return { success: true };
}
