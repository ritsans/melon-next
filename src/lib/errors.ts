import { PostgrestError } from "@supabase/supabase-js";

/**
 * Supabaseエラーを人間が読めるメッセージに変換
 * @param error - Supabaseのエラーオブジェクト
 * @returns 日本語のエラーメッセージ
 */
export function formatSupabaseError(error: PostgrestError | Error | null): string {
  if (!error) return "不明なエラーが発生しました";

  // PostgrestErrorの場合
  if ("code" in error) {
    switch (error.code) {
      case "23505": // unique_violation
        return "この値は既に使用されています";
      case "23503": // foreign_key_violation
        return "関連するデータが存在しません";
      case "23502": // not_null_violation
        return "必須項目が入力されていません";
      case "42501": // insufficient_privilege
        return "この操作を行う権限がありません";
      case "PGRST116": // row not found
        return "データが見つかりませんでした";
      default:
        return error.message || "データベースエラーが発生しました";
    }
  }

  // 一般的なErrorの場合
  return error.message || "エラーが発生しました";
}

/**
 * 認証エラーを人間が読めるメッセージに変換
 * @param error - Supabase Authのエラーオブジェクト
 * @returns 日本語のエラーメッセージ
 */
export function formatAuthError(error: { message?: string; status?: number } | null): string {
  if (!error) return "認証エラーが発生しました";

  const message = error.message?.toLowerCase() || "";

  // よくある認証エラーパターン
  if (message.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが正しくありません";
  }
  if (message.includes("email already registered") || message.includes("already registered")) {
    return "このメールアドレスは既に登録されています";
  }
  if (message.includes("invalid email")) {
    return "正しいメールアドレスを入力してください";
  }
  if (message.includes("password") && message.includes("weak")) {
    return "パスワードが弱すぎます。より強力なパスワードを設定してください";
  }
  if (message.includes("session not found") || message.includes("jwt expired")) {
    return "セッションが期限切れです。再度ログインしてください";
  }
  if (message.includes("user not found")) {
    return "ユーザーが見つかりません";
  }
  if (error.status === 429) {
    return "リクエストが多すぎます。しばらく待ってから再度お試しください";
  }

  return error.message || "認証エラーが発生しました";
}

/**
 * ネットワークエラーかどうかを判定
 * @param error - エラーオブジェクト
 * @returns ネットワークエラーの場合はtrue
 */
export function isNetworkError(error: Error | null): boolean {
  if (!error) return false;

  const message = error.message?.toLowerCase() || "";
  return (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection") ||
    message.includes("timeout")
  );
}

/**
 * エラーメッセージを汎用的な形式に整形
 * @param error - 任意のエラーオブジェクト
 * @returns 日本語のエラーメッセージ
 */
export function formatError(error: unknown): string {
  if (!error) return "不明なエラーが発生しました";

  // Errorオブジェクトの場合
  if (error instanceof Error) {
    // ネットワークエラーのチェック
    if (isNetworkError(error)) {
      return "ネットワークエラーが発生しました。接続を確認してください";
    }
    return error.message;
  }

  // オブジェクトの場合
  if (typeof error === "object" && error !== null) {
    // Supabase AuthError形式
    if ("message" in error && typeof error.message === "string") {
      return formatAuthError(error as { message: string; status?: number });
    }
    // PostgrestError形式
    if ("code" in error) {
      return formatSupabaseError(error as PostgrestError);
    }
  }

  // 文字列の場合
  if (typeof error === "string") {
    return error;
  }

  return "エラーが発生しました";
}

/**
 * フォームのフィールドエラーを整形
 * @param fieldName - フィールド名
 * @param error - エラーメッセージ
 * @returns 整形されたエラーメッセージ
 */
export function formatFieldError(fieldName: string, error: string): string {
  return `${fieldName}: ${error}`;
}
