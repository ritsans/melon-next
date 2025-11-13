"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * 画像関連のサーバーサイドユーティリティ関数
 * Supabase Storageへの画像アップロード、削除を提供
 */

// バケット名の定数
const BUCKET_NAME = "gazo_images";
const AVATARS_BUCKET = "avatars";

/**
 * 単一画像をSupabase Storageにアップロード
 * @param file - アップロードする画像ファイル
 * @param postId - 投稿ID（フォルダ名として使用）
 * @returns 公開URL
 */
export async function uploadImage(file: File, postId: string): Promise<string> {
  const supabase = await createClient();

  // ファイル名の生成: {postId}/{timestamp}-{uuid}.{ext}
  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const fileName = `${postId}/${timestamp}-${uuid}.${fileExt}`;

  // Supabase Storageにアップロード
  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("Image upload error:", error);
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`);
  }

  // 公開URLを取得
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return publicUrl;
}

/**
 * 複数画像を一括アップロード
 * @param files - アップロードする画像ファイルの配列
 * @param postId - 投稿ID（フォルダ名として使用）
 * @returns 公開URLの配列
 */
export async function uploadImages(files: File[], postId: string): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file, postId));
  return Promise.all(uploadPromises);
}

/**
 * 単一画像を削除
 * @param imagePath - 削除する画像のパス（バケット内の相対パス）
 */
export async function deleteImage(imagePath: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([imagePath]);

  if (error) {
    console.error("Image deletion error:", error);
    throw new Error(`画像の削除に失敗しました: ${error.message}`);
  }
}

/**
 * 投稿削除時に関連画像も削除
 * @param postId - 削除する投稿のID
 * @param imageUrls - 削除する画像URLの配列（オプション）
 */
export async function deletePostWithImages(postId: string, imageUrls?: string[]): Promise<void> {
  const supabase = await createClient();

  // 画像削除
  if (imageUrls && imageUrls.length > 0) {
    const imagePaths = imageUrls.map((url) => getImagePathFromUrl(url));
    const validPaths = imagePaths.filter((path) => path !== "");

    if (validPaths.length > 0) {
      const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove(validPaths);

      if (storageError) {
        console.error("Image deletion error:", storageError);
        // 画像削除エラーは警告のみ（投稿削除は続行）
      }
    }
  }

  // 投稿削除
  const { error: postError } = await supabase.from("posts").delete().eq("id", postId);

  if (postError) {
    console.error("Post deletion error:", postError);
    throw new Error(`投稿の削除に失敗しました: ${postError.message}`);
  }
}

/**
 * 画像URLからファイルパスを抽出（内部ヘルパー関数）
 * @param url - 画像の公開URL
 * @returns バケット内の相対パス
 */
function getImagePathFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // URLパスから "storage/v1/object/public/gazo_images/" を削除
    const path = urlObj.pathname.replace(`/storage/v1/object/public/${BUCKET_NAME}/`, "");
    return path;
  } catch (error) {
    console.error("Invalid URL:", url, error);
    return "";
  }
}

// ========================================
// アバター画像関連の関数
// ========================================

/**
 * アバター画像をSupabase Storageにアップロード
 * @param file - アップロードする画像ファイル
 * @param userId - ユーザーID
 * @returns 公開URL
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = await createClient();

  // ファイル名の生成: {userId}/avatar-{timestamp}.{ext}
  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const fileName = `${userId}/avatar-${timestamp}.${fileExt}`;

  // Supabase Storageにアップロード
  const { data, error } = await supabase.storage.from(AVATARS_BUCKET).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("Avatar upload error:", error);
    throw new Error(`アバターのアップロードに失敗しました: ${error.message}`);
  }

  // 公開URLを取得
  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(data.path);

  return publicUrl;
}

/**
 * アバター画像をSupabase Storageから削除
 * @param avatarUrl - 削除するアバターの公開URL
 */
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  const supabase = await createClient();

  // URLからパスを抽出
  const path = getAvatarPathFromUrl(avatarUrl);
  if (!path) {
    console.warn("Invalid avatar URL:", avatarUrl);
    return;
  }

  const { error } = await supabase.storage.from(AVATARS_BUCKET).remove([path]);

  if (error) {
    console.error("Avatar deletion error:", error);
    // 削除エラーは致命的ではないためログのみ出力
  }
}

/**
 * アバターURLからファイルパスを抽出（内部ヘルパー関数）
 * @param url - アバターの公開URL
 * @returns バケット内の相対パス
 */
function getAvatarPathFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // URLパスから "storage/v1/object/public/avatars/" を削除
    const path = urlObj.pathname.replace(`/storage/v1/object/public/${AVATARS_BUCKET}/`, "");
    return path;
  } catch (error) {
    console.error("Invalid avatar URL:", url, error);
    return "";
  }
}
