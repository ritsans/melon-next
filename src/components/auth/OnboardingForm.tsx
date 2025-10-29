"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { updateProfile, checkUsernameAvailability } from "@/lib/auth";
import { type OnboardingFormData, onboardingSchema } from "@/lib/validations";

// 興味のある分野の選択肢
const INTEREST_OPTIONS = [
  "技術",
  "雑談",
  "質問",
  "ライフスタイル",
  "趣味",
  "学習",
  "ビジネス",
  "エンタメ",
];

/**
 * オンボーディングフォームコンポーネント
 */
export function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [usernameCheckState, setUsernameCheckState] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      interests: [],
    },
  });

  // ユーザー名のリアルタイムチェック
  useEffect(() => {
    const username = watch("username");

    if (!username || username.length < 3) {
      setUsernameCheckState("idle");
      return;
    }

    // バリデーションエラーがある場合はチェックしない
    if (errors.username) {
      setUsernameCheckState("idle");
      return;
    }

    const timeoutId = setTimeout(async () => {
      setUsernameCheckState("checking");
      const isAvailable = await checkUsernameAvailability(username);
      setUsernameCheckState(isAvailable ? "available" : "taken");
    }, 500); // 500msのデバウンス

    return () => clearTimeout(timeoutId);
  }, [watch("username"), errors.username]);

  const handleInterestToggle = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter((i) => i !== interest)
      : [...selectedInterests, interest];

    setSelectedInterests(newInterests);
    setValue("interests", newInterests, { shouldValidate: true });
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setError(null);
    const result = await updateProfile(data);
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="py-8 px-8">
        <CardTitle>プロフィール設定</CardTitle>
        <CardDescription>アカウントの初期設定を行ってください</CardDescription>
      </CardHeader>
      <CardContent className="px-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {/* ユーザー名 */}
          <div>
            <Label htmlFor="username">
              ユーザー名 <span className="text-red-600">*</span>
            </Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="user_name"
                {...register("username")}
                disabled={isSubmitting}
                className="mt-2 pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                {usernameCheckState === "checking" && (
                  <span className="text-gray-400 text-sm">確認中...</span>
                )}
                {usernameCheckState === "available" && (
                  <span className="text-green-600 text-lg">✓</span>
                )}
                {usernameCheckState === "taken" && (
                  <span className="text-red-600 text-lg">✗</span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">英数字とアンダースコアのみ、3〜20文字</p>
            {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>}
            {usernameCheckState === "taken" && !errors.username && (
              <p className="text-sm text-red-600 mt-1">このユーザー名は既に使用されています</p>
            )}
            {usernameCheckState === "available" && (
              <p className="text-sm text-green-600 mt-1">このユーザー名は利用可能です</p>
            )}
          </div>

          {/* 表示名 */}
          <div>
            <Label htmlFor="display_name">表示名</Label>
            <Input
              id="display_name"
              type="text"
              placeholder="太郎"
              {...register("display_name")}
              disabled={isSubmitting}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">15文字以下（省略可）</p>
            {errors.display_name && <p className="text-sm text-red-600 mt-1">{errors.display_name.message}</p>}
          </div>

          {/* 自己紹介 */}
          <div>
            <Label htmlFor="bio">自己紹介</Label>
            <Textarea
              id="bio"
              placeholder="よろしくお願いします"
              {...register("bio")}
              disabled={isSubmitting}
              className="mt-2 min-h-32"
              rows={6}
            />
            <p className="text-sm text-gray-500 mt-1">200文字以下（省略可）</p>
            {errors.bio && <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>}
          </div>

          {/* 興味のある分野 */}
          <div>
            <Label>
              興味のある分野 <span className="text-red-600">*</span>
            </Label>
            <p className="text-sm text-gray-500 mt-1 mb-3">1〜5個選択してください</p>
            <div className="grid grid-cols-2 gap-3">
              {INTEREST_OPTIONS.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={`interest-${interest}`}
                    checked={selectedInterests.includes(interest)}
                    onCheckedChange={() => handleInterestToggle(interest)}
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor={`interest-${interest}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
            {errors.interests && <p className="text-sm text-red-600 mt-2">{errors.interests.message}</p>}
          </div>

          {/* 送信ボタン */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "設定中..." : "設定を完了"}
          </Button>

          {/* エラーメッセージ */}
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
