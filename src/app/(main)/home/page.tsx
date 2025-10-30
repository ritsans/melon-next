import { getPosts, type PostWithProfile } from "@/lib/posts";
import { PostCard } from "@/components/posts/PostCard";

// サンプルデータ（確認用、後で削除予定）
const samplePost: PostWithProfile = {
  id: "sample-id-123",
  content: "これはサンプル投稿です。\n\nMelonへようこそ！投稿機能を実装したら、実際の投稿が表示されます。",
  tag: "general",
  created_at: "2025-10-30T04:00:00.000Z", // 固定日時
  user_id: "sample-user-id",
  profile: {
    username: "sample_user",
    display_name: "サンプルユーザー",
    avatar_url: null,
  },
};

export default async function HomePage() {
  const posts = await getPosts();

  // 確認用: DBに投稿があれば最初の1件、なければサンプルを表示
  const displayPost = posts.length > 0 ? posts[0] : samplePost;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">ホーム</h1>

      <div className="space-y-4">
        <PostCard post={displayPost} />
        {posts.length === 0 && (
          <p className="text-center text-sm text-neutral-500">
            （サンプル投稿を表示中。投稿機能実装後に実際のデータが表示されます）
          </p>
        )}
        {posts.length > 1 && (
          <p className="text-center text-sm text-neutral-500">
            （確認用: 最初の1件のみ表示中。残り {posts.length - 1} 件）
          </p>
        )}
      </div>
    </div>
  );
}
