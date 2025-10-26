import { createBrowserClient } from "@supabase/ssr";

/**
 * クライアントサイド用のSupabaseクライアントを作成
 * ブラウザ環境で使用するためのクライアント
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
