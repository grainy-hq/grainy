export type ItunesTrack = {
  trackId: number
  trackName: string
  artistName: string
  previewUrl: string
  artworkUrl100: string
}

export async function searchItunesTracks(
  query: string,
): Promise<ItunesTrack[]> {
  const url = new URL("https://itunes.apple.com/search")
  url.searchParams.set("term", query)
  url.searchParams.set("media", "music")
  url.searchParams.set("entity", "song")
  url.searchParams.set("limit", "10")

  const response = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!response.ok) return []

  const data = (await response.json()) as {
    results: Array<{
      trackId: number
      trackName: string
      artistName: string
      previewUrl?: string
      artworkUrl100?: string
    }>
  }

  return data.results
    .filter((r) => r.previewUrl)
    .map((r) => ({
      trackId: r.trackId,
      trackName: r.trackName,
      artistName: r.artistName,
      previewUrl: r.previewUrl!,
      artworkUrl100: r.artworkUrl100 ?? "",
    }))
}
