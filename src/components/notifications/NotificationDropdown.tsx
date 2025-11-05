"use client";

import { useEffect, useState, useTransition } from "react";
import { getNotifications, markAllAsRead } from "@/lib/notifications";
import { NotificationItem } from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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

interface NotificationDropdownProps {
  userId: string;
  onNotificationRead?: () => void;
}

export function NotificationDropdown({ userId, onNotificationRead }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      const data = await getNotifications(userId);
      setNotifications(data as Notification[]);
      setIsLoading(false);
    };

    fetchNotifications();
  }, [userId]);

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      await markAllAsRead(userId);
      // 通知を再取得して状態を更新
      const data = await getNotifications(userId);
      setNotifications(data as Notification[]);
      onNotificationRead?.();
    });
  };

  const handleNotificationClick = () => {
    // 個別通知がクリックされたときに未読数を更新
    onNotificationRead?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        通知はありません
      </div>
    );
  }

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="font-semibold">通知</h3>
        {hasUnread && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={isPending}>
            すべて既読
          </Button>
        )}
      </div>
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={handleNotificationClick}
          />
        ))}
      </div>
    </div>
  );
}
