"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema } from "@/lib/validations";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";

type PostFormData = z.infer<typeof postSchema>;

type PostFormProps = {
  onSubmit: (data: PostFormData) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
};

const TAGS = [
  { value: "general", label: "一般" },
  { value: "question", label: "質問" },
  { value: "chat", label: "雑談" },
] as const;

export function PostForm({ onSubmit, onCancel }: PostFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      tags: [],
    },
  });

  const content = watch("content");
  const contentLength = content?.length || 0;

  const handleFormSubmit = (data: PostFormData) => {
    setError(null);
    startTransition(async () => {
      const result = await onSubmit(data);
      if (result.success) {
        reset();
        onCancel?.();
      } else {
        setError(result.error || "投稿に失敗しました");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Content Input */}
      <div className="space-y-2">
        <Label htmlFor="content">投稿内容</Label>
        <Textarea
          id="content"
          placeholder="今何を考えていますか？"
          rows={6}
          {...register("content")}
          disabled={isPending}
          className="resize-none"
        />
        <div className="flex items-center justify-between">
          <div>
            {errors.content && <p className="text-sm text-red-600">{errors.content.message}</p>}
          </div>
          <p className="text-sm text-neutral-500">
            {contentLength} / 500
          </p>
        </div>
      </div>

      {/* Tag Selection */}
      <div className="space-y-2">
        <Label htmlFor="tags">タグ（複数選択可）</Label>
        <div className="flex flex-wrap gap-3">
          {TAGS.map((tag) => (
            <label key={tag.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                value={tag.value}
                {...register("tags")}
                disabled={isPending}
                className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-neutral-700">{tag.label}</span>
            </label>
          ))}
        </div>
        {errors.tags && <p className="text-sm text-red-600">{errors.tags.message}</p>}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            キャンセル
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "投稿中..." : "投稿する"}
        </Button>
      </div>
    </form>
  );
}
