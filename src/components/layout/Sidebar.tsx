import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

// 固定タグリスト
const TAGS = [
  { name: "一般", slug: "general", description: "一般的な話題" },
  { name: "質問", slug: "question", description: "質問・相談" },
  { name: "雑談", slug: "chat", description: "雑談・交流" },
  { name: "技術", slug: "tech", description: "技術的な話題" },
  { name: "趣味", slug: "hobby", description: "趣味・娯楽" },
];

export async function Sidebar() {
  const user = await getCurrentUser();

  return (
    <aside className="w-64 border-r bg-neutral-50 p-4">
      {/* 投稿作成ボタン（ログイン時のみ） */}
      {user && (
        <div className="mb-6">
          <Link href="/posts/new">
            <Button className="w-full" size="lg">
              投稿する
            </Button>
          </Link>
        </div>
      )}

      {/* タグリスト */}
      <Card className="p-4">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">タグ</h2>
        <nav className="space-y-2">
          {TAGS.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              #{tag.name}
            </Link>
          ))}
        </nav>
      </Card>
    </aside>
  );
}
