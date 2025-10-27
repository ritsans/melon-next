import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * プロキシ：認証状態の管理とセッションの更新
 * 全てのリクエストで実行され、Supabaseセッションを更新する
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({
            request,
          });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // セッションの更新（返り値は利用しないが、これによりクッキーが最新化される）
  await supabase.auth.getUser();

  // 認証が必要なページへのアクセス制御（今後実装）
  // if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * 以下のパスを除く全てのリクエストパスにマッチ:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - 画像ファイル (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
