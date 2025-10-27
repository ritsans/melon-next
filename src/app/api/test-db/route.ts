import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * データベース接続テスト用APIルート
 * GET /api/test-db
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // profiles テーブルから1件取得してみる（型安全にアクセス）
    const { data, error } = await supabase.from("profiles").select("*").limit(1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "データベース接続成功！",
      profileCount: data?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "不明なエラー" },
      { status: 500 },
    );
  }
}
