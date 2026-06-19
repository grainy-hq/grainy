import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { user } from "@/lib/db/schema"
import { sql } from "drizzle-orm"

export async function GET(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return jsonError("Search query must be at least 2 characters")
  }

  const pattern = `%${q.toLowerCase()}%`

  const results = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      location: user.location,
      image: user.image,
      isVerified: user.isVerified,
    })
    .from(user)
    .where(
      sql`(
        ${user.onboardingComplete} = true
        AND ${user.id} != ${session.user.id}
        AND (
          lower(${user.username}) LIKE ${pattern}
          OR lower(${user.name}) LIKE ${pattern}
          OR lower(coalesce(${user.bio}, '')) LIKE ${pattern}
        )
      )`,
    )
    .limit(20)

  return jsonOk({ users: results })
}
