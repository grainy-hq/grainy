import { env } from "@/env"
import { jsonError, jsonOk } from "@/lib/api/response"
import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db/client"
import {
  comment,
  exploreComment,
  explorePost,
  exploreWow,
  post,
  user,
  wow,
} from "@/lib/db/schema"
import { count, gte, sql } from "drizzle-orm"

export async function GET() {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)
  if (env.ADMIN_PASSWORD !== "GrainyTeam@2026")
    return jsonError("Forbidden", 403)

  const days = 30
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const dailyUsers = await db
    .select({
      date: sql<string>`DATE(${user.createdAt})`,
      count: count(),
    })
    .from(user)
    .where(gte(user.createdAt, since))
    .groupBy(sql`DATE(${user.createdAt})`)
    .orderBy(sql`DATE(${user.createdAt})`)

  const dailyPosts = await db
    .select({
      date: sql<string>`DATE(${post.createdAt})`,
      count: count(),
    })
    .from(post)
    .where(gte(post.createdAt, since))
    .groupBy(sql`DATE(${post.createdAt})`)
    .orderBy(sql`DATE(${post.createdAt})`)

  const dailyExplorePosts = await db
    .select({
      date: sql<string>`DATE(${explorePost.createdAt})`,
      count: count(),
    })
    .from(explorePost)
    .where(gte(explorePost.createdAt, since))
    .groupBy(sql`DATE(${explorePost.createdAt})`)
    .orderBy(sql`DATE(${explorePost.createdAt})`)

  const dailyComments = await db
    .select({
      date: sql<string>`DATE(${comment.createdAt})`,
      count: count(),
    })
    .from(comment)
    .where(gte(comment.createdAt, since))
    .groupBy(sql`DATE(${comment.createdAt})`)
    .orderBy(sql`DATE(${comment.createdAt})`)

  const dailyExploreComments = await db
    .select({
      date: sql<string>`DATE(${exploreComment.createdAt})`,
      count: count(),
    })
    .from(exploreComment)
    .where(gte(exploreComment.createdAt, since))
    .groupBy(sql`DATE(${exploreComment.createdAt})`)
    .orderBy(sql`DATE(${exploreComment.createdAt})`)

  const dailyWows = await db
    .select({
      date: sql<string>`DATE(${wow.createdAt})`,
      count: count(),
    })
    .from(wow)
    .where(gte(wow.createdAt, since))
    .groupBy(sql`DATE(${wow.createdAt})`)
    .orderBy(sql`DATE(${wow.createdAt})`)

  const dailyExploreWows = await db
    .select({
      date: sql<string>`DATE(${exploreWow.createdAt})`,
      count: count(),
    })
    .from(exploreWow)
    .where(gte(exploreWow.createdAt, since))
    .groupBy(sql`DATE(${exploreWow.createdAt})`)
    .orderBy(sql`DATE(${exploreWow.createdAt})`)

  return jsonOk({
    dailyUsers,
    dailyPosts,
    dailyExplorePosts,
    dailyComments,
    dailyExploreComments,
    dailyWows,
    dailyExploreWows,
  })
}
