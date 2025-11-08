"use client";

import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  onImageClick?: (index: number) => void;
}

export function ImageGallery({ images, onImageClick }: ImageGalleryProps) {
  if (!images || images.length === 0) {
    return null;
  }

  // 1枚の場合: フル幅表示
  if (images.length === 1) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg">
        <div className="relative aspect-video w-full h-96 cursor-pointer" onClick={() => onImageClick?.(0)}>
          <Image
            src={images[0]}
            alt="投稿画像"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
    );
  }

  // 2枚以上: 均等グリッド (2列)
  return (
    <div className="grid grid-cols-2 gap-2">
      {images.map((image, index) => (
        <div
          key={index}
          className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
          onClick={() => onImageClick?.(index)}
        >
          <Image
            src={image}
            alt={`投稿画像 ${index + 1}`}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
          />
        </div>
      ))}
    </div>
  );
}
