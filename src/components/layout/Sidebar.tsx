import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { CreatePostButton } from "@/components/posts/CreatePostButton";
import { PRESET_TAGS } from "@/lib/tags";

export async function Sidebar() {
  const user = await getCurrentUser();

  return (
    <aside className="w-64 border-r bg-neutral-50 p-4">
      {/* 投稿作成ボタン（ログイン時のみ） */}
      {user && (
        <div className="mb-6">
          <CreatePostButton />
        </div>
      )}

      {/* タグリスト */}
      <Card className="p-4">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">タグ</h2>
        <nav className="space-y-2">
          {PRESET_TAGS.map((tag) => (
            <Link
              key={tag.value}
              href={`/tags/${tag.value}`}
              className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              #{tag.label}
            </Link>
          ))}
        </nav>
      </Card>
    </aside>
  );
}
