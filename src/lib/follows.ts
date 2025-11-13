"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatError } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import { createFollowNotification } from "@/lib/notifications";

/**
 * フォロー関係の基本型
 */
export type Follow = {
  id: string;
  follower_id: string; // フォローする人
  following_id: string; // フォローされる人
  created_at: string;
};

/**
 * プロフィール情報を含むフォロー関係型
 */
export type FollowWithProfile = Follow & {
  profile: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  };
};

/**
 * フォロー統計情報
 */
export type FollowStats = {
  followers_count: number; // フォロワー数
  following_count: number; // フォロー中の数
};

/**
 * フォロー状態
 */
export type FollowStatus = {
  is_following: boolean; // 自分が相手をフォローしているか
  is_followed_by: boolean; // 相手が自分をフォローしているか（相互フォローの判定に使用）
};

/**
 * ユーザーをフォローする
 * @param targetUserId - フォロー対象のユーザーID
 * @returns Success status and error message if any
 */
export async function followUser(targetUserId: string) {
  try {
    // 現在のユーザーを取得
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    // 自分自身をフォローしようとしていないかチェック
    if (user.id === targetUserId) {
      return { success: false, error: "自分自身をフォローすることはできません" };
    }

    // Supabaseクライアントを作成
    const supabase = await createClient();

    // フォロー対象のユーザーが存在するか確認
    const { data: targetUser, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", targetUserId)
      .single();

    if (userError || !targetUser) {
      return { success: false, error: "ユーザーが見つかりません" };
    }

    // 既にフォローしているか確認
    const { data: existingFollow, error: checkError } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing follow:", checkError);
      return { success: false, error: "フォロー状態の確認に失敗しました" };
    }

    if (existingFollow) {
      return { success: false, error: "既にフォローしています" };
    }

    // フォロー関係を作成
    const { error: insertError } = await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: targetUserId,
    });

    if (insertError) {
      console.error("Error creating follow:", insertError);
      return { success: false, error: formatError(insertError) };
    }

    // フォロー通知を作成（失敗しても致命的ではないためログのみ出力）
    const notificationResult = await createFollowNotification(targetUserId, user.id);
    if (!notificationResult.success) {
      console.error("Failed to create follow notification:", notificationResult.error);
    }

    // キャッシュを再検証
    revalidatePath("/profile/[username]", "page");
    revalidatePath("/home");

    return { success: true };
  } catch (error) {
    console.error("Error in followUser:", error);
    return { success: false, error: formatError(error) };
  }
}

/**
 * ユーザーのフォローを解除する
 * @param targetUserId - フォロー解除対象のユーザーID
 * @returns Success status and error message if any
 */
export async function unfollowUser(targetUserId: string) {
  try {
    // 現在のユーザーを取得
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    // Supabaseクライアントを作成
    const supabase = await createClient();

    // フォロー関係を削除
    const { error: deleteError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId);

    if (deleteError) {
      console.error("Error deleting follow:", deleteError);
      return { success: false, error: formatError(deleteError) };
    }

    // キャッシュを再検証
    revalidatePath("/profile/[username]", "page");
    revalidatePath("/home");

    return { success: true };
  } catch (error) {
    console.error("Error in unfollowUser:", error);
    return { success: false, error: formatError(error) };
  }
}

/**
 * 2人のユーザー間のフォロー状態を取得
 * @param targetUserId - 確認対象のユーザーID
 * @returns フォロー状態（is_following: 自分が相手をフォローしているか、is_followed_by: 相手が自分をフォローしているか）
 */
export async function getFollowStatus(targetUserId: string): Promise<FollowStatus> {
  try {
    // 現在のユーザーを取得
    const user = await getCurrentUser();
    if (!user) {
      return { is_following: false, is_followed_by: false };
    }

    // 自分自身の場合は両方false
    if (user.id === targetUserId) {
      return { is_following: false, is_followed_by: false };
    }

    // Supabaseクライアントを作成
    const supabase = await createClient();

    // 自分が相手をフォローしているか確認
    const { data: following, error: followingError } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .maybeSingle();

    if (followingError) {
      console.error("Error checking following status:", followingError);
    }

    // 相手が自分をフォローしているか確認
    const { data: followedBy, error: followedByError } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", targetUserId)
      .eq("following_id", user.id)
      .maybeSingle();

    if (followedByError) {
      console.error("Error checking followed by status:", followedByError);
    }

    return {
      is_following: !!following,
      is_followed_by: !!followedBy,
    };
  } catch (error) {
    console.error("Error in getFollowStatus:", error);
    return { is_following: false, is_followed_by: false };
  }
}

/**
 * ユーザーのフォロー統計を取得
 * @param userId - 統計を取得するユーザーID
 * @returns フォロワー数とフォロー中の数
 */
export async function getFollowStats(userId: string): Promise<FollowStats> {
  try {
    // Supabaseクライアントを作成
    const supabase = await createClient();

    // フォロワー数を取得（このユーザーをフォローしている人の数）
    const { count: followersCount, error: followersError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    if (followersError) {
      console.error("Error fetching followers count:", followersError);
    }

    // フォロー中の数を取得（このユーザーがフォローしている人の数）
    const { count: followingCount, error: followingError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (followingError) {
      console.error("Error fetching following count:", followingError);
    }

    return {
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
    };
  } catch (error) {
    console.error("Error in getFollowStats:", error);
    return {
      followers_count: 0,
      following_count: 0,
    };
  }
}

/**
 * ユーザーのフォロワー一覧を取得
 * @param userId - フォロワーを取得するユーザーID
 * @returns プロフィール情報を含むフォロワー一覧
 */
export async function getFollowers(userId: string): Promise<FollowWithProfile[]> {
  try {
    // Supabaseクライアントを作成
    const supabase = await createClient();

    // フォロワー一覧を取得（このユーザーをフォローしている人）
    const { data, error } = await supabase
      .from("follows")
      .select(
        `
        id,
        follower_id,
        following_id,
        created_at,
        profile:profiles!follows_follower_id_fkey(username, display_name, avatar_url, bio)
      `,
      )
      .eq("following_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching followers:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // 型を整形して返す
    return data.map((follow) => ({
      id: follow.id,
      follower_id: follow.follower_id,
      following_id: follow.following_id,
      created_at: follow.created_at,
      profile: Array.isArray(follow.profile) ? follow.profile[0] : follow.profile,
    })) as FollowWithProfile[];
  } catch (error) {
    console.error("Error in getFollowers:", error);
    return [];
  }
}

/**
 * ユーザーがフォロー中のユーザー一覧を取得
 * @param userId - フォロー中を取得するユーザーID
 * @returns プロフィール情報を含むフォロー中一覧
 */
export async function getFollowing(userId: string): Promise<FollowWithProfile[]> {
  try {
    // Supabaseクライアントを作成
    const supabase = await createClient();

    // フォロー中一覧を取得（このユーザーがフォローしている人）
    const { data, error } = await supabase
      .from("follows")
      .select(
        `
        id,
        follower_id,
        following_id,
        created_at,
        profile:profiles!follows_following_id_fkey(username, display_name, avatar_url, bio)
      `,
      )
      .eq("follower_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching following:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // 型を整形して返す
    return data.map((follow) => ({
      id: follow.id,
      follower_id: follow.follower_id,
      following_id: follow.following_id,
      created_at: follow.created_at,
      profile: Array.isArray(follow.profile) ? follow.profile[0] : follow.profile,
    })) as FollowWithProfile[];
  } catch (error) {
    console.error("Error in getFollowing:", error);
    return [];
  }
}
