"use client"

import { CommentModal } from "@/components/comment-modal"
import { GlassCard } from "@/components/ui/glass-card"
import { VerifiedBadge } from "@/components/verified-badge"
import { cn } from "@/lib/cn"
import { fetchJson } from "@/lib/fetch-json"
import Link from "next/link"
import { useState } from "react"

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
export function ExplorePostCard({
  post,
  onWow,
  onSave,
  onRepost,
}: {
  post: ExplorePost
  onWow: (postId: string) => void
  onSave: (postId: string) => void
  onRepost?: () => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState("spam")
  const [reposting, setReposting] = useState(false)
  const profileHref = post.author.username ? `/u/${post.author.username}` : "#"
  async function handleRepost() {
    setReposting(true)
    try {
      await fetchJson("/api/repost", {
        method: "POST",
        body: JSON.stringify({ explorePostId: post.id }),
      })
      onRepost?.()
    } catch {
      /* ignore */
    } finally {
      setReposting(false)
    }
  }
  async function handleReport() {
    try {
      await fetchJson("/api/report", {
        method: "POST",
        body: JSON.stringify({
          targetExplorePostId: post.id,
          targetUserId: post.author.id,
          reason: reportReason,
        }),
      })
      setShowReport(false)
    } catch {
      /* ignore */
    }
  }
  return (
    <GlassCard className="overflow-hidden transition hover:border-white/12">
      {" "}
      <div className="p-5">
        {" "}
        <header className="mb-4 flex items-center gap-3">
          {" "}
          <Link href={profileHref} className="shrink-0">
            {" "}
            {post.author.image ? (
              <img
                src={post.author.image}
                alt={post.author.name}
                className="size-10 rounded-full object-cover ring-2 ring-white/10"
              />
            ) : (
              <div className="from-accent/30 to-accent-secondary/20 text-accent flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold">
                {" "}
                {post.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}{" "}
              </div>
            )}{" "}
          </Link>{" "}
          <div className="min-w-0 flex-1">
            {" "}
            <Link
              href={profileHref}
              className="hover:text-accent flex items-center gap-1.5 font-semibold transition"
            >
              {" "}
              {post.author.name} {post.author.isVerified && <VerifiedBadge />}{" "}
              {post.author.isPremium && (
                <span className="bg-accent/15 text-accent rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                  {" "}
                  Plus{" "}
                </span>
              )}{" "}
            </Link>{" "}
            {post.author.username && (
              <Link
                href={profileHref}
                className="text-muted hover:text-accent text-sm transition"
              >
                {" "}
                @{post.author.username}{" "}
              </Link>
            )}{" "}
          </div>{" "}
          <div className="flex items-center gap-2">
            {" "}
            <time className="text-muted shrink-0 text-xs">
              {" "}
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}{" "}
            </time>{" "}
            <div className="relative">
              {" "}
              <button
                onClick={() => setShowReport(!showReport)}
                className="text-muted rounded-full p-1.5 transition hover:bg-white/5 hover:text-red-400"
                aria-label="Report"
              >
                {" "}
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />{" "}
                </svg>{" "}
              </button>{" "}
              {showReport && (
                <div className="bg-background absolute top-full right-0 z-50 mt-2 w-64 rounded-2xl border border-white/10 p-4 shadow-xl">
                  {" "}
                  <p className="mb-2 text-sm font-semibold">
                    Report this post
                  </p>{" "}
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                  >
                    {" "}
                    <option value="spam">Spam</option>{" "}
                    <option value="harassment">Harassment</option>{" "}
                    <option value="inappropriate">Inappropriate</option>{" "}
                    <option value="hate_speech">Hate speech</option>{" "}
                    <option value="impersonation">Impersonation</option>{" "}
                    <option value="copyright">Copyright</option>{" "}
                    <option value="other">Other</option>{" "}
                  </select>{" "}
                  <div className="flex gap-2">
                    {" "}
                    <button
                      onClick={() => setShowReport(false)}
                      className="text-muted flex-1 rounded-xl py-2 text-sm transition hover:bg-white/5"
                    >
                      {" "}
                      Cancel{" "}
                    </button>{" "}
                    <button
                      onClick={handleReport}
                      className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                    >
                      {" "}
                      Report{" "}
                    </button>{" "}
                  </div>{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </header>{" "}
        {post.imageUrl && (
          <div className="mb-4 overflow-hidden rounded-2xl bg-white/5">
            {" "}
            <img
              src={post.imageUrl}
              alt=""
              className="w-full object-cover"
              style={{ maxHeight: 500 }}
            />{" "}
          </div>
        )}{" "}
        {post.caption && (
          <p className="text-foreground/90 mb-4 text-sm leading-relaxed whitespace-pre-wrap">
            {" "}
            {post.caption}{" "}
          </p>
        )}{" "}
        <footer className="flex items-center gap-2 border-t border-white/5 pt-4">
          {" "}
          <button
            onClick={() => onWow(post.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
              post.hasWowed
                ? "wow-active bg-accent-secondary/10"
                : "text-muted hover:text-accent-secondary hover:bg-white/5",
            )}
          >
            {" "}
            <span className="text-base">
              {post.hasWowed ? "😮" : "😐"}
            </span> Wow{" "}
            {post.wowCount > 0 && (
              <span className="text-xs opacity-80">{post.wowCount}</span>
            )}{" "}
          </button>{" "}
          <button
            onClick={() => setShowComments(true)}
            className="text-muted hover:text-foreground flex items-center gap-2 rounded-full px-4 py-2 text-sm transition hover:bg-white/5"
          >
            {" "}
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />{" "}
            </svg>{" "}
            {post.commentCount}{" "}
          </button>{" "}
          {showComments && (
            <CommentModal
              postId={post.id}
              explore
              onClose={() => {
                setShowComments(false)
              }}
            />
          )}{" "}
          <button
            onClick={handleRepost}
            disabled={reposting}
            className={cn(
              "text-muted hover:text-accent flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/5",
              reposting && "opacity-50",
            )}
          >
            {" "}
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />{" "}
            </svg>{" "}
            Repost{" "}
          </button>{" "}
          <button
            onClick={() => onSave(post.id)}
            className={cn(
              "ml-auto rounded-full p-2 transition",
              post.hasSaved
                ? "text-accent"
                : "text-muted hover:text-accent hover:bg-white/5",
            )}
            aria-label="Save"
          >
            {" "}
            <svg
              className="size-5"
              fill={post.hasSaved ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />{" "}
            </svg>{" "}
          </button>{" "}
        </footer>{" "}
      </div>{" "}
    </GlassCard>
  )
}
