import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import type { PostWithProfile } from "@/lib/posts";

type PostCardProps = {
  post: PostWithProfile;
};

const TAG_LABELS: Record<string, string> = {
  general: "一般",
  question: "質問",
  chat: "雑談",
};

export function PostCard({ post }: PostCardProps) {
  const displayName = post.profile.display_name || post.profile.username;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex gap-3">
          {/* User Avatar */}
          <Link href={`/profile/${post.profile.username}`} className="shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.profile.avatar_url || undefined} alt={post.profile.username} />
              <AvatarFallback className="bg-neutral-200 text-neutral-700">
                {post.profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* User Info and Post Meta */}
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${post.profile.username}`}
                className="font-semibold text-neutral-900 hover:underline"
              >
                {displayName}
              </Link>
              <span className="text-sm text-neutral-500">@{post.profile.username}</span>
              <span className="text-sm text-neutral-400">·</span>
              <span className="text-sm text-neutral-500">{formatRelativeTime(post.created_at)}</span>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/tags/${tag}`} className="text-sm font-medium text-blue-600 hover:underline">
                  #{TAG_LABELS[tag] || tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post Content - offset to align with user info */}
        <div className="ml-[52px]">
          <p className="whitespace-pre-wrap wrap-break-word text-neutral-900">{post.content}</p>
        </div>
      </CardContent>
    </Card>
  );
}
