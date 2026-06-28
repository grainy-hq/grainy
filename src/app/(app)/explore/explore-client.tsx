"use client"

import { CreateExplorePost } from "@/components/create-explore-post"
import { ExplorePostCard } from "@/components/explore-post-card"
import { fetchJson } from "@/lib/fetch-json"
import { useEffect, useState } from "react"

type ExplorePost = {
  id: string
  caption: string | null
  imageUrl: string | null
  createdAt: string
  author: {
    id: string
    name: string
    username: string | null
    image: string | null
    isVerified: boolean
    isPremium: boolean
  }
  wowCount: number
  commentCount: number
  hasWowed: boolean
  hasSaved: boolean
}
export function ExploreClient() {
  const [posts, setPosts] = useState<ExplorePost[]>([])

  const [loading, setLoading] = useState(true)

  const [offset, setOffset] = useState(0)

  const [hasMore, setHasMore] = useState(true)
  async function loadPosts(reset = false) {
    const currentOffset = reset ? 0 : offset
    try {
      const data = await fetchJson<{ posts: ExplorePost[] }>(
        `/api/explore?limit=20&offset=${currentOffset}`,
      )
      const newPosts = data.posts ?? []
      if (reset) {
        setPosts(newPosts)
      } else {
        setPosts((prev) => [...prev, ...newPosts])
      }
      setHasMore(newPosts.length === 20)
      setOffset(currentOffset + newPosts.length)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    loadPosts(true)
  }, [])
  async function handleToggleWow(postId: string) {
    try {
      const data = await fetchJson<{ wowed: boolean }>("/api/explore/wow", {
        method: "POST",
        body: JSON.stringify({ postId }),
      })
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                hasWowed: data.wowed,
                wowCount: p.wowCount + (data.wowed ? 1 : -1),
              }
            : p,
        ),
      )
    } catch {
      // ignore
    }
  }
  async function handleToggleSave(postId: string) {
    try {
      const data = await fetchJson<{ saved: boolean }>("/api/explore/save", {
        method: "POST",
        body: JSON.stringify({ postId }),
      })
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, hasSaved: data.saved } : p)),
      )
    } catch {
      // ignore
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
          <p className="text-muted text-sm">
            Discover public posts from the community
          </p>
        </div>
        <CreateExplorePost onCreated={() => loadPosts(true)} />
      </div>

      {loading && posts.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-white/5"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-muted">No explore posts yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <ExplorePostCard
              key={post.id}
              post={post}
              onWow={handleToggleWow}
              onSave={handleToggleSave}
              onRepost={() => loadPosts(true)}
            />
          ))}
          {hasMore && (
            <button
              onClick={() => loadPosts()}
              className="text-muted hover:text-foreground w-full rounded-2xl border border-white/10 py-3 text-sm transition hover:bg-white/5"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  )
}
