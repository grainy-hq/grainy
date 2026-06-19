import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { exploreComment, user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const postId = searchParams.get("postId")
  if (!postId) return jsonError("postId is required")

  const comments = await db
    .select({
      id: exploreComment.id,
      content: exploreComment.content,
      createdAt: exploreComment.createdAt,
      author: {
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
      },
    })
    .from(exploreComment)
    .innerJoin(user, eq(exploreComment.authorId, user.id))
    .where(eq(exploreComment.postId, postId))
    .orderBy(exploreComment.createdAt)

  return jsonOk({ comments })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const body = (await request.json()) as { postId?: string; content?: string }
  const { postId, content } = body

  if (!postId) return jsonError("postId is required")
  if (!content?.trim()) return jsonError("Comment content is required")

  const commentId = crypto.randomUUID()
  await db.insert(exploreComment).values({
    id: commentId,
    postId,
    authorId: session.user.id,
    content: content.trim(),
  })

  return jsonOk({ id: commentId }, 201)
}
