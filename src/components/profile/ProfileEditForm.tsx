"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormError } from "@/components/ui/form-error";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { updateUserProfile, updateAvatar, removeAvatar } from "@/lib/profiles";
import { type ProfileEditFormData, profileEditSchema } from "@/lib/validations";

// 興味のある分野の選択肢
const INTEREST_OPTIONS = ["技術", "雑談", "質問", "ライフスタイル", "趣味", "学習", "ビジネス", "エンタメ"];

interface ProfileEditFormProps {
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
 * プロフィール編集フォームコンポーネント
 */
export function ProfileEditForm({ profile, email }: ProfileEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile.interests || []);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);
  const [isAvatarUpdating, setIsAvatarUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setValue,
    control,
  } = useForm<Omit<ProfileEditFormData, "avatar">>({
    resolver: zodResolver(profileEditSchema.omit({ avatar: true })),
    defaultValues: {
      display_name: profile.display_name || "",
      bio: profile.bio || "",
      interests: profile.interests || [],
    },
  });

  const hasUnsavedChanges = isDirty || avatarFile !== null || shouldRemoveAvatar;

  // 離脱警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 興味タグのトグル
  const handleInterestToggle = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter((i) => i !== interest)
      : [...selectedInterests, interest];

    setSelectedInterests(newInterests);
    setValue("interests", newInterests, { shouldValidate: true });
  };

  // アバター変更ハンドラ
  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file);
    // 新しいファイルが選択された場合、削除フラグをクリア
    if (file) {
      setShouldRemoveAvatar(false);
    } else {
      // nullが渡された場合は削除意図とみなす
      setShouldRemoveAvatar(true);
    }
  };

  // フォーム送信
  const onSubmit = async (data: Omit<ProfileEditFormData, "avatar">) => {
    setError(null);

    try {
      // アバター画像の処理
      if (avatarFile) {
        // 新しいアバターをアップロード
        setIsAvatarUpdating(true);
        const avatarResult = await updateAvatar(avatarFile);
        setIsAvatarUpdating(false);

        if (!avatarResult.success) {
          setError(avatarResult.error || "アバターの更新に失敗しました");
          return;
        }
      } else if (shouldRemoveAvatar && profile.avatar_url) {
        // 既存のアバターを削除する場合
        setIsAvatarUpdating(true);
        const removeResult = await removeAvatar();
        setIsAvatarUpdating(false);

        if (!removeResult.success) {
          setError(removeResult.error || "アバターの削除に失敗しました");
          return;
        }
      }

      // プロフィール情報の更新
      const result = await updateUserProfile({
        display_name: data.display_name,
        bio: data.bio,
        interests: data.interests,
      });

      if (!result.success) {
        setError(result.error || "プロフィールの更新に失敗しました");
        return;
      }

      // 成功時は即座にプロフィールページにリダイレクト
      router.push(`/profile/${profile.username}?updated=true`);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("予期しないエラーが発生しました");
    }
  };;

  // キャンセル
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("変更内容が保存されていません。破棄してよろしいですか?");
      if (!confirmed) return;
    }
    router.back();
  };

  // 自己紹介の文字数
  const bioValue = useWatch({ control, name: "bio" }) || "";
  const bioLength = bioValue.length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* エラーメッセージ */}
      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

      {/* アバター画像 */}
      <div>
        <Label>アバター画像</Label>
        <div className="mt-2">
          <AvatarUploader currentAvatar={profile.avatar_url} onAvatarChange={handleAvatarChange} />
        </div>
      </div>

      {/* 表示名 */}
      <div>
        <Label htmlFor="display_name">
          表示名 <span className="text-red-600">*</span>
        </Label>
        <Input
          id="display_name"
          type="text"
          placeholder="太郎"
          {...register("display_name")}
          disabled={isSubmitting || isAvatarUpdating}
          className="mt-2"
        />
        <p className="text-sm text-gray-500 mt-1">1〜50文字</p>
        <FormError error={errors.display_name?.message} className="mt-1" />
      </div>

      {/* 自己紹介 */}
      <div>
        <Label htmlFor="bio">自己紹介</Label>
        <Textarea
          id="bio"
          placeholder="よろしくお願いします"
          {...register("bio")}
          disabled={isSubmitting || isAvatarUpdating}
          className="mt-2 min-h-32"
          rows={6}
          maxLength={200}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-500">200文字以下（省略可）</p>
          <p className="text-sm text-gray-500">{bioLength} / 200</p>
        </div>
        <FormError error={errors.bio?.message} className="mt-1" />
      </div>

      {/* 興味のある分野 */}
      <div>
        <Label>興味のある分野</Label>
        <p className="text-sm text-gray-500 mt-1 mb-3">最大5つまで選択可能（省略可）</p>
        <div className="flex flex-wrap gap-3">
          {INTEREST_OPTIONS.map((interest) => (
            <div key={interest} className="flex items-center space-x-2">
              <Checkbox
                id={`interest-${interest}`}
                checked={selectedInterests.includes(interest)}
                onCheckedChange={() => handleInterestToggle(interest)}
                disabled={isSubmitting || isAvatarUpdating}
              />
              <Label htmlFor={`interest-${interest}`} className="cursor-pointer font-normal">
                {interest}
              </Label>
            </div>
          ))}
        </div>
        <FormError error={errors.interests?.message} className="mt-2" />
      </div>

      {/* メールアドレス（表示のみ） */}
      <div>
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" type="email" value={email} disabled className="mt-2 bg-gray-100 cursor-not-allowed" />
        <p className="text-sm text-gray-500 mt-1">メールアドレスは変更できません</p>
      </div>

      {/* 送信ボタン */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting || isAvatarUpdating} className="flex-1">
          {isSubmitting || isAvatarUpdating ? "更新中..." : "保存"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting || isAvatarUpdating}
          className="flex-1"
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
