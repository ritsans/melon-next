"use client";

import { useState, useTransition } from "react";
import { createReply } from "@/lib/posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ReplyFormProps = {
  parentPostId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ReplyForm({ parentPostId, onSuccess, onCancel }: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createReply({
        content,
        parentPostId,
      });

      if (result.success) {
        setContent("");
        onSuccess?.();
      } else {
        setError(result.error || "返信の作成に失敗しました");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="返信を入力..."
        disabled={isPending}
        rows={3}
        className="resize-none"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            キャンセル
          </Button>
        )}
        <Button type="submit" disabled={isPending || content.trim().length === 0}>
          {isPending ? "送信中..." : "返信する"}
        </Button>
      </div>
    </form>
  );
}
