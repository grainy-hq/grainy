import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const [current] = await db
    .select({ isPremium: user.isPremium })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  if (!current?.isPremium) return jsonError("Premium required", 403)

  const body = (await request.json()) as {
    profileBackground?: string | null
  }

  const updates: Record<string, unknown> = {}

  if (body.profileBackground !== undefined) {
    updates.profileBackground = body.profileBackground?.trim() || null
  }

  if (Object.keys(updates).length === 0) {
    return jsonError("No updates provided")
  }

  await db.update(user).set(updates).where(eq(user.id, session.user.id))

  return jsonOk({ saved: true })
}
