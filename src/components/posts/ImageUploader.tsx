"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validateImage } from "@/lib/image-utils.client";

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  error?: string;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 4,
  error,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
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
    handleFiles(files);
  };

  // ファイル選択
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  // ファイル処理共通ロジック
  const handleFiles = (newFiles: File[]) => {
    setValidationError("");

    // 画像形式のファイルのみフィルタ
    const imageFiles = newFiles.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      setValidationError("画像ファイルを選択してください");
      return;
    }

    // 最大枚数チェック
    const remainingSlots = maxImages - images.length;
    if (imageFiles.length > remainingSlots) {
      setValidationError(`画像は最大${maxImages}枚までアップロード可能です`);
      return;
    }

    // 各ファイルのバリデーション
    for (const file of imageFiles) {
      const validation = validateImage(file);
      if (!validation.valid) {
        setValidationError(validation.error || "画像のバリデーションに失敗しました");
        return;
      }
    }

    // 画像を追加
    onImagesChange([...images, ...imageFiles]);
  };

  // 画像削除
  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setValidationError("");
  };

  // ファイル選択ダイアログを開く
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  // 画像の並び替え - ドラッグ開始
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // 画像の並び替え - ドラッグオーバー
  const handleReorderDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];

    // 配列から削除して新しい位置に挿入
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    onImagesChange(newImages);
    setDraggedIndex(index);
  };

  // 画像の並び替え - ドラッグ終了
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // 画像プレビューURL生成
  const getPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const displayError = error || validationError;

  return (
    <div className="space-y-3">
      {/* アップロードエリア */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickUpload}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary/50 hover:bg-gray-50",
            displayError && "border-red-300",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              {isDragging ? (
                <ImageIcon className="w-6 h-6 text-primary" />
              ) : (
                <Upload className="w-6 h-6 text-gray-500" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? "ドロップして画像をアップロード" : "クリックまたはドラッグ&ドロップ"}
              </p>
              <p className="text-xs text-gray-500">
                JPEG、PNG、GIF、WebP（最大5MB、{maxImages}枚まで）
              </p>
            </div>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {displayError && (
        <p className="text-sm text-red-600">{displayError}</p>
      )}

      {/* 画像プレビュー */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleReorderDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border-2 cursor-move transition-opacity",
                draggedIndex === index ? "opacity-50" : "opacity-100",
                "hover:border-primary",
              )}
            >
              <Image
                src={getPreviewUrl(file)}
                alt={`プレビュー ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* 削除ボタン */}
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                className="absolute top-2 right-2 shadow-md"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* 画像番号 */}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {index + 1} / {images.length}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 画像枚数表示 */}
      {images.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          {images.length} / {maxImages}枚選択中
          {images.length < maxImages && " （ドラッグで並び替え可能）"}
        </p>
      )}
    </div>
  );
}
