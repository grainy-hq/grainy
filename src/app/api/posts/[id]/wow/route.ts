import { jsonError, jsonOk } from "@/lib/api/response"
import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db/client"
import { wow } from "@/lib/db/schema"
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
    .from(wow)
    .where(and(eq(wow.postId, postId), eq(wow.userId, session.user.id)))
    .limit(1)

  if (existing) {
    await db.delete(wow).where(eq(wow.id, existing.id))
    return jsonOk({ wowed: false })
  }

  await db.insert(wow).values({
    id: crypto.randomUUID(),
    postId,
    userId: session.user.id,
  })

  return jsonOk({ wowed: true })
}
