"use client";

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getUnreadCount } from "@/lib/notifications";
import { NotificationDropdown } from "./NotificationDropdown";

interface NotificationBellProps {
  userId: string;
  initialUnreadCount?: number;
}

export function NotificationBell({ userId, initialUnreadCount = 0 }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isOpen, setIsOpen] = useState(false);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // ポーリング: 30秒ごとに未読数を更新
  // 開発環境ではポーリングを無効化、本番環境では有効化
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const count = await getUnreadCount(userId);
      setUnreadCount(count);
      setLastPolled(new Date());

      // デバッグ表示を3秒間だけ表示
      setShowDebug(true);
      setTimeout(() => setShowDebug(false), 3000);
    };

    // 初回取得
    fetchUnreadCount();

    // 本番環境のみポーリングを有効化（開発環境では無効）
    const isProduction = process.env.NODE_ENV === "production";
    const interval = isProduction ? setInterval(fetchUnreadCount, 30000) : undefined;

    // クリーンアップ
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userId]);

  // ドロップダウンが閉じられたときに未読数を更新
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // ドロップダウンが閉じられたら未読数を再取得
      getUnreadCount(userId).then(setUnreadCount);
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
            <span className="sr-only">通知</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <NotificationDropdown
            userId={userId}
            onNotificationRead={() => getUnreadCount(userId).then(setUnreadCount)}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* デバッグ表示 */}
      {showDebug && lastPolled && (
        <div className="fixed bottom-4 right-4 animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-md bg-neutral-900/90 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <div>
              <div className="font-semibold">ポーリング実行</div>
              <div className="text-neutral-300">
                {lastPolled.toLocaleTimeString("ja-JP")} | 未読: {unreadCount}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
