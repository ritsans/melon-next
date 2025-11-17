"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      offset="24px"
      duration={5000}
      closeButton={false}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "bg-white shadow-lg rounded-lg p-4 flex items-center gap-3 border",
          success: "bg-green-50 border-green-100 text-green-700",
          error: "bg-red-50 border-red-100 text-red-700",
        },
      }}
    />
  );
}
