import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import {
  explorePost,
  exploreWow,
  exploreComment,
  exploreSave,
  user,
} from "@/lib/db/schema"
import { uploadImage } from "@/lib/storage"
import { and, count, desc, eq, inArray, sql } from "drizzle-orm"

export async function GET(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50)
  const offset = Number(searchParams.get("offset")) || 0

  const rows = await db
    .select()
    .from(explorePost)
    .orderBy(desc(explorePost.createdAt))
    .limit(limit)
    .offset(offset)

  if (rows.length === 0) return jsonOk({ posts: [] })

  const postIds = rows.map((p) => p.id)
  const authorIds = [...new Set(rows.map((p) => p.authorId))]

  const [authors, wowCounts, commentCounts, userWows, userSaves] =
    await Promise.all([
      db.select().from(user).where(inArray(user.id, authorIds)),
      db
        .select({ postId: exploreWow.postId, count: count() })
        .from(exploreWow)
        .where(inArray(exploreWow.postId, postIds))
        .groupBy(exploreWow.postId),
      db
        .select({ postId: exploreComment.postId, count: count() })
        .from(exploreComment)
        .where(inArray(exploreComment.postId, postIds))
        .groupBy(exploreComment.postId),
      db
        .select({ postId: exploreWow.postId })
        .from(exploreWow)
        .where(
          and(
            eq(exploreWow.userId, session.user.id),
            inArray(exploreWow.postId, postIds),
          ),
        ),
      db
        .select({ postId: exploreSave.postId })
        .from(exploreSave)
        .where(
          and(
            eq(exploreSave.userId, session.user.id),
            inArray(exploreSave.postId, postIds),
          ),
        ),
    ])

  const authorMap = new Map(authors.map((a) => [a.id, a]))
  const wowCountMap = new Map(wowCounts.map((w) => [w.postId, w.count]))
  const commentCountMap = new Map(
    commentCounts.map((c) => [c.postId, c.count]),
  )
  const wowedSet = new Set(userWows.map((w) => w.postId))
  const savedSet = new Set(userSaves.map((s) => s.postId))

  const posts = rows.map((p) => {
    const author = authorMap.get(p.authorId)!
    return {
      id: p.id,
      caption: p.caption,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
      author: {
        id: author.id,
        name: author.name,
        username: author.username,
        image: author.image,
        isVerified: author.isVerified,
        isPremium: author.isPremium,
      },
      wowCount: wowCountMap.get(p.id) ?? 0,
      commentCount: commentCountMap.get(p.id) ?? 0,
      hasWowed: wowedSet.has(p.id),
      hasSaved: savedSet.has(p.id),
    }
  })

  return jsonOk({ posts })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const formData = await request.formData()
  const caption = (formData.get("caption") as string | null)?.trim() ?? ""
  const file = formData.get("image") as File | null

  if (!caption && !file) {
    return jsonError("Post must have a caption or an image")
  }

  if (file && file.size > 0) {
    if (file.size > 10 * 1024 * 1024) {
      return jsonError("Image must be under 10MB")
    }
  }

  const postId = crypto.randomUUID()
  let imageUrl: string | null = null

  if (file && file.size > 0) {
    imageUrl = await uploadImage(file)
  }

  await db.insert(explorePost).values({
    id: postId,
    authorId: session.user.id,
    caption: caption || null,
    imageUrl,
  })

  return jsonOk({ id: postId }, 201)
}
