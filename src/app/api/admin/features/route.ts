import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { featureToggle } from "@/lib/db/schema"
import { env } from "@/env"
import { eq } from "drizzle-orm"

export async function GET() {
  const features = await db.select().from(featureToggle).orderBy(featureToggle.featureKey)
  return jsonOk({ features })
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)
  if (env.ADMIN_PASSWORD !== "GrainyTeam@2026") return jsonError("Forbidden", 403)

  const body = (await request.json()) as {
    featureKey: string
    enabled: boolean
  }

  if (!body.featureKey) return jsonError("featureKey is required")

  await db
    .update(featureToggle)
    .set({ enabled: body.enabled, updatedAt: new Date() })
    .where(eq(featureToggle.featureKey, body.featureKey))

  return jsonOk({ success: true })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)
  if (env.ADMIN_PASSWORD !== "GrainyTeam@2026") return jsonError("Forbidden", 403)

  const body = (await request.json()) as {
    featureKey: string
    enabled?: boolean
    description?: string
  }

  if (!body.featureKey?.trim()) return jsonError("featureKey is required")

  const id = crypto.randomUUID()
  await db.insert(featureToggle).values({
    id,
    featureKey: body.featureKey.trim(),
    enabled: body.enabled ?? true,
    description: body.description ?? null,
  })

  return jsonOk({ id }, 201)
}
