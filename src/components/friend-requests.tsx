"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { fetchJson } from "@/lib/fetch-json"
import { useEffect, useState } from "react"

type Request = {
  id: string
  createdAt: string
  sender: {
    id: string
    name: string
    username: string | null
    image: string | null
    location: string | null
    isVerified: boolean
  }
}
export function FriendRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  useEffect(() => {
    function fetchRequests() {
      fetchJson<{ requests: Request[] }>("/api/friends/requests")
        .then((d) => setRequests(d.requests ?? []))
        .catch(() => {})
    }
    fetchRequests()
    const interval = setInterval(fetchRequests, 10_000)
    function onVisible() {
      if (document.visibilityState === "visible") fetchRequests()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])
  async function accept(id: string) {
    await fetch(`/api/friends/requests/${id}/accept`, { method: "POST" })
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }
  async function decline(id: string) {
    await fetch(`/api/friends/requests/${id}/decline`, { method: "POST" })
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }
  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Requests</h3>
        {requests.length > 0 && (
          <span className="bg-accent-secondary/20 text-accent-secondary flex size-6 items-center justify-center rounded-full text-xs font-bold">
            {requests.length}
          </span>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/5">
            <svg
              className="text-muted size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <p className="text-muted text-sm">No pending requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
            >
              <div className="flex items-center gap-3">
                {req.sender.image ? (
                  <img
                    src={req.sender.image}
                    alt=""
                    className="size-10 rounded-full object-cover ring-2 ring-white/10"
                  />
                ) : (
                  <div className="from-accent/30 to-accent-secondary/20 text-accent flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold">
                    {req.sender.name[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {req.sender.name}
                  </p>
                  {req.sender.location && (
                    <p className="text-muted truncate text-xs">
                      {req.sender.location}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => accept(req.id)}
                  className="accent-btn flex-1 rounded-full py-2 text-xs font-semibold text-white"
                >
                  Accept
                </button>
                <button
                  onClick={() => decline(req.id)}
                  className="text-muted flex-1 rounded-full border border-white/10 py-2 text-xs font-medium transition hover:bg-white/5"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
