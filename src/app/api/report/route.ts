import { jsonError, jsonOk } from "@/lib/api/response"
import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db/client"
import { report } from "@/lib/db/schema"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const body = (await request.json()) as {
    targetUserId?: string
    targetPostId?: string
    targetExplorePostId?: string
    reason: string
  }

  const { targetUserId, targetPostId, targetExplorePostId, reason } = body

  if (!targetUserId && !targetPostId && !targetExplorePostId) {
    return jsonError("Must specify at least one target")
  }

  if (!reason?.trim()) {
    return jsonError("Reason is required")
  }

  const validReasons = [
    "spam",
    "harassment",
    "inappropriate",
    "hate_speech",
    "impersonation",
    "copyright",
    "other",
  ]
  if (!validReasons.includes(reason)) {
    return jsonError("Invalid reason")
  }

  await db.insert(report).values({
    id: crypto.randomUUID(),
    reporterId: session.user.id,
    targetUserId: targetUserId || null,
    targetPostId: targetPostId || null,
    targetExplorePostId: targetExplorePostId || null,
    reason,
  })

  return jsonOk({ success: true }, 201)
}
