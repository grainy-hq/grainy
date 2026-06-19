import { PostList } from "@/components/post-list"
import { GlassCard } from "@/components/ui/glass-card"
import { getSession } from "@/lib/auth/session"
import { getFavoritePosts } from "@/lib/feed"
import { redirect } from "next/navigation"

export default async function FavoritesPage() {
  const session = await getSession()
  if (!session?.user) redirect("/sign-up")
  const posts = await getFavoritePosts(session.user.id)
  function safeDate(d: unknown): string {
    if (d instanceof Date && !isNaN(d.getTime())) {
      return d.toISOString()
    }
    if (typeof d === "string" || typeof d === "number") {
      return String(d)
    }
    return new Date().toISOString()
  }
  const serialized = posts.map((p) => ({
    ...p,
    createdAt: safeDate(p.createdAt),
  }))
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          My <span className="gradient-text">Favorites</span>
        </h1>
        <p className="text-muted mt-1 text-sm">Posts you&apos;ve starred</p>
      </div>
      <PostList
        initialPosts={serialized}
        emptyMessage="No favorites yet. Star posts to save them here!"
      />
    </div>
  )
}
