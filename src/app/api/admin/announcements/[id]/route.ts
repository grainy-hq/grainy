import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { adminAnnouncement } from "@/lib/db/schema"
import { env } from "@/env"
import { eq } from "drizzle-orm"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)
  if (env.ADMIN_PASSWORD !== "GrainyTeam@2026") return jsonError("Forbidden", 403)

  const { id } = await params
  const body = (await request.json()) as { message?: string; active?: boolean }

  const updates: Record<string, unknown> = {}
  if (body.message !== undefined) updates.message = body.message.trim()
  if (body.active !== undefined) updates.active = body.active

  if (Object.keys(updates).length === 0) return jsonError("No updates provided")

  await db.update(adminAnnouncement).set(updates).where(eq(adminAnnouncement.id, id))
  return jsonOk({ success: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)
  if (env.ADMIN_PASSWORD !== "GrainyTeam@2026") return jsonError("Forbidden", 403)

  const { id } = await params
  await db.delete(adminAnnouncement).where(eq(adminAnnouncement.id, id))
  return jsonOk({ success: true })
}
