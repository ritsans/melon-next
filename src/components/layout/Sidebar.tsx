import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { CreatePostButton } from "@/components/posts/CreatePostButton";
import { PRESET_TAGS } from "@/lib/tags";

export async function Sidebar() {
  const user = await getCurrentUser();

  return (
    <aside className="w-64 border-r bg-accent/30 p-4">
      {/* 投稿作成ボタン（ログイン時のみ） */}
      {user && (
        <div className="mb-6">
          <CreatePostButton />
        </div>
      )}

      {/* ナビゲーション */}
      <nav className="mb-6 space-y-1">
        <Link
          href="/home"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-primary"
        >
          <span>🏠</span>
          <span>ホーム</span>
        </Link>
        <Link
          href="/everyone"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-primary"
        >
          <span>🌐</span>
          <span>みんなの投稿</span>
        </Link>
        {user && (
          <Link
            href="/notifications"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-primary"
          >
            <span>🔔</span>
            <span>通知</span>
          </Link>
        )}
      </nav>

      {/* タグリスト */}
      <Card className="p-4">
        <h2 className="mb-4 text-lg font-semibold text-foreground">タグ</h2>
        <nav className="space-y-2">
          {PRESET_TAGS.map((tag) => (
            <Link
              key={tag.value}
              href={`/tags/${tag.value}`}
              className="block rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-primary"
            >
              #{tag.label}
            </Link>
          ))}
        </nav>
      </Card>
    </aside>
  );
}
