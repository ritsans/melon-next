"use client";

import { useState } from "react";
import Link from "next/link";
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
import { ReactionPanel } from "@/components/reactions/ReactionPanel";
import { DeletePostDialog } from "./DeletePostDialog";
import { MoreVertical, Trash2 } from "lucide-react";

type ReplyCardProps = {
  reply: PostWithProfile;
  currentUserId?: string;
};

export function ReplyCard({ reply, currentUserId }: ReplyCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const displayName = reply.profile.display_name || reply.profile.username;
  const isOwnReply = currentUserId === reply.user_id;

  return (
    <div className="flex gap-3 rounded-lg bg-neutral-50 p-3">
      {/* ユーザーアバター */}
      <Link href={`/profile/${reply.profile.username}`} className="shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={reply.profile.avatar_url || undefined} alt={reply.profile.username} />
          <AvatarFallback className="bg-neutral-200 text-neutral-700 text-xs">
            {reply.profile.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        {/* ユーザー情報とメタデータ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${reply.profile.username}`}
              className="font-semibold text-sm text-neutral-900 hover:underline"
            >
              {displayName}
            </Link>
            <span className="text-xs text-neutral-500">@{reply.profile.username}</span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs text-neutral-500" suppressHydrationWarning>
              {formatRelativeTime(reply.created_at)}
            </span>
          </div>

          {/* 削除メニュー（自分のリプライのみ） */}
          {isOwnReply && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                  <span className="sr-only">リプライメニューを開く</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  リプライを削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <DeletePostDialog postId={reply.id} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />

        {/* リプライコンテンツ */}
        <p className="whitespace-pre-wrap wrap-break-word text-sm text-neutral-900">{reply.content}</p>

        {/* リアクション */}
        <ReactionPanel
          postId={reply.id}
          reactions={reply.reactions}
          currentUserId={currentUserId}
          isOwnPost={isOwnReply}
        />
      </div>
    </div>
  );
}
