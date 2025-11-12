"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

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
