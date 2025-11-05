import Link from "next/link";
import { getCurrentUser, getProfile, logout } from "@/lib/auth";
import { getUnreadCount } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export async function Header() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const unreadCount = user ? await getUnreadCount(user.id) : 0;

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* ロゴ/タイトル */}
        <Link href="/home" className="text-2xl font-bold text-neutral-900 hover:text-neutral-700">
          Melon
        </Link>

        {/* ナビゲーション */}
        <nav className="flex items-center gap-4">
          {user && profile ? (
            <>
              <Link href="/home" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
                ホーム
              </Link>

              {/* 通知ベル */}
              <NotificationBell userId={user.id} initialUnreadCount={unreadCount} />

              {/* ユーザーメニュー */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                      <AvatarFallback className="bg-neutral-200 text-neutral-700">
                        {profile.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile.display_name || profile.username}</p>
                      <p className="text-xs text-neutral-500">@{profile.username}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${profile.username}`}>プロフィール</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action={logout}>
                      <button type="submit" className="w-full text-left">
                        ログアウト
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">ログイン</Button>
              </Link>
              <Link href="/signup">
                <Button>サインアップ</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
