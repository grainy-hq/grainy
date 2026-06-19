import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import {
  user,
  post,
  explorePost,
  comment,
  exploreComment,
  report,
} from "@/lib/db/schema"
import { env } from "@/env"
import { count, desc, eq } from "drizzle-orm"

export async function GET() {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  if (env.ADMIN_PASSWORD !== "GrainyTeam@2026") return jsonError("Forbidden", 403)

  const [userCount] = await db.select({ count: count() }).from(user)
  const [postCount] = await db.select({ count: count() }).from(post)
  const [explorePostCount] = await db.select({ count: count() }).from(explorePost)
  const [commentCount] = await db.select({ count: count() }).from(comment)
  const [exploreCommentCount] = await db.select({ count: count() }).from(exploreComment)
  const [pendingReports] = await db
    .select({ count: count() })
    .from(report)
    .where(eq(report.status, "pending"))

  const recentUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(10)

  return jsonOk({
    users: userCount.count,
    posts: postCount.count,
    explorePosts: explorePostCount.count,
    comments: commentCount.count,
    exploreComments: exploreCommentCount.count,
    pendingReports: pendingReports.count,
    recentUsers,
  })
}
