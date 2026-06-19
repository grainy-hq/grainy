"use client"

import { fetchJson } from "@/lib/fetch-json"
import { useEffect, useRef, useState, type ReactNode } from "react"

type Comment = {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    username: string | null
    image: string | null
    isVerified: boolean
  }
}
export function CommentModal({
  postId,
  onClose,
  explore,
}: {
  postId: string
  onClose: () => void
  explore?: boolean
}): ReactNode {
  const [comments, setComments] = useState<Comment[]>([])

  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const apiPrefix = explore ? "/api/explore" : `/api/posts`
  const commentsUrl = explore
    ? `/api/explore/comment?postId=${postId}`
    : `/api/posts/${postId}/comments`
  useEffect(() => {
    fetchJson<{ comments: Comment[] }>(commentsUrl)
      .then((d) => setComments(d.comments ?? []))
      .catch(() => {})
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [commentsUrl])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)

    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [onClose])
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    try {
      if (explore) {
        const res = await fetch(commentsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, content }),
        })
        if (res.ok) {
          setContent("")
          const data = await fetchJson<{ comments: Comment[] }>(commentsUrl)
          setComments(data.comments ?? [])
        }
      } else {
        const res = await fetch(`/api/posts/${postId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        })
        if (res.ok) {
          setContent("")
          const data = await fetchJson<{ comments: Comment[] }>(
            `/api/posts/${postId}/comments`,
          )
          setComments(data.comments ?? [])
        }
      }
    } catch {
      /* ignore */
    }
    setSubmitting(false)
  }
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        className="border-border bg-card flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-lg border p-4 shadow-xl sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Comments</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-sm transition"
          >
            Close
          </button>
        </div>
        <div className="mb-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-muted py-8 text-center text-sm">
              No comments yet
            </p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="border-border/50 border-b pb-2 text-sm"
              >
                <span className="text-accent font-semibold">
                  {c.author.name}
                </span>
                <span className="text-foreground/80 ml-1.5">{c.content}</span>
              </div>
            ))
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          className="border-border flex gap-2 border-t pt-3"
        >
          <input
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="border-border bg-background focus:border-accent flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="bg-accent shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  )
}
