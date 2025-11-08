"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/utils";
import type { PostWithProfile } from "@/lib/posts";
import { tagLabel } from "@/lib/tags";
import { ReactionPanel } from "@/components/reactions/ReactionPanel";
import { DeletePostDialog } from "./DeletePostDialog";
import { ImageGallery } from "./ImageGallery";
import { MoreVertical, Trash2 } from "lucide-react";

type PostCardProps = {
  post: PostWithProfile;
  currentUserId?: string;
};

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const displayName = post.profile.display_name || post.profile.username;
  const isOwnPost = currentUserId === post.user_id;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
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
                  #{tagLabel(tag)}
                </Link>
              ))}
            </div>
          </div>

          {/* Post Options Menu (only for own posts) */}
          {isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">投稿メニューを開く</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  投稿を削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <DeletePostDialog postId={post.id} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />

      <CardContent className="pt-0">
        {/* Post Content - offset to align with user info */}
        <div className="ml-[52px] space-y-4">
          <p className="whitespace-pre-wrap wrap-break-word text-neutral-900">{post.content}</p>

          {/* Images */}
          {post.image_urls && post.image_urls.length > 0 && (
            <ImageGallery images={post.image_urls} />
          )}

          {/* Reactions */}
          <ReactionPanel postId={post.id} reactions={post.reactions} currentUserId={currentUserId} />
        </div>
      </CardContent>
    </Card>
  );
}
