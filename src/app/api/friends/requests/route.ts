import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { friendRequest, user } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function GET() {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const requests = await db
    .select({
      id: friendRequest.id,
      createdAt: friendRequest.createdAt,
      sender: {
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        location: user.location,
        isVerified: user.isVerified,
      },
    })
    .from(friendRequest)
    .innerJoin(user, eq(friendRequest.senderId, user.id))
    .where(
      and(
        eq(friendRequest.receiverId, session.user.id),
        eq(friendRequest.status, "pending"),
      ),
    )
    .orderBy(friendRequest.createdAt)

  return jsonOk({ requests })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const body = (await request.json()) as { userId?: string }
  const receiverId = body.userId

  if (!receiverId) return jsonError("userId is required")
  if (receiverId === session.user.id) {
    return jsonError("You cannot send a friend request to yourself")
  }

  const [target] = await db
    .select()
    .from(user)
    .where(eq(user.id, receiverId))
    .limit(1)

  if (!target?.onboardingComplete) {
    return jsonError("User not found")
  }

  const [existing] = await db
    .select()
    .from(friendRequest)
    .where(
      and(
        eq(friendRequest.senderId, session.user.id),
        eq(friendRequest.receiverId, receiverId),
      ),
    )
    .limit(1)

  if (existing) {
    if (existing.status === "accepted") {
      return jsonError("You are already friends")
    }
    if (existing.status === "pending") {
      return jsonError("Friend request already sent")
    }
    await db
      .update(friendRequest)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(friendRequest.id, existing.id))
    return jsonOk({ id: existing.id }, 201)
  }

  const [reverse] = await db
    .select()
    .from(friendRequest)
    .where(
      and(
        eq(friendRequest.senderId, receiverId),
        eq(friendRequest.receiverId, session.user.id),
        eq(friendRequest.status, "pending"),
      ),
    )
    .limit(1)

  if (reverse) {
    await db
      .update(friendRequest)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(friendRequest.id, reverse.id))
    return jsonOk({ id: reverse.id, autoAccepted: true }, 201)
  }

  const id = crypto.randomUUID()
  await db.insert(friendRequest).values({
    id,
    senderId: session.user.id,
    receiverId,
    status: "pending",
  })

  return jsonOk({ id }, 201)
}
