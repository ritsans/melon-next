"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackToProfileLink } from "@/components/profile/BackToProfileLink";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";

interface ProfileEditPageContentProps {
  profile: {
    display_name: string | null;
    bio: string | null;
    interests: string[] | null;
    avatar_url: string | null;
    username: string;
  };
  email: string;
}

/**
 * プロフィール編集ページのクライアントコンポーネント
 */
export function ProfileEditPageContent({ profile, email }: ProfileEditPageContentProps) {
  // 未保存の変更があるかどうか
  const [mihozon, setMihozon] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <BackToProfileLink username={profile.username} hasUnsavedChanges={mihozon} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>プロフィール編集</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileEditForm profile={profile} email={email} onMihozonChange={setMihozon} />
        </CardContent>
      </Card>
    </div>
  );
}
