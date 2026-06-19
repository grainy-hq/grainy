import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/

export async function GET() {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const [profile] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  if (!profile) return jsonError("User not found", 404)

  return jsonOk({ profile })
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const body = (await request.json()) as {
    username?: string
    bio?: string
    location?: string
    name?: string
    itunesTrackId?: string | null
    itunesTrackName?: string | null
    itunesArtistName?: string | null
    itunesPreviewUrl?: string | null
    itunesArtworkUrl?: string | null
    completeOnboarding?: boolean
    profileBackground?: string | null
  }

  const updates: Partial<typeof user.$inferInsert> = {}

  if (body.username !== undefined) {
    const username = body.username.toLowerCase().trim()
    if (!USERNAME_REGEX.test(username)) {
      return jsonError(
        "Username must be 3-30 characters, lowercase letters, numbers, and underscores only",
      )
    }

    const [taken] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.username, username))
      .limit(1)

    if (taken && taken.id !== session.user.id) {
      return jsonError("Username is already taken")
    }

    updates.username = username
  }

  if (body.bio !== undefined) {
    updates.bio = body.bio.trim().slice(0, 500) || null
  }

  if (body.location !== undefined) {
    updates.location = body.location.trim().slice(0, 100) || null
  }

  if (body.name !== undefined) {
    updates.name = body.name.trim().slice(0, 100)
  }

  if (body.itunesTrackId !== undefined) {
    updates.itunesTrackId = body.itunesTrackId
    updates.itunesTrackName = body.itunesTrackName ?? null
    updates.itunesArtistName = body.itunesArtistName ?? null
    updates.itunesPreviewUrl = body.itunesPreviewUrl ?? null
    updates.itunesArtworkUrl = body.itunesArtworkUrl ?? null
  }

  if (body.profileBackground !== undefined) {
    updates.profileBackground = body.profileBackground?.trim() || null
  }

  if (body.completeOnboarding) {
    if (!updates.username) {
      const [current] = await db
        .select()
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1)
      if (!current?.username) {
        return jsonError("Username is required to complete onboarding")
      }
    }
    updates.onboardingComplete = true
  }

  if (Object.keys(updates).length === 0) {
    return jsonError("No updates provided")
  }

  await db.update(user).set(updates).where(eq(user.id, session.user.id))

  const [profile] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  return jsonOk({ profile })
}
