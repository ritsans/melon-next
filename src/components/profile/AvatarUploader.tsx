"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { Upload, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validateAvatarImage } from "@/lib/image-utils.client";

interface AvatarUploaderProps {
  currentAvatar?: string | null;
  onAvatarChange: (file: File | null) => void;
  error?: string;
}

/**
 * アバター画像のアップロードコンポーネント
 * - 正方形のプレビュー表示
 * - ドラッグ&ドロップ対応
 * - クリックでファイル選択
 * - 画像削除機能
 */
export function AvatarUploader({ currentAvatar, onAvatarChange, error }: AvatarUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ドラッグ&ドロップ - ドラッグオーバー
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // ドラッグ&ドロップ - ドラッグリーブ
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // ドラッグ&ドロップ - ドロップ
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  // ファイル選択
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  // ファイル処理
  const handleFile = (file: File) => {
    setValidationError("");

    // 画像形式チェック
    if (!file.type.startsWith("image/")) {
      setValidationError("画像ファイルを選択してください");
      return;
    }

    // バリデーション
    const validation = validateAvatarImage(file);
    if (!validation.valid) {
      setValidationError(validation.error || "画像のバリデーションに失敗しました");
      return;
    }

    // プレビューURL生成
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // 親コンポーネントに通知
    onAvatarChange(file);
  };

  // アバター削除
  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    setValidationError("");
    onAvatarChange(null);

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ファイル選択ダイアログを開く
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const displayError = error || validationError;
  const hasAvatar = previewUrl || currentAvatar;

  return (
    <div className="space-y-4">
      {/* アバタープレビュー / アップロードエリア */}
      <div className="flex items-center gap-6">
        {/* アバター（クリック・ドラッグ&ドロップ対応） */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickUpload}
          className={cn(
            "relative w-32 h-32 rounded-full overflow-hidden border-4 cursor-pointer transition-all",
            isDragging ? "border-primary ring-4 ring-primary/20" : "border-gray-200 hover:border-primary/50",
            displayError && "border-red-300",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {hasAvatar ? (
            <Image src={previewUrl || currentAvatar || ""} alt="アバタープレビュー" fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* オーバーレイ（ホバー時に表示） */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center group">
            <Upload className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* 説明と削除ボタン */}
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">アバター画像</p>
            <p className="text-xs text-gray-500">
              クリックまたはドラッグ&ドロップで変更
              <br />
              JPEG、PNG、WebP（最大2MB、推奨: 400×400px）
            </p>
          </div>

          {/* 削除ボタン */}
          {hasAvatar && (
            <Button type="button" variant="outline" onClick={handleRemoveAvatar} size="sm">
              <X className="w-4 h-4 mr-2" />
              アバターを削除
            </Button>
          )}
        </div>
      </div>

      {/* エラー表示 */}
      {displayError && <p className="text-sm text-red-600">{displayError}</p>}
    </div>
  );
}
