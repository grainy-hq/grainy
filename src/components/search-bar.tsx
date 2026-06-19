"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { fetchJson } from "@/lib/fetch-json"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type SearchUser = {
  id: string
  name: string
  username: string | null
  bio: string | null
  location: string | null
  image: string | null
  isVerified: boolean
}
export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchUser[]>([])

  const [open, setOpen] = useState(false)

  const [focused, setFocused] = useState(false)

  const router = useRouter()
  useEffect(() => {
    if (query.length < 2) return
    const timer = setTimeout(async () => {
      try {
        const data = await fetchJson<{ users: SearchUser[] }>(
          `/api/search?q=${encodeURIComponent(query)}`,
        )
        setResults(data.users ?? [])
        setOpen(true)
      } catch {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])
  const visibleResults = query.length >= 2 ? results : []

  async function sendRequest(userId: string) {
    await fetch("/api/friends/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    setOpen(false)
    setQuery("")
    router.refresh()
  }
  return (
    <div className="relative w-full">
      <GlassCard
        className={`flex items-center gap-3 px-5 py-1 transition-all duration-200 ${
          focused ? "ring-accent/20 ring-2" : ""
        }`}
      >
        <svg
          className="text-muted size-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true)
            if (query.length >= 2) setOpen(true)
          }}
          onBlur={() => setFocused(false)}
          placeholder="Search friends by name, username, or bio..."
          className="placeholder:text-muted/60 flex-1 bg-transparent py-3 text-sm outline-none"
        />
      </GlassCard>

      {open && visibleResults.length > 0 && (
        <GlassCard
          strong
          className="absolute top-full z-50 mt-2 w-full overflow-hidden shadow-2xl shadow-black/40"
        >
          {visibleResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 border-b border-white/5 px-4 py-3 transition last:border-0 hover:bg-white/5"
            >
              <button
                onClick={() => {
                  if (user.username) router.push(`/u/${user.username}`)

                  setOpen(false)
                }}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className="size-10 rounded-full object-cover ring-2 ring-white/10"
                  />
                ) : (
                  <div className="from-accent/30 to-accent-secondary/20 text-accent flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold">
                    {user.name[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="text-muted truncate text-xs">
                    @{user.username}
                    {user.location ? ` · ${user.location}` : ""}
                  </p>
                </div>
              </button>
              <button
                onClick={() => sendRequest(user.id)}
                className="accent-btn shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold text-white"
              >
                Add
              </button>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  )
}
