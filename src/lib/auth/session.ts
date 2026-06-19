import { auth } from "@/lib/auth"
import { db } from "@/lib/db/client"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireSession() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session?.user) return null

  const [profile] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  return profile ?? null
}
