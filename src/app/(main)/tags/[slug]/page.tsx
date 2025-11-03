import { getPostsByTag } from "@/lib/posts";
import { PostCard } from "@/components/posts/PostCard";
import { getCurrentUser } from "@/lib/auth";
import { tagLabel } from "@/lib/tags";

type Params = Promise<{ slug: string }>;

export default async function TagPage({ params }: { params: Params }) {
  const { slug } = await params;
  const posts = await getPostsByTag(slug);
  const user = await getCurrentUser();
  const label = tagLabel(slug);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">#{label} の投稿</h1>
        <p className="mt-2 text-sm text-neutral-600">{posts.length}件の投稿</p>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
            <p className="text-neutral-600">このタグの投稿はまだありません</p>
            <p className="mt-2 text-sm text-neutral-500">#{label} タグで最初の投稿をしてみましょう！</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user?.id} />)
        )}
      </div>
    </div>
  );
}
