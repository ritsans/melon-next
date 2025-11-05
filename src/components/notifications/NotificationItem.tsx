"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { markAsRead } from "@/lib/notifications";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  reaction_emoji: string;
  is_read: boolean | null;
  created_at: string | null;
  actor: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  post: {
    id: string;
    content: string;
  } | null;
};

interface NotificationItemProps {
  notification: Notification;
  onRead?: () => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      // 未読の場合は既読にする
      if (!notification.is_read) {
        await markAsRead(notification.id);
        onRead?.();
      }
      // 投稿ページに遷移（ホームフィードへのスクロールで代用）
      router.push("/home");
    });
  };

  if (!notification.actor || !notification.post) {
    return null;
  }

  const actorName = notification.actor.display_name || notification.actor.username;
  const postPreview =
    notification.post.content.length > 30
      ? `${notification.post.content.slice(0, 30)}...`
      : notification.post.content;

  // 相対時間の表示
  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "たった今";
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString("ja-JP");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "w-full px-4 py-3 text-left transition-colors hover:bg-muted/50",
        !notification.is_read && "bg-blue-50",
        isPending && "opacity-50",
      )}
    >
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{actorName[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <p className="text-sm">
            <span className="font-semibold">{actorName}</span>
            さんがあなたの投稿に
            <span className="mx-1 text-lg">{notification.reaction_emoji}</span>
            しました
          </p>
          <p className="text-xs text-muted-foreground">{postPreview}</p>
          <p className="text-xs text-muted-foreground">{getRelativeTime(notification.created_at)}</p>
        </div>
        {!notification.is_read && <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />}
      </div>
    </button>
  );
}
