"use client"

import { CommentModal } from "@/components/comment-modal"
import { ImageLightbox } from "@/components/image-lightbox"
import { GlassCard } from "@/components/ui/glass-card"
import { VerifiedBadge } from "@/components/verified-badge"
import { cn } from "@/lib/cn"
import Link from "next/link"
import { useState } from "react"

type Author = {
  id: string
  name: string
  username: string | null
  image: string | null
  isVerified: boolean
  isPremium: boolean
}
function Avatar({
  user,
  size = "md",
}: {
  user: Author
  size?: "sm" | "md" | "lg"
}) {
  const sizes = { sm: "size-8", md: "size-10", lg: "size-16" }
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name}
        className={cn(
          sizes[size],
          "rounded-full object-cover ring-2 ring-white/10",
        )}
      />
    )
  }
  return (
    <div
      className={cn(
        sizes[size],
        "from-accent/30 to-accent-secondary/20 text-accent flex items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold",
      )}
    >
      {initials}
    </div>
  )
}
export function PostCard({
  post,
  onWow,
  onFavorite,
  onComment,
}: {
  post: {
    id: string
    caption: string | null
    createdAt: string
    author: Author
    images: { id: string; url: string; sortOrder: number }[]
    wowCount: number
    commentCount: number
    hasWowed: boolean
    hasFavorited: boolean
  }
  onWow: (postId: string) => void
  onFavorite: (postId: string) => void
  onComment?: (postId: string) => void
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const [showComments, setShowComments] = useState(false)

  const profileHref = post.author.username ? `/u/${post.author.username}` : "#"

  return (
    <GlassCard className="overflow-hidden transition hover:border-white/12">
      <div className="p-5">
        <header className="mb-4 flex items-center gap-3">
          <Link href={profileHref} className="shrink-0">
            <Avatar user={post.author} />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={profileHref}
              className="hover:text-accent flex items-center gap-1.5 font-semibold transition"
            >
              {post.author.name}
              {post.author.isVerified && <VerifiedBadge />}
              {post.author.isPremium && (
                <span className="bg-accent/15 text-accent rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                  Plus
                </span>
              )}
            </Link>
            {post.author.username && (
              <Link
                href={profileHref}
                className="text-muted hover:text-accent text-sm transition"
              >
                @{post.author.username}
              </Link>
            )}
          </div>
          <time className="text-muted shrink-0 text-xs">
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </time>
        </header>

        {post.images.length > 0 && (
          <div
            className={cn(
              "mb-4 grid gap-1 overflow-hidden rounded-2xl",
              post.images.length === 1 ? "grid-cols-1" : "grid-cols-2",
            )}
          >
            {post.images.slice(0, 4).map((img, i) => (
              <button
                key={img.id}
                onClick={() => setLightboxIndex(i)}
                className={cn(
                  "relative cursor-pointer overflow-hidden bg-white/5 text-left",
                  post.images.length === 3 && i === 0 && "row-span-2",
                  post.images.length > 1 ? "aspect-square" : "aspect-video",
                )}
              >
                <img src={img.url} alt="" className="size-full object-cover" />
                {i === 3 && post.images.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-2xl font-bold text-white backdrop-blur-sm">
                    +{post.images.length - 4}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {lightboxIndex !== null && (
          <ImageLightbox
            images={post.images}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}

        {post.caption && (
          <p className="text-foreground/90 mb-4 text-sm leading-relaxed whitespace-pre-wrap">
            {post.caption}
          </p>
        )}

        <footer className="flex items-center gap-2 border-t border-white/5 pt-4">
          <button
            onClick={() => onWow(post.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
              post.hasWowed
                ? "wow-active bg-accent-secondary/10"
                : "text-muted hover:text-accent-secondary hover:bg-white/5",
            )}
          >
            <span className="text-base">{post.hasWowed ? "😮" : "😐"}</span>
            Wow
            {post.wowCount > 0 && (
              <span className="text-xs opacity-80">{post.wowCount}</span>
            )}
          </button>

          <button
            onClick={() => setShowComments(true)}
            className="text-muted hover:text-foreground flex items-center gap-2 rounded-full px-4 py-2 text-sm transition hover:bg-white/5"
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {post.commentCount}
          </button>

          {showComments && (
            <CommentModal
              postId={post.id}
              onClose={() => {
                setShowComments(false)
                onComment?.(post.id)
              }}
            />
          )}

          <button
            onClick={() => onFavorite(post.id)}
            className={cn(
              "ml-auto rounded-full p-2 transition",
              post.hasFavorited
                ? "fav-active bg-accent/10"
                : "text-muted hover:text-accent hover:bg-white/5",
            )}
            aria-label="Add to favorites"
          >
            <svg
              className="size-5"
              fill={post.hasFavorited ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </footer>
      </div>
    </GlassCard>
  )
}
