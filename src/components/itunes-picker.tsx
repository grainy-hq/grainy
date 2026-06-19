"use client"
import { fetchJson } from "@/lib/fetch-json"
import { useEffect, useRef, useState } from "react";
type ItunesTrack = {
trackId: number;
trackName: string;
artistName: string;
previewUrl: string;
artworkUrl100: string;
}
export function ItunesPicker({  selected,  onSelect,}: {
selected: ItunesTrack | null;
onSelect: (track: ItunesTrack | null) => void;
}) {
const [open, setOpen] = useState(false);
const [query, setQuery] = useState("");
const [tracks, setTracks] = useState<ItunesTrack[]>([])

const [searching, setSearching] = useState(false);
const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
if (!open) {
setQuery("");
setTracks([]);
return;
    }
setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);
  useEffect(() => {
if (query.length < 2 || !open) {
setTracks([]);
return;
    }
setSearching(true)

const timer = setTimeout(async () => {
try {
const data = await fetchJson<{ tracks: ItunesTrack[] }>(          `/api/itunes/search?q=${encodeURIComponent(query)}`,        );
setTracks(data.tracks ?? []);
      } catch {
setTracks([]);
      }
setSearching(false);
    }, 300);
return () => clearTimeout(timer);
  }, [query, open]);
return (    <>      <div className="flex items-center gap-3">        {selected ? (          <div className="flex items-center gap-3 flex-1 min-w-0">            <img src={selected.artworkUrl100} alt="" className="size-10 rounded" />            <div className="min-w-0 flex-1">              <p className="truncate text-sm font-medium">{selected.trackName}</p>              <p className="truncate text-xs text-muted">{selected.artistName}</p>            </div>            <button              type="button"              onClick={() => onSelect(null)}
className="text-xs text-muted hover:text-red-400"            >              Remove            </button>          </div>        ) : (          <p className="text-sm text-muted">No song selected</p>        )}        <button          type="button"          onClick={() => setOpen(true)}
className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-border/50"        >          {selected ? "Change" : "Choose song"}        </button>      </div>      {open && (        <div          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60"          onClick={() => setOpen(false)}        >          <div            className="flex w-full max-w-md flex-col rounded-t-lg sm:rounded-lg border border-border bg-card p-4 shadow-xl max-h-[70vh]"            onClick={(e) => e.stopPropagation()}          >            <div className="mb-3 flex items-center justify-between">              <h4 className="font-semibold">Pick a song</h4>              <button                onClick={() => setOpen(false)}
className="text-sm text-muted hover:text-foreground transition"              >                Close              </button>            </div>            <input              ref={inputRef}
value={query}
onChange={(e) => setQuery(e.target.value)}
placeholder="Search artist or song..."              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"            />            <div className="mt-3 flex-1 overflow-y-auto space-y-1 min-h-0">              {query.length >= 2 && tracks.length === 0 && !searching && (                <p className="py-6 text-center text-sm text-muted">No results</p>              )}              {searching && (                <p className="py-6 text-center text-sm text-muted">Searching...</p>              )}              {tracks.map((t) => (                <button                  key={t.trackId}
type="button"                  onClick={() => {
onSelect(t);
setOpen(false)                  }}
className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-border/50"                >                  <img src={t.artworkUrl100} alt="" className="size-9 rounded" />                  <div className="min-w-0">                    <p className="truncate text-sm font-medium">{t.trackName}</p>                    <p className="truncate text-xs text-muted">{t.artistName}</p>                  </div>                </button>              ))}            </div>          </div>        </div>      )}    </>  )}