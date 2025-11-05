import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getNotifications, markAllAsRead } from "@/lib/notifications";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function MarkAllAsReadButton({ userId }: { userId: string }) {
  const handleMarkAllAsRead = async () => {
    "use server";
    await markAllAsRead(userId);
  };

  return (
    <form action={handleMarkAllAsRead}>
      <Button type="submit" variant="outline" size="sm">
        すべて既読にする
      </Button>
    </form>
  );
}

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const notifications = await getNotifications(user.id);
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>通知</CardTitle>
              <CardDescription>あなたへのリアクション通知を確認できます</CardDescription>
            </div>
            {hasUnread && <MarkAllAsReadButton userId={user.id} />}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">通知はありません</div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
