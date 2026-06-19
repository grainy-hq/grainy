import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { comment, user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id: postId } = await params

  const comments = await db
    .select({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: {
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        isVerified: user.isVerified,
      },
    })
    .from(comment)
    .innerJoin(user, eq(comment.authorId, user.id))
    .where(eq(comment.postId, postId))
    .orderBy(comment.createdAt)

  return jsonOk({ comments })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id: postId } = await params
  const body = (await request.json()) as { content?: string }
  const content = body.content?.trim()

  if (!content) return jsonError("Comment content is required")

  const commentId = crypto.randomUUID()
  await db.insert(comment).values({
    id: commentId,
    postId,
    authorId: session.user.id,
    content,
  })

  return jsonOk({ id: commentId }, 201)
}
