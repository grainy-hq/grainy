import { jsonError, jsonOk } from "@/lib/api/response"
import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db/client"
import { friendRequest } from "@/lib/db/schema"
import { and, eq, or } from "drizzle-orm"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const body = (await request.json()) as { userId?: string }
  const otherUserId = body.userId

  if (!otherUserId) return jsonError("userId is required")

  const [existing] = await db
    .select()
    .from(friendRequest)
    .where(
      and(
        eq(friendRequest.status, "accepted"),
        or(
          and(
            eq(friendRequest.senderId, session.user.id),
            eq(friendRequest.receiverId, otherUserId),
          ),
          and(
            eq(friendRequest.senderId, otherUserId),
            eq(friendRequest.receiverId, session.user.id),
          ),
        ),
      ),
    )
    .limit(1)

  if (!existing) {
    return jsonError("Not friends", 404)
  }

  await db
    .update(friendRequest)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(friendRequest.id, existing.id))

  return jsonOk({ removed: true })
}
