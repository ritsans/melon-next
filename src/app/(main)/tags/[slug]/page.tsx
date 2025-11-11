import { getPostsByTag, getReplies } from "@/lib/posts";
import { PostCard } from "@/components/posts/PostCard";
import { getCurrentUser } from "@/lib/auth";
import { tagLabel } from "@/lib/tags";

type Params = Promise<{ slug: string }>;

export default async function TagPage({ params }: { params: Params }) {
  const { slug } = await params;
  const posts = await getPostsByTag(slug);
  const user = await getCurrentUser();
  const label = tagLabel(slug);

  // 各投稿のリプライを取得
  const postsWithReplies = await Promise.all(
    posts.map(async (post) => ({
      post,
      replies: await getReplies(post.id),
    })),
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">#{label} の投稿</h1>
        <p className="mt-2 text-sm text-neutral-600">{postsWithReplies.length}件の投稿</p>
      </div>

      <div className="space-y-4">
        {postsWithReplies.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
            <p className="text-neutral-600">このタグの投稿はまだありません</p>
            <p className="mt-2 text-sm text-neutral-500">#{label} タグで最初の投稿をしてみましょう！</p>
          </div>
        ) : (
          postsWithReplies.map(({ post, replies }) => (
            <PostCard key={post.id} post={post} currentUserId={user?.id} replies={replies} />
          ))
        )}
      </div>
    </div>
  );
}
