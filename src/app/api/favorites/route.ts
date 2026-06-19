import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { getFavoritePosts } from "@/lib/feed"

export async function GET(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50)
  const offset = Number(searchParams.get("offset") ?? 0)

  const posts = await getFavoritePosts(session.user.id, limit, offset)
  return jsonOk({ posts })
}
