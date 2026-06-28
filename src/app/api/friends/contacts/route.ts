import { jsonError, jsonOk } from "@/lib/api/response"
import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db/client"
import { friendRequest, user } from "@/lib/db/schema"
import { getFriendIds } from "@/lib/friends"
import { eq, inArray } from "drizzle-orm"

export async function GET() {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const friendIds = await getFriendIds(session.user.id)

  if (friendIds.length === 0) {
    return jsonOk({ contacts: [] })
  }

  const contacts = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      location: user.location,
      isVerified: user.isVerified,
    })
    .from(user)
    .where(inArray(user.id, friendIds))
    .limit(20)

  return jsonOk({ contacts })
}
