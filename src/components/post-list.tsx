"use client"

import { PostCard } from "@/components/post-card"
import { GlassCard } from "@/components/ui/glass-card"
import { fetchJson } from "@/lib/fetch-json"
import { useCallback, useRef, useState } from "react"

type FeedPost = {
  id: string
  caption: string | null
  createdAt: string
  author: {
    id: string
    name: string
    username: string | null
    image: string | null
    isVerified: boolean
    isPremium: boolean
  }
  images: { id: string; url: string; sortOrder: number }[]
  wowCount: number
  commentCount: number
  hasWowed: boolean
  hasFavorited: boolean
}
export function PostList({
  initialPosts,
  emptyMessage = "No posts yet",
  feedUrl = "/api/feed",
}: {
  initialPosts: FeedPost[]
  emptyMessage?: string
  feedUrl?: string
}) {
  const [posts, setPosts] = useState(initialPosts)

  const [loading, setLoading] = useState(false)

  const [hasMore, setHasMore] = useState(true)

  const offsetRef = useRef(initialPosts.length)
  const handleWow = useCallback(async (postId: string) => {
    const data = await fetchJson<{ wowed: boolean }>(
      `/api/posts/${postId}/wow`,
      { method: "POST" },
    )
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              hasWowed: data.wowed,
              wowCount: data.wowed ? p.wowCount + 1 : p.wowCount - 1,
            }
          : p,
      ),
    )
  }, [])
  const handleComment = useCallback(async (postId: string) => {
    const data = await fetchJson<{ comments: { id: string }[] }>(
      `/api/posts/${postId}/comments`,
    )
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, commentCount: (data.comments ?? []).length }
          : p,
      ),
    )
  }, [])
  const handleFavorite = useCallback(async (postId: string) => {
    const data = await fetchJson<{ favorited: boolean }>(
      `/api/posts/${postId}/favorite`,
      { method: "POST" },
    )
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, hasFavorited: data.favorited } : p,
      ),
    )
  }, [])
  async function loadMore() {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const data = await fetchJson<{ posts: FeedPost[] }>(
        `${feedUrl}?limit=10&offset=${offsetRef.current}`,
      )
      const newPosts = data.posts ?? []
      if (newPosts.length === 0) {
        setHasMore(false)
      } else {
        setPosts((prev) => [...prev, ...newPosts])
        offsetRef.current += newPosts.length
      }
    } finally {
      setLoading(false)
    }
  }
  if (posts.length === 0) {
    return (
      <GlassCard className="p-10 text-center">
        <p className="text-muted">{emptyMessage}</p>
      </GlassCard>
    )
  }
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onWow={handleWow}
          onFavorite={handleFavorite}
          onComment={handleComment}
        />
      ))}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            disabled={loading}
            className="accent-btn rounded-full px-8 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  )
}
