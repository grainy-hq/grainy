"use client"

import { useCallback, useEffect } from "react"

export function ImageLightbox({
  images,
  index,
  onClose,
}: {
  images: { id: string; url: string }[]
  index: number
  onClose: () => void
}) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose],
  )
  useEffect(() => {
    document.addEventListener("keydown", handleKey)

    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [handleKey])
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {" "}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Close"
      >
        {" "}
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {" "}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />{" "}
        </svg>{" "}
      </button>{" "}
      <img
        src={images[index]?.url}
        alt=""
        className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />{" "}
    </div>
  )
}
