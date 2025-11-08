"use client";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { ReactElement } from "react";

interface ImageLightboxProps {
  open: boolean;
  close: () => void;
  images: string[];
  index: number;
}

export function ImageLightbox({ open, close, images, index }: ImageLightboxProps): ReactElement {
  const slides = images.map((src) => ({
    src,
  }));

  return (
    <Lightbox
      open={open}
      close={close}
      slides={slides}
      index={index}
      styles={{
        // change backgroundColor for this code!
        container: { backgroundColor: "rgba(20, 20, 20, 0.8)" },
      }}
    />
  );
}
