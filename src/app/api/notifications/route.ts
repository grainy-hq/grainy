import { jsonError, jsonOk } from "@/lib/api/response"
import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db/client"
import { comment, friendRequest, post, user, wow } from "@/lib/db/schema"
import { and, desc, eq, inArray, ne, sql } from "drizzle-orm"

export type NotificationItem = {
  id: string
  type: "friend_request" | "friend_accepted" | "comment" | "wow"
  message: string
  actor: { name: string; username: string | null; image: string | null } | null
  actors?: { name: string; username: string | null; image: string | null }[]
  count?: number
  postId: string | null
  createdAt: string
}

export async function GET(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const since = searchParams.get("since")

  const userId = session.user.id

  const myPostIds = db
    .select({ id: post.id })
    .from(post)
    .where(eq(post.authorId, userId))

  const [pendingRequests, acceptedSent, recentComments, recentWows] =
    await Promise.all([
      db
        .select({
          id: friendRequest.id,
          createdAt: friendRequest.createdAt,
          senderId: friendRequest.senderId,
        })
        .from(friendRequest)
        .where(
          and(
            eq(friendRequest.receiverId, userId),
            eq(friendRequest.status, "pending"),
            since
              ? sql`${friendRequest.createdAt} > ${new Date(since)}`
              : undefined,
          ),
        ),
      db
        .select({
          id: friendRequest.id,
          createdAt: friendRequest.createdAt,
          receiverId: friendRequest.receiverId,
        })
        .from(friendRequest)
        .where(
          and(
            eq(friendRequest.senderId, userId),
            eq(friendRequest.status, "accepted"),
            since
              ? sql`${friendRequest.updatedAt} > ${new Date(since)}`
              : undefined,
          ),
        )
        .orderBy(desc(friendRequest.updatedAt))
        .limit(20),
      db
        .select({
          id: comment.id,
          createdAt: comment.createdAt,
          authorId: comment.authorId,
          postId: comment.postId,
        })
        .from(comment)
        .where(
          and(
            ne(comment.authorId, userId),
            inArray(comment.postId, myPostIds),
            since ? sql`${comment.createdAt} > ${new Date(since)}` : undefined,
          ),
        )
        .orderBy(desc(comment.createdAt))
        .limit(30),
      db
        .select({
          id: wow.id,
          createdAt: wow.createdAt,
          userId: wow.userId,
          postId: wow.postId,
        })
        .from(wow)
        .where(
          and(
            ne(wow.userId, userId),
            inArray(wow.postId, myPostIds),
            since ? sql`${wow.createdAt} > ${new Date(since)}` : undefined,
          ),
        )
        .orderBy(desc(wow.createdAt))
        .limit(30),
    ])

  const actorIds = [
    ...new Set([
      ...pendingRequests.map((r) => r.senderId),
      ...acceptedSent.map((r) => r.receiverId),
      ...recentComments.map((c) => c.authorId),
      ...recentWows.map((w) => w.userId),
    ]),
  ]

  const actors =
    actorIds.length > 0
      ? await db.select().from(user).where(inArray(user.id, actorIds))
      : []

  const actorMap = new Map(actors.map((a) => [a.id, a]))

  function safeDate(d: unknown): string {
    if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString()
    if (typeof d === "string" || typeof d === "number") return String(d)
    return new Date().toISOString()
  }

  const now = new Date().toISOString()

  const notifications: NotificationItem[] = [
    ...pendingRequests.map((r) => ({
      id: `fr_${r.id}`,
      type: "friend_request" as const,
      message: "sent you a friend request",
      actor: mapActor(actorMap.get(r.senderId)),
      postId: null,
      createdAt: safeDate(r.createdAt),
    })),
    ...acceptedSent.map((r) => ({
      id: `fa_${r.id}`,
      type: "friend_accepted" as const,
      message: "accepted your friend request",
      actor: mapActor(actorMap.get(r.receiverId)),
      postId: null,
      createdAt: safeDate(r.createdAt),
    })),
  ]

  const groupedWows = new Map<string, typeof recentWows>()
  for (const w of recentWows) {
    const group = groupedWows.get(w.postId) ?? []
    group.push(w)
    groupedWows.set(w.postId, group)
  }
  for (const [postId, wows] of groupedWows) {
    const uniqueUsers = [...new Map(wows.map((w) => [w.userId, w])).values()]
    const first = uniqueUsers[0]
    notifications.push({
      id: `wo_${postId}`,
      type: "wow" as const,
      message:
        uniqueUsers.length === 1
          ? "wowed your post"
          : `and ${uniqueUsers.length - 1} others wowed your post`,
      actor: mapActor(actorMap.get(first.userId)),
      actors: uniqueUsers
        .slice(0, 3)
        .map((w) => mapActor(actorMap.get(w.userId)))
        .filter(Boolean) as NotificationItem["actors"],
      count: uniqueUsers.length,
      postId,
      createdAt: safeDate(first.createdAt),
    })
  }

  const groupedComments = new Map<string, typeof recentComments>()
  for (const c of recentComments) {
    const group = groupedComments.get(c.postId) ?? []
    group.push(c)
    groupedComments.set(c.postId, group)
  }
  for (const [postId, comments] of groupedComments) {
    const uniqueUsers = [
      ...new Map(comments.map((c) => [c.authorId, c])).values(),
    ]
    const first = uniqueUsers[0]
    notifications.push({
      id: `cm_${postId}`,
      type: "comment" as const,
      message:
        uniqueUsers.length === 1
          ? "commented on your post"
          : `and ${uniqueUsers.length - 1} others commented on your post`,
      actor: mapActor(actorMap.get(first.authorId)),
      actors: uniqueUsers
        .slice(0, 3)
        .map((c) => mapActor(actorMap.get(c.authorId)))
        .filter(Boolean) as NotificationItem["actors"],
      count: uniqueUsers.length,
      postId,
      createdAt: safeDate(first.createdAt),
    })
  }

  notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return jsonOk({ notifications: notifications.slice(0, 30), now })
}

function mapActor(
  actor: typeof user.$inferSelect | undefined,
): NotificationItem["actor"] {
  if (!actor) return null
  return {
    name: actor.name,
    username: actor.username,
    image: actor.image,
  }
}
