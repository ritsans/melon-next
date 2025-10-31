import { getPosts } from "@/lib/posts";
import { PostCard } from "@/components/posts/PostCard";
import { CreatePostButton } from "@/components/posts/CreatePostButton";

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">ホーム</h1>
        <CreatePostButton />
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
            <p className="text-neutral-600">まだ投稿がありません</p>
            <p className="mt-2 text-sm text-neutral-500">最初の投稿をしてみましょう！</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
