"use client"

import { fetchJson } from "@/lib/fetch-json"
import { useEffect, useRef, useState } from "react"

type ItunesTrack = {
  trackId: number
  trackName: string
  artistName: string
  previewUrl: string
  artworkUrl100: string
}
export function ItunesPicker({
  selected,
  onSelect,
}: {
  selected: ItunesTrack | null
  onSelect: (track: ItunesTrack | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [tracks, setTracks] = useState<ItunesTrack[]>([])

  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!open) {
      setQuery("")
      setTracks([])
      return
    }
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])
  useEffect(() => {
    if (query.length < 2 || !open) {
      setTracks([])
      return
    }
    setSearching(true)

    const timer = setTimeout(async () => {
      try {
        const data = await fetchJson<{ tracks: ItunesTrack[] }>(
          `/api/itunes/search?q=${encodeURIComponent(query)}`,
        )
        setTracks(data.tracks ?? [])
      } catch {
        setTracks([])
      }
      setSearching(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, open])
  return (
    <>
      {" "}
      <div className="flex items-center gap-3">
        {" "}
        {selected ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {" "}
            <img
              src={selected.artworkUrl100}
              alt=""
              className="size-10 rounded"
            />{" "}
            <div className="min-w-0 flex-1">
              {" "}
              <p className="truncate text-sm font-medium">
                {selected.trackName}
              </p>{" "}
              <p className="text-muted truncate text-xs">
                {selected.artistName}
              </p>{" "}
            </div>{" "}
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-muted text-xs hover:text-red-400"
            >
              {" "}
              Remove{" "}
            </button>{" "}
          </div>
        ) : (
          <p className="text-muted text-sm">No song selected</p>
        )}{" "}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border-border hover:bg-border/50 shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition"
        >
          {" "}
          {selected ? "Change" : "Choose song"}{" "}
        </button>{" "}
      </div>{" "}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => setOpen(false)}
        >
          {" "}
          <div
            className="border-border bg-card flex max-h-[70vh] w-full max-w-md flex-col rounded-t-lg border p-4 shadow-xl sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="mb-3 flex items-center justify-between">
              {" "}
              <h4 className="font-semibold">Pick a song</h4>{" "}
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground text-sm transition"
              >
                {" "}
                Close{" "}
              </button>{" "}
            </div>{" "}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artist or song..."
              className="border-border bg-background focus:border-accent w-full rounded-lg border px-3 py-2 text-sm outline-none"
            />{" "}
            <div className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto">
              {" "}
              {query.length >= 2 && tracks.length === 0 && !searching && (
                <p className="text-muted py-6 text-center text-sm">
                  No results
                </p>
              )}{" "}
              {searching && (
                <p className="text-muted py-6 text-center text-sm">
                  Searching...
                </p>
              )}{" "}
              {tracks.map((t) => (
                <button
                  key={t.trackId}
                  type="button"
                  onClick={() => {
                    onSelect(t)
                    setOpen(false)
                  }}
                  className="hover:bg-border/50 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition"
                >
                  {" "}
                  <img
                    src={t.artworkUrl100}
                    alt=""
                    className="size-9 rounded"
                  />{" "}
                  <div className="min-w-0">
                    {" "}
                    <p className="truncate text-sm font-medium">
                      {t.trackName}
                    </p>{" "}
                    <p className="text-muted truncate text-xs">
                      {t.artistName}
                    </p>{" "}
                  </div>{" "}
                </button>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </>
  )
}
