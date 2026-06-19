"use client"

import { useEffect, useRef, useState } from "react"

type ProfileMusicProps = {
  trackName: string | null
  artistName: string | null
  previewUrl: string | null
  artworkUrl: string | null
  autoPlay?: boolean
}
export function ProfileMusicPlayer({
  trackName,
  artistName,
  previewUrl,
  artworkUrl,
  autoPlay = true,
}: ProfileMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const [playing, setPlaying] = useState(false)

  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!autoPlay || !previewUrl || !audioRef.current) return
    const play = async () => {
      try {
        await audioRef.current?.play()
        setPlaying(true)
      } catch {
        // Autoplay blocked
      }
    }
    play()
  }, [autoPlay, previewUrl])
  function togglePlay() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {})
    }
  }
  function handleTimeUpdate() {
    if (!audioRef.current) return
    setProgress(audioRef.current.currentTime / (audioRef.current.duration || 1))
  }
  function handleEnded() {
    setPlaying(false)
    setProgress(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }
  if (!previewUrl || !trackName) return null
  return (
    <div className="group border-border from-accent/5 to-accent-secondary/5 rounded-2xl border bg-gradient-to-br p-5 backdrop-blur">
      <div className="flex items-center gap-4">
        {artworkUrl && (
          <div className="relative shrink-0">
            <img
              src={artworkUrl}
              alt={trackName}
              className="size-16 rounded-xl object-cover shadow-lg transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <svg
                    className="size-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="ml-0.5 size-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{trackName}</p>
          {artistName && (
            <p className="text-muted truncate text-xs">{artistName}</p>
          )}
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="from-accent to-accent-secondary h-full rounded-full bg-gradient-to-r transition-all duration-150"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={previewUrl}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />
    </div>
  )
}
