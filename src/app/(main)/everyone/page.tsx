import { getPosts, getReplies } from "@/lib/posts";
import { PostCard } from "@/components/posts/PostCard";
import { CreatePostButton } from "@/components/posts/CreatePostButton";
import { getCurrentUser } from "@/lib/auth";

export default async function EveryonePage() {
  const posts = await getPosts();
  const user = await getCurrentUser();

  // 各投稿のリプライを取得
  const postsWithReplies = await Promise.all(
    posts.map(async (post) => ({
      post,
      replies: await getReplies(post.id),
    })),
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">みんなの投稿</h1>
        <CreatePostButton />
      </div>

      <div className="space-y-4">
        {postsWithReplies.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
            <p className="text-neutral-600">まだ投稿がありません</p>
            <p className="mt-2 text-sm text-neutral-500">最初の投稿をしてみましょう！</p>
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
