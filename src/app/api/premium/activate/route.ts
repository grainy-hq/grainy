import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const ACTIVATION_CODE = "9023-QWERT"

const attemptMap = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = attemptMap.get(key)
  if (!entry || now > entry.resetAt) {
    attemptMap.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_ATTEMPTS) return false
  entry.count++
  return true
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const body = (await request.json()) as { code?: string }
  const code = body.code?.trim()

  if (!code) return jsonError("Activation code is required", 400)

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    session.user.id

  if (!checkRateLimit(ip)) {
    return jsonError("Too many attempts. Try again later.", 429)
  }

  if (code !== ACTIVATION_CODE) {
    return jsonError("Invalid activation code", 400)
  }

  await db
    .update(user)
    .set({ isPremium: true, isVerified: true })
    .where(eq(user.id, session.user.id))

  return jsonOk({ premium: true })
}
