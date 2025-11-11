import { notFound } from "next/navigation";
import { getPostById, getReplies } from "@/lib/posts";
import { getCurrentUser } from "@/lib/auth";
import { PostCard } from "@/components/posts/PostCard";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  // 投稿を取得
  const post = await getPostById(id);

  // 投稿が存在しない場合は404を表示
  if (!post) {
    notFound();
  }

  // リプライを取得
  const replies = await getReplies(id);

  // リアクション用に現在のユーザーを取得
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <PostCard post={post} currentUserId={user?.id} replies={replies} />
    </div>
  );
}
