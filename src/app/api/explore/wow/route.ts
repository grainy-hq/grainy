import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { exploreWow } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const body = (await request.json()) as { postId?: string }
  const postId = body.postId
  if (!postId) return jsonError("postId is required")

  const [existing] = await db
    .select()
    .from(exploreWow)
    .where(
      and(
        eq(exploreWow.postId, postId),
        eq(exploreWow.userId, session.user.id),
      ),
    )
    .limit(1)

  if (existing) {
    await db.delete(exploreWow).where(eq(exploreWow.id, existing.id))
    return jsonOk({ wowed: false })
  }

  await db.insert(exploreWow).values({
    id: crypto.randomUUID(),
    postId,
    userId: session.user.id,
  })

  return jsonOk({ wowed: true })
}
