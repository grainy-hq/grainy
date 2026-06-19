import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { exploreSave } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const body = (await request.json()) as { postId?: string }
  const postId = body.postId
  if (!postId) return jsonError("postId is required")

  const [existing] = await db
    .select()
    .from(exploreSave)
    .where(
      and(
        eq(exploreSave.postId, postId),
        eq(exploreSave.userId, session.user.id),
      ),
    )
    .limit(1)

  if (existing) {
    await db.delete(exploreSave).where(eq(exploreSave.id, existing.id))
    return jsonOk({ saved: false })
  }

  await db.insert(exploreSave).values({
    id: crypto.randomUUID(),
    postId,
    userId: session.user.id,
  })

  return jsonOk({ saved: true })
}
