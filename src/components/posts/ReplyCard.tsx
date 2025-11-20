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
import { DeletePostDialog } from "./DeletePostDialog";
import { ReplyForm } from "./ReplyForm";
import { MoreVertical, Trash2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type ReplyCardProps = {
  reply: PostWithProfile;
  currentUserId?: string;
  depth?: number; // 階層深度（0 = 第1階層, 1 = 第2階層）
  onDeleted?: () => void; // 削除時のコールバック
};

export function ReplyCard({ reply, currentUserId, depth = 0, onDeleted }: ReplyCardProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [replyFormOpen, setReplyFormOpen] = useState(false);
  const displayName = reply.profile.display_name || reply.profile.username;
  const isOwnReply = currentUserId === reply.user_id;
  const isMaxDepth = depth >= 1; // 第2階層が最大
  const nestedReplies = reply.nested_replies || [];

  // 返信が成功したらページを再読み込み（サーバーから最新データを取得）
  const handleReplySuccess = () => {
    setReplyFormOpen(false);
    router.refresh();
  };

  // 返信が削除されたらページを再読み込み / 親に通知
  const handleReplyDeleted = () => {
    if (depth === 0) {
      // 第1階層：ページ全体を再読み込み
      router.refresh();
    } else {
      // 第2階層：親のコールバックを呼び出す
      onDeleted?.();
    }
  };

  return (
    <div className={`flex gap-3 rounded-lg p-3 ${depth === 0 ? "bg-accent/30" : "bg-accent/50"}`}>
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
              className="font-semibold text-sm text-foreground hover:underline"
            >
              {displayName}
            </Link>
            <span className="text-xs text-muted-foreground">@{reply.profile.username}</span>
            <span className="text-xs text-muted-foreground/70">·</span>
            <span className="text-xs text-muted-foreground" suppressHydrationWarning>
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

        <DeletePostDialog
          postId={reply.id}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleted={handleReplyDeleted}
        />

        {/* 返信コンテンツ */}
        <p className="whitespace-pre-wrap wrap-break-word text-sm text-foreground">{reply.content}</p>

        {/* 返信ボタン（第1階層のみ） */}
        {!isMaxDepth && currentUserId && (
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyFormOpen(!replyFormOpen)}
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>返信</span>
            </Button>
          </div>
        )}

        {/* 返信フォーム */}
        {replyFormOpen && currentUserId && !isMaxDepth && (
          <div className="mt-2 rounded-lg border border-border bg-background p-2">
            <ReplyForm
              parentPostId={reply.id}
              onSuccess={handleReplySuccess}
              onCancel={() => setReplyFormOpen(false)}
            />
          </div>
        )}

        {/* ネストされた返信（第2階層） */}
        {depth === 0 && nestedReplies.length > 0 && (
          <div className="mt-3 space-y-2 border-l-2 border-border pl-3">
            {nestedReplies.map((nestedReply) => (
              <ReplyCard
                key={nestedReply.id}
                reply={nestedReply}
                currentUserId={currentUserId}
                depth={1}
                onDeleted={handleReplyDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
