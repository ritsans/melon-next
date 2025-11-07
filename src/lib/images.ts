"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * 画像関連のユーティリティ関数
 * Supabase Storageへの画像アップロード、削除、バリデーションを提供
 */

// バケット名の定数
const BUCKET_NAME = "gazo-images";

// 画像バリデーションの定数
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 画像ファイルのバリデーション
 * @param file - バリデーション対象のファイル
 * @returns バリデーション結果とエラーメッセージ
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "JPEG、PNG、GIF、WebP形式の画像のみアップロード可能です",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "画像サイズは5MB以下である必要があります",
    };
  }

  return { valid: true };
}

/**
 * 画像のリサイズと圧縮
 * @param file - リサイズ対象の画像ファイル
 * @param maxWidth - 最大幅（デフォルト: 1200px）
 * @returns リサイズ後のファイル
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 1200,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // 幅が最大幅を超える場合はリサイズ
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas context could not be created"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Blobに変換（画質85%で圧縮）
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              reject(new Error("Failed to resize image"));
            }
          },
          file.type,
          0.85, // 画質85%
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * 単一画像をSupabase Storageにアップロード
 * @param file - アップロードする画像ファイル
 * @param postId - 投稿ID（フォルダ名として使用）
 * @returns 公開URL
 */
export async function uploadImage(
  file: File,
  postId: string,
): Promise<string> {
  const supabase = await createClient();

  // ファイル名の生成: {postId}/{timestamp}-{uuid}.{ext}
  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const fileName = `${postId}/${timestamp}-${uuid}.${fileExt}`;

  // Supabase Storageにアップロード
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
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
export async function uploadImages(
  files: File[],
  postId: string,
): Promise<string[]> {
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
export async function deletePostWithImages(
  postId: string,
  imageUrls?: string[],
): Promise<void> {
  const supabase = await createClient();

  // 画像削除
  if (imageUrls && imageUrls.length > 0) {
    const imagePaths = imageUrls.map((url) => getImagePathFromUrl(url));
    const validPaths = imagePaths.filter((path) => path !== "");

    if (validPaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(validPaths);

      if (storageError) {
        console.error("Image deletion error:", storageError);
        // 画像削除エラーは警告のみ（投稿削除は続行）
      }
    }
  }

  // 投稿削除
  const { error: postError } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (postError) {
    console.error("Post deletion error:", postError);
    throw new Error(`投稿の削除に失敗しました: ${postError.message}`);
  }
}

/**
 * 画像URLからファイルパスを抽出
 * @param url - 画像の公開URL
 * @returns バケット内の相対パス
 */
export function getImagePathFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // URLパスから "storage/v1/object/public/gazo-images/" を削除
    const path = urlObj.pathname.replace(
      `/storage/v1/object/public/${BUCKET_NAME}/`,
      "",
    );
    return path;
  } catch (error) {
    console.error("Invalid URL:", url, error);
    return "";
  }
}

/**
 * 投稿IDから画像フォルダパスを生成
 * @param postId - 投稿ID
 * @returns フォルダパス（例: "post-id-123/"）
 */
export function getImageFolderPath(postId: string): string {
  return `${postId}/`;
}
