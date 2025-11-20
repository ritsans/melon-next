"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type PostFormData, postSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormError } from "@/components/ui/form-error";
import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { PRESET_TAGS, normalizeTag } from "@/lib/tags";
import { ImageUploader } from "@/components/posts/ImageUploader";

type PostFormProps = {
  onSubmit: (data: PostFormData & { images?: File[] }) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
};

export function PostForm({ onSubmit, onCancel }: PostFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [customTag, setCustomTag] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      tags: [],
    },
  });

  const content = useWatch({ control, name: "content" }) ?? "";
  const contentLength = content?.length || 0;
  const selectedTags = useWatch({ control, name: "tags" }) ?? [];

  const toggleTag = (tagValue: string) => {
    const currentTags = selectedTags || [];
    if (currentTags.includes(tagValue)) {
      setValue(
        "tags",
        currentTags.filter((t) => t !== tagValue),
      );
    } else {
      setValue("tags", [...currentTags, tagValue]);
    }
  };

  const addCustomTag = () => {
    const normalized = normalizeTag(customTag);
    if (normalized && !selectedTags.includes(normalized)) {
      setValue("tags", [...selectedTags, normalized]);
      setCustomTag("");
      setShowCustomInput(false);
    }
  };

  const removeTag = (tagValue: string) => {
    setValue(
      "tags",
      selectedTags.filter((t) => t !== tagValue),
    );
  };

  const handleFormSubmit = (data: PostFormData) => {
    setError(null);
    startTransition(async () => {
      const result = await onSubmit({ ...data, images });
      if (result.success) {
        reset();
        setCustomTag("");
        setShowCustomInput(false);
        setImages([]);
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
          <FormError error={errors.content?.message} />
          <p className="text-sm text-muted-foreground">{contentLength} / 500</p>
        </div>
      </div>

      {/* Tag Selection */}
      <div className="space-y-3">
        <Label>タグを選択または追加</Label>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => {
              const presetTag = PRESET_TAGS.find((t) => t.value === tag);
              const label = presetTag ? presetTag.label : tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeTag(tag)}
                  disabled={isPending}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-3xl bg-accent px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-accent/80 disabled:opacity-50"
                >
                  {label}
                  <X className="h-3 w-3" />
                </button>
              );
            })}
          </div>
        )}

        {/* Preset Tags */}
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => toggleTag(tag.value)}
                disabled={isPending}
                className={`cursor-pointer rounded-3xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  isSelected
                    ? "border-primary bg-accent text-primary"
                    : "border-border bg-background text-foreground hover:border-primary hover:bg-accent"
                }`}
              >
                {tag.label}
              </button>
            );
          })}

          {/* Custom Tag Button */}
          {!showCustomInput && (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              disabled={isPending}
              className="inline-flex cursor-pointer items-center gap-1 rounded-3xl border border-dashed border-muted-foreground bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-accent hover:text-primary disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              新しいタグを入力
            </button>
          )}


          
        </div>

        {/* Custom Tag Input */}
        {showCustomInput && (
          <div className="flex gap-2">
            <Input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomTag();
                }
              }}
              placeholder="カスタムタグを入力"
              disabled={isPending}
              className="flex-1"
            />
            <Button type="button" onClick={addCustomTag} disabled={isPending} size="sm">
              追加
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCustomInput(false);
                setCustomTag("");
              }}
              disabled={isPending}
              size="sm"
            >
              キャンセル
            </Button>
          </div>
        )}

        <FormError error={errors.tags?.message} />
      </div>

    {/* Image Upload */}
      <div className="space-y-2">
        <Label>画像（任意・最大4枚）</Label>
        <ImageUploader images={images} onImagesChange={setImages} maxImages={4} />
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} />}

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
