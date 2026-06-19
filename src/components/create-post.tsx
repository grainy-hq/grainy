"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react";
export function CreatePost() {
const [caption, setCaption] = useState("");
const [files, setFiles] = useState<File[]>([])

const [previews, setPreviews] = useState<string[]>([])

const [open, setOpen] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null)

const fileRef = useRef<HTMLInputElement>(null)

const router = useRouter()
function handleFiles(selected: FileList | null) {
if (!selected) return;
const newFiles = [...files, ...Array.from(selected)].slice(0, 10);
setFiles(newFiles);
setPreviews(newFiles.map((f) => URL.createObjectURL(f)))  }
async function handleSubmit(e: React.FormEvent) {
e.preventDefault()
if (!caption.trim() && files.length === 0) return;
                setSubmitting(true);
setError(null)

const formData = new FormData()
if (caption.trim() ) formData.set("caption", caption.trim())
for (const file of files) {
formData.append("images", file)    }
const res = await fetch("/api/posts", { method: "POST", body: formData })
if (!res.ok) {
const data = (await res.json()) as { error?: string }
setError(data.error ?? "Failed to create post");

setSubmitting(false);
return;
    }
setCaption("");
setFiles([]);
setPreviews([]);
setOpen(false);
setSubmitting(false);
router.refresh();
  }
if (!open) {
return (      <button        onClick={() => setOpen(true)}
className="accent-btn shrink-0 rounded-full px-6 py-3 text-sm font-semibold text-white"      >        <span className="flex items-center gap-2">          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />          </svg>          Create post        </span>      </button>    )  }
return (    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">      <GlassCard strong className="w-full max-w-lg">        <form onSubmit={handleSubmit} className="p-6">          <div className="mb-6 flex items-center justify-between">            <h2 className="text-lg font-bold">Create post</h2>            <button              type="button"              onClick={() => setOpen(false)}
className="rounded-full p-2 text-muted transition hover:bg-white/5 hover:text-foreground"            >              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />              </svg>            </button>          </div>          {error && (            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">              {error}            </div>          )}          <textarea            value={caption}
onChange={(e) => setCaption(e.target.value)}
placeholder="What's on your mind?"            rows={4}
className="input-field mb-4 w-full resize-none rounded-2xl px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-muted/60"          />          {previews.length > 0 && (            <div className="mb-4 flex flex-wrap gap-2">              {previews.map((src) => (                <img                  key={src}
src={src}
alt=""                  className="size-20 rounded-xl object-cover ring-1 ring-white/10"                />              ))}            </div>          )}          <input            ref={fileRef}
type="file"            accept="image/jpeg,image/png,image/webp,image/gif"            multiple            className="hidden"            onChange={(e) => handleFiles(e.target.files)}          />          <div className="flex items-center justify-between gap-3">            <button              type="button"              onClick={() => fileRef.current?.click()}
className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-accent transition hover:bg-accent/10"            >              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />              </svg>              Add images            </button>            <button              type="submit"              disabled={submitting}
className="accent-btn rounded-full px-6 py-2.5 text-sm font-semibold text-white"            >              {submitting ? "Posting..." : "Share"}            </button>          </div>        </form>      </GlassCard>    </div>  )}