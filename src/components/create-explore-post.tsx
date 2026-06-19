"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { useState, useRef } from "react";
export function CreateExplorePost({  onCreated,}: {
onCreated: () => void}) {
const [caption, setCaption] = useState("");
const [file, setFile] = useState<File | null>(null)

const [preview, setPreview] = useState<string | null>(null)

const [open, setOpen] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null)

const fileRef = useRef<HTMLInputElement>(null)
function handleFile(selected: File | null) {
if (!selected) return;
if (selected.size > 10 * 1024 * 1024) {
setError("Image must be under 10MB");
return    }
setFile(selected);
setPreview(URL.createObjectURL(selected));
setError(null)  }
async function handleSubmit(e: React.FormEvent) {
e.preventDefault()
if (!caption.trim() && !file) return;
                setSubmitting(true);
setError(null)

const formData = new FormData()
if (caption.trim() ) formData.set("caption", caption.trim())
if (file) formData.set("image", file)

const res = await fetch("/api/explore", { method: "POST", body: formData })
if (!res.ok) {
const data = (await res.json()) as { error?: string }
setError(data.error ?? "Failed to create post");

setSubmitting(false);
return;
    }
setCaption("");
setFile(null);
setPreview(null);
setOpen(false);
setSubmitting(false);
onCreated();
  }
if (!open) {
return (      <button        onClick={() => setOpen(true)}
className="accent-btn shrink-0 rounded-full px-6 py-3 text-sm font-semibold text-white"      >        <span className="flex items-center gap-2">          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />          </svg>          Post to explore        </span>      </button>    )  }
return (    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">      <GlassCard strong className="w-full max-w-lg">        <form onSubmit={handleSubmit} className="p-6">          <div className="mb-6 flex items-center justify-between">            <h2 className="text-lg font-bold">Post to explore</h2>            <button              type="button"              onClick={() => setOpen(false)}
className="rounded-full p-2 text-muted transition hover:bg-white/5 hover:text-foreground"            >              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />              </svg>            </button>          </div>          {error && (            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">              {error}            </div>          )}          <textarea            value={caption}
onChange={(e) => setCaption(e.target.value)}
placeholder="Caption (optional)"            rows={3}
className="input-field mb-4 w-full resize-none rounded-2xl px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-muted/60"          />          {preview && (            <div className="mb-4 overflow-hidden rounded-2xl bg-white/5">              <img src={preview} alt="" className="w-full object-cover" style={{ maxHeight: 300 }} />            </div>          )}          <input            ref={fileRef}
type="file"            accept="image/jpeg,image/png,image/webp,image/gif"            className="hidden"            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}          />          <div className="flex items-center justify-between gap-3">            <button              type="button"              onClick={() => fileRef.current?.click()}
className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-accent transition hover:bg-accent/10"            >              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />              </svg>              {file ? "Change image" : "Add image (optional)"}            </button>            <button              type="submit"              disabled={submitting}
className="accent-btn rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"            >              {submitting ? "Posting..." : "Share"}            </button>          </div>        </form>      </GlassCard>    </div>  )}