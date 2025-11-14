"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackToProfileLinkProps {
  username: string;
  hasUnsavedChanges: boolean;
}

/**
 * プロフィールに戻るリンクコンポーネント
 * 未保存の変更がある場合は確認ダイアログを表示
 */
export function BackToProfileLink({ username, hasUnsavedChanges }: BackToProfileLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      const confirmed = window.confirm("変更内容が保存されていません。破棄してよろしいですか?");
      if (confirmed) {
        router.push(`/profile/${username}`);
      }
    }
  };

  return (
    <Link
      href={`/profile/${username}`}
      onClick={handleClick}
      className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 transition-colors"
    >
      <ChevronLeft className="h-5 w-5" />
      <span>プロフィールに戻る</span>
    </Link>
  );
}
