import { jsonError, jsonOk } from "@/lib/api/response"
import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db/client"
import { explorePost, post, postImage, repost } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const body = (await request.json()) as { explorePostId?: string }
  const { explorePostId } = body
  if (!explorePostId) return jsonError("explorePostId is required")

  const [existingRepost] = await db
    .select()
    .from(repost)
    .where(
      and(
        eq(repost.explorePostId, explorePostId),
        eq(repost.userId, session.user.id),
      ),
    )
    .limit(1)

  if (existingRepost) {
    return jsonError("Already reposted this", 409)
  }

  const [source] = await db
    .select()
    .from(explorePost)
    .where(eq(explorePost.id, explorePostId))
    .limit(1)

  if (!source) return jsonError("Explore post not found", 404)

  const newPostId = crypto.randomUUID()
  const repostId = crypto.randomUUID()

  await db.insert(post).values({
    id: newPostId,
    authorId: session.user.id,
    caption: source.caption ? `♻️ Repost\n\n${source.caption}` : "♻️ Repost",
  })

  if (source.imageUrl) {
    await db.insert(postImage).values({
      id: crypto.randomUUID(),
      postId: newPostId,
      url: source.imageUrl,
      sortOrder: 0,
    })
  }

  await db.insert(repost).values({
    id: repostId,
    explorePostId,
    userId: session.user.id,
  })

  return jsonOk({ postId: newPostId }, 201)
}
