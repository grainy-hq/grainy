import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { report, user, adminLog } from "@/lib/db/schema"
import { env } from "@/env"
import { eq } from "drizzle-orm"

export async function GET() {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)
  if (env.ADMIN_PASSWORD !== "GrainyTeam@2026") return jsonError("Forbidden", 403)

  const reports = await db
    .select({
      id: report.id,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt,
      reporter: {
        id: user.id,
        name: user.name,
        username: user.username,
      },
    })
    .from(report)
    .innerJoin(user, eq(report.reporterId, user.id))
    .orderBy(report.createdAt)

  return jsonOk({ reports })
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)
  if (env.ADMIN_PASSWORD !== "GrainyTeam@2026") return jsonError("Forbidden", 403)

  const body = (await request.json()) as {
    reportId: string
    status: "resolved" | "dismissed"
  }

  if (!["resolved", "dismissed"].includes(body.status)) {
    return jsonError("Invalid status")
  }

  await db
    .update(report)
    .set({ status: body.status })
    .where(eq(report.id, body.reportId))

  await db.insert(adminLog).values({
    id: crypto.randomUUID(),
    action: `report_${body.status}`,
    details: `Report ${body.reportId} ${body.status}`,
  })

  return jsonOk({ success: true })
}
