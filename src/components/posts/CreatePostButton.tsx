"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PostForm } from "./PostForm";
import { createPost } from "@/lib/posts";
import type { PostFormData } from "@/lib/validations";
import { PenSquare } from "lucide-react";

export function CreatePostButton() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: PostFormData) => {
    const result = await createPost(data);
    if (result.success) {
      setOpen(false);
    }
    return result;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <PenSquare className="h-5 w-5" />
          投稿する
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>新規投稿</DialogTitle>
          <DialogDescription>あなたの考えをシェアしましょう</DialogDescription>
        </DialogHeader>
        <PostForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
