import { jsonError, jsonOk } from "@/lib/api/response"
import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db/client"
import { favorite } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id: postId } = await params

  const [existing] = await db
    .select()
    .from(favorite)
    .where(
      and(eq(favorite.postId, postId), eq(favorite.userId, session.user.id)),
    )
    .limit(1)

  if (existing) {
    await db.delete(favorite).where(eq(favorite.id, existing.id))
    return jsonOk({ favorited: false })
  }

  await db.insert(favorite).values({
    id: crypto.randomUUID(),
    postId,
    userId: session.user.id,
  })

  return jsonOk({ favorited: true })
}
