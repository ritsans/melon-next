/**
 * クライアントサイド用の画像ユーティリティ関数
 * ブラウザAPIを使用した画像バリデーションとリサイズ
 */

// 画像バリデーションの定数
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// アバター専用の定数
const VALID_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const AVATAR_SIZE = 400; // 400x400px

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
export async function resizeImage(file: File, maxWidth: number = 1200): Promise<File> {
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

// ========================================
// アバター画像関連の関数
// ========================================

/**
 * アバター画像のバリデーション
 * @param file - バリデーション対象のファイル
 * @returns バリデーション結果とエラーメッセージ
 */
export function validateAvatarImage(file: File): { valid: boolean; error?: string } {
  // ファイル形式チェック（GIF除外）
  if (!VALID_AVATAR_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "JPEG、PNG、WebP形式の画像のみアップロード可能です",
    };
  }

  // ファイルサイズチェック（2MB以下）
  if (file.size > MAX_AVATAR_SIZE) {
    return {
      valid: false,
      error: "画像サイズは2MB以下にしてください",
    };
  }

  return { valid: true };
}

/**
 * アバター画像のリサイズ（正方形400x400px）
 * @param file - リサイズ対象の画像ファイル
 * @returns リサイズ後のファイル
 */
export async function resizeAvatarImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        // 正方形にリサイズ
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas context could not be created"));
          return;
        }

        // 元画像のアスペクト比を維持しながら中央にクロップ
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        ctx.drawImage(img, x, y, size, size, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

        // Blobに変換（画質90%で圧縮）
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              reject(new Error("Failed to resize avatar image"));
            }
          },
          file.type,
          0.9, // 画質90%（アバターは高品質に）
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
