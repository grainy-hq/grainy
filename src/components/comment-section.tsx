"use client"

import { fetchJson } from "@/lib/fetch-json"
import { useState } from "react"

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
export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([])

  const [loaded, setLoaded] = useState(false)
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  async function loadComments() {
    if (loaded) return
    const data = await fetchJson<{ comments: Comment[] }>(
      `/api/posts/${postId}/comments`,
    )
    setComments(data.comments ?? [])
    setLoaded(true)
  }
  async function handleToggle() {
    const next = !open
    setOpen(next)
    if (next) {
      await loadComments()
    }
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
    if (res.ok) {
      setContent("")
      setLoaded(false)
      await loadComments()
    }
    setSubmitting(false)
  }
  return (
    <div className="mt-2 px-1">
      {" "}
      <button
        onClick={handleToggle}
        className="text-muted hover:text-accent text-xs font-medium transition"
      >
        {" "}
        {open ? "Hide comments" : "View comments"}{" "}
      </button>{" "}
      {open && (
        <div className="mt-3 space-y-3">
          {" "}
          <form onSubmit={handleSubmit} className="flex gap-2">
            {" "}
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              className="input-field placeholder:text-muted/60 flex-1 rounded-full px-4 py-2 text-sm outline-none"
            />{" "}
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="accent-btn rounded-full px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {" "}
              Post{" "}
            </button>{" "}
          </form>{" "}
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-xl bg-white/[0.03] px-3 py-2 text-sm"
            >
              {" "}
              <span className="text-accent font-semibold">
                {c.author.name}
              </span>{" "}
              <span className="text-foreground/80 ml-2">{c.content}</span>{" "}
            </div>
          ))}{" "}
        </div>
      )}{" "}
    </div>
  )
}
