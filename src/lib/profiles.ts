"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadAvatar as uploadAvatarToStorage, deleteAvatar as deleteAvatarFromStorage } from "@/lib/images";

/**
 * プロフィール編集用のServer Actions
 * 認証済みユーザーが自分のプロフィール情報を更新するための関数群
 */

/**
 * プロフィール情報の更新（表示名、自己紹介、興味タグ）
 * @param data - 更新するプロフィールデータ
 * @returns 成功時はsuccess: true、エラー時はerrorメッセージ
 */
export async function updateUserProfile(data: {
  display_name: string;
  bio?: string;
  interests?: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: data.display_name,
        bio: data.bio || null,
        interests: data.interests || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Profile update error:", error);
      return { success: false, error: "プロフィールの更新に失敗しました" };
    }

    // プロフィール情報を取得してキャッシュを再検証
    const profile = await getProfile(user.id);
    if (profile?.username) {
      revalidatePath(`/profile/${profile.username}`);
    }
    revalidatePath("/profile/edit");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

/**
 * アバター画像の更新
 * @param file - アップロードする画像ファイル
 * @returns 成功時はsuccess: trueとavatarUrl、エラー時はerrorメッセージ
 */
export async function updateAvatar(file: File): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    // 現在のプロフィールを取得
    const profile = await getProfile(user.id);
    if (!profile) {
      return { success: false, error: "プロフィールが見つかりません" };
    }

    // 既存のアバターを削除
    if (profile.avatar_url) {
      await deleteAvatarFromStorage(profile.avatar_url);
    }

    // 新しいアバターをアップロード
    const avatarUrl = await uploadAvatarToStorage(file, user.id);

    // データベースを更新
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Avatar update error:", error);
      return { success: false, error: "アバターの更新に失敗しました" };
    }

    // キャッシュを再検証
    if (profile.username) {
      revalidatePath(`/profile/${profile.username}`);
    }
    revalidatePath("/profile/edit");

    return { success: true, avatarUrl };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

/**
 * アバター画像の削除
 * @returns 成功時はsuccess: true、エラー時はerrorメッセージ
 */
export async function removeAvatar(): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    // 現在のプロフィールを取得
    const profile = await getProfile(user.id);
    if (!profile) {
      return { success: false, error: "プロフィールが見つかりません" };
    }

    // Storageから削除
    if (profile.avatar_url) {
      await deleteAvatarFromStorage(profile.avatar_url);
    }

    // データベースを更新
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Avatar removal error:", error);
      return { success: false, error: "アバターの削除に失敗しました" };
    }

    // キャッシュを再検証
    if (profile.username) {
      revalidatePath(`/profile/${profile.username}`);
    }
    revalidatePath("/profile/edit");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}
