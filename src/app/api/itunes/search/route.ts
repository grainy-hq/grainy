import { jsonError, jsonOk } from "@/lib/api/response"
import { getSession } from "@/lib/auth/session"
import { searchItunesTracks } from "@/lib/itunes"

export async function GET(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return jsonError("Search query must be at least 2 characters")
  }

  const tracks = await searchItunesTracks(q)
  return jsonOk({ tracks })
}
