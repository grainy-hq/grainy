"use client"
import { fetchJson } from "@/lib/fetch-json"
import { useEffect, useRef, useState, type ReactNode } from "react";
type Comment = {
id: string;
content: string;
createdAt: string;
author: {
id: string;
name: string;
username: string | null;
image: string | null;
isVerified: boolean;
}}
export function CommentModal({  postId,  onClose,  explore,}: {
postId: string;
onClose: () => void;
  explore?: boolean;
}): ReactNode {
const [comments, setComments] = useState<Comment[]>([])

const [content, setContent] = useState("");
const [submitting, setSubmitting] = useState(false);
const inputRef = useRef<HTMLInputElement>(null)

const apiPrefix = explore ? "/api/explore" : `/api/posts`;
const commentsUrl = explore ? `/api/explore/comment?postId=${postId}` : `/api/posts/${postId}/comments`;
  useEffect(() => {
fetchJson<{ comments: Comment[] }>(commentsUrl)      .then((d) => setComments(d.comments ?? []))      .catch(() => {});
setTimeout(() => inputRef.current?.focus(), 100);
  }, [commentsUrl]);
  useEffect(() => {
const handler = (e: KeyboardEvent) => {
if (e.key === "Escape") onClose();
    }
document.addEventListener("keydown", handler);

document.body.style.overflow = "hidden";
return () => {
document.removeEventListener("keydown", handler);
document.body.style.overflow = "";
    };
  }, [onClose]);
async function handleSubmit(e: React.FormEvent) {
e.preventDefault()
if (!content.trim()) return;
    setSubmitting(true)
try {
if (explore) {
const res = await fetch(commentsUrl, {
method: "POST",          headers: { "Content-Type": "application/json" },          body: JSON.stringify({ postId, content }),        })
if (res.ok) {
setContent("");
const data = await fetchJson<{ comments: Comment[] }>(commentsUrl);
setComments(data.comments ?? [])        }      } else {
const res = await fetch(`/api/posts/${postId}/comments`, {
method: "POST",          headers: { "Content-Type": "application/json" },          body: JSON.stringify({ content }),        })
if (res.ok) {
setContent("");
const data = await fetchJson<{ comments: Comment[] }>(            `/api/posts/${postId}/comments`,          );
setComments(data.comments ?? [])        }      }    } catch {      /* ignore */    }
setSubmitting(false);
  }
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60" onClick={onClose}>
      <div className="flex w-full max-w-lg flex-col rounded-t-lg sm:rounded-lg border border-border bg-card p-4 shadow-xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Comments</h3>
          <button onClick={onClose} className="text-sm text-muted hover:text-foreground transition">Close</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0 mb-3">
          {comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No comments yet</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="border-b border-border/50 pb-2 text-sm">
                <span className="font-semibold text-accent">{c.author.name}</span>
                <span className="ml-1.5 text-foreground/80">{c.content}</span>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border pt-3">
          <input ref={inputRef} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a comment..." className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
          <button type="submit" disabled={submitting || !content.trim()} className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40">Post</button>
        </form>
      </div>
    </div>
  )
}
