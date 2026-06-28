import { jsonError, jsonOk } from "@/lib/api/response"
import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db/client"
import { friendRequest } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params

  const [request_] = await db
    .select()
    .from(friendRequest)
    .where(
      and(
        eq(friendRequest.id, id),
        eq(friendRequest.receiverId, session.user.id),
        eq(friendRequest.status, "pending"),
      ),
    )
    .limit(1)

  if (!request_) return jsonError("Request not found", 404)

  await db
    .update(friendRequest)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(eq(friendRequest.id, id))

  return jsonOk({ accepted: true })
}
