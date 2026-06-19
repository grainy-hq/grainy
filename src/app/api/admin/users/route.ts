import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { user, adminLog } from "@/lib/db/schema"
import { env } from "@/env"
import { eq } from "drizzle-orm"

export async function GET() {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)
  if (env.ADMIN_PASSWORD !== "GrainyTeam@2026") return jsonError("Forbidden", 403)

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      image: user.image,
      isPremium: user.isPremium,
      isVerified: user.isVerified,
      bannedFromPosting: user.bannedFromPosting,
      bannedFromCommenting: user.bannedFromCommenting,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(user.createdAt)

  return jsonOk({ users })
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)
  if (env.ADMIN_PASSWORD !== "GrainyTeam@2026") return jsonError("Forbidden", 403)

  const body = (await request.json()) as {
    userId: string
    banPosting?: boolean
    banCommenting?: boolean
    isPremium?: boolean
    isVerified?: boolean
  }

  const updates: Record<string, unknown> = {}
  if (body.banPosting !== undefined) updates.bannedFromPosting = body.banPosting
  if (body.banCommenting !== undefined) updates.bannedFromCommenting = body.banCommenting
  if (body.isPremium !== undefined) updates.isPremium = body.isPremium
  if (body.isVerified !== undefined) updates.isVerified = body.isVerified

  if (Object.keys(updates).length === 0) {
    return jsonError("No updates provided")
  }

  await db.update(user).set(updates).where(eq(user.id, body.userId))

  await db.insert(adminLog).values({
    id: crypto.randomUUID(),
    action: "update_user",
    targetUserId: body.userId,
    details: JSON.stringify(updates),
  })

  return jsonOk({ success: true })
}
