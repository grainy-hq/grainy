"use client"

import { fetchJson } from "@/lib/fetch-json"
import { useEffect, useState } from "react";
export function AnnouncementBanner() {
const [message, setMessage] = useState<string | null>(null);
useEffect(() => {
function fetchActive() {
fetchJson<{ announcement: { message: string } | null }>("/api/admin/announcements/active")
        .then((d) => setMessage(d.announcement?.message ?? null))
        .catch(() => {})
    }
fetchActive();
const interval = setInterval(fetchActive, 30_000);
return () => clearInterval(interval)
  }, []);
if (!message) return null

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-accent/90 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm">
      <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
      <span className="truncate">{message}</span>
    </div>
  )
}
