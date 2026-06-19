import { db } from "@/lib/db/client"
import {
  comment,
  explorePost,
  exploreWow,
  favorite,
  post,
  postImage,
  user,
  wow,
} from "@/lib/db/schema"
import { getFriendIds } from "@/lib/friends"
import { and, count, desc, eq, inArray } from "drizzle-orm"

export type FeedPost = {
  id: string
  caption: string | null
  createdAt: Date
  author: {
    id: string
    name: string
    username: string | null
    image: string | null
    isVerified: boolean
    isPremium: boolean
  }
  images: { id: string; url: string; sortOrder: number }[]
  wowCount: number
  commentCount: number
  hasWowed: boolean
  hasFavorited: boolean
  isExplorePost?: boolean
}

async function enrichPosts(
  posts: (typeof post.$inferSelect)[],
  currentUserId: string,
): Promise<FeedPost[]> {
  if (posts.length === 0) return []

  const postIds = posts.map((p) => p.id)
  const authorIds = [...new Set(posts.map((p) => p.authorId))]

  const [authors, images, wowCounts, commentCounts, userWows, userFavorites] =
    await Promise.all([
      db.select().from(user).where(inArray(user.id, authorIds)),
      db
        .select()
        .from(postImage)
        .where(inArray(postImage.postId, postIds))
        .orderBy(postImage.sortOrder),
      db
        .select({ postId: wow.postId, count: count() })
        .from(wow)
        .where(inArray(wow.postId, postIds))
        .groupBy(wow.postId),
      db
        .select({ postId: comment.postId, count: count() })
        .from(comment)
        .where(inArray(comment.postId, postIds))
        .groupBy(comment.postId),
      db
        .select({ postId: wow.postId })
        .from(wow)
        .where(
          and(eq(wow.userId, currentUserId), inArray(wow.postId, postIds)),
        ),
      db
        .select({ postId: favorite.postId })
        .from(favorite)
        .where(
          and(
            eq(favorite.userId, currentUserId),
            inArray(favorite.postId, postIds),
          ),
        ),
    ])

  const authorMap = new Map(authors.map((a) => [a.id, a]))
  const wowCountMap = new Map(wowCounts.map((w) => [w.postId, w.count]))
  const commentCountMap = new Map(
    commentCounts.map((c) => [c.postId, c.count]),
  )
  const wowedSet = new Set(userWows.map((w) => w.postId))
  const favoritedSet = new Set(userFavorites.map((f) => f.postId))

  const imagesByPost = new Map<string, typeof images>()
  for (const img of images) {
    const list = imagesByPost.get(img.postId) ?? []
    list.push(img)
    imagesByPost.set(img.postId, list)
  }

  return posts.map((p) => {
    const author = authorMap.get(p.authorId)!
    return {
      id: p.id,
      caption: p.caption,
      createdAt: p.createdAt,
      author: {
        id: author.id,
        name: author.name,
        username: author.username,
        image: author.image,
        isVerified: author.isVerified,
        isPremium: author.isPremium,
      },
      images: (imagesByPost.get(p.id) ?? []).map((img) => ({
        id: img.id,
        url: img.url,
        sortOrder: img.sortOrder,
      })),
      wowCount: wowCountMap.get(p.id) ?? 0,
      commentCount: commentCountMap.get(p.id) ?? 0,
      hasWowed: wowedSet.has(p.id),
      hasFavorited: favoritedSet.has(p.id),
    }
  })
}

export async function getFeed(
  userId: string,
  limit = 20,
  offset = 0,
): Promise<FeedPost[]> {
  const friendIds = await getFriendIds(userId)
  const visibleIds = [userId, ...friendIds]

  const friendLimit = offset === 0 ? Math.ceil(limit * 0.9) : limit
  const exploreLimit = offset === 0 ? Math.floor(limit * 0.1) : 0

  const rows = await db
    .select()
    .from(post)
    .where(inArray(post.authorId, visibleIds))
    .orderBy(desc(post.createdAt))
    .limit(friendLimit)
    .offset(offset)

  let posts = await enrichPosts(rows, userId)

  if (exploreLimit > 0) {
    const exploreRows = await db
      .select()
      .from(explorePost)
      .orderBy(desc(explorePost.createdAt))
      .limit(exploreLimit)

    if (exploreRows.length > 0) {
      const explorePostIds = exploreRows.map((p) => p.id)
      const exploreAuthorIds = [
        ...new Set(exploreRows.map((p) => p.authorId)),
      ]

      const [exploreAuthors, exploreWowCounts, exploreUserWows] =
        await Promise.all([
          db.select().from(user).where(inArray(user.id, exploreAuthorIds)),
          db
            .select({ postId: exploreWow.postId, count: count() })
            .from(exploreWow)
            .where(inArray(exploreWow.postId, explorePostIds))
            .groupBy(exploreWow.postId),
          db
            .select({ postId: exploreWow.postId })
            .from(exploreWow)
            .where(
              and(
                eq(exploreWow.userId, userId),
                inArray(exploreWow.postId, explorePostIds),
              ),
            ),
        ])

      const exploreAuthorMap = new Map(
        exploreAuthors.map((a) => [a.id, a]),
      )
      const exploreWowMap = new Map(
        exploreWowCounts.map((w) => [w.postId, w.count]),
      )
      const exploreWowedSet = new Set(
        exploreUserWows.map((w) => w.postId),
      )

      const exploreFeedPosts: FeedPost[] = exploreRows.map((p) => {
        const author = exploreAuthorMap.get(p.authorId)!
        return {
          id: p.id,
          caption: p.caption,
          createdAt: p.createdAt,
          author: {
            id: author.id,
            name: author.name,
            username: author.username,
            image: author.image,
            isVerified: author.isVerified,
            isPremium: author.isPremium,
          },
          images: p.imageUrl
            ? [{ id: "explore-img", url: p.imageUrl, sortOrder: 0 }]
            : [],
          wowCount: exploreWowMap.get(p.id) ?? 0,
          commentCount: 0,
          hasWowed: exploreWowedSet.has(p.id),
          hasFavorited: false,
          isExplorePost: true,
        }
      })

      posts = [...posts, ...exploreFeedPosts].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    }
  }

  return posts
}

export async function getUserPosts(
  authorId: string,
  currentUserId: string,
  limit = 20,
  offset = 0,
): Promise<FeedPost[]> {
  const rows = await db
    .select()
    .from(post)
    .where(eq(post.authorId, authorId))
    .orderBy(desc(post.createdAt))
    .limit(limit)
    .offset(offset)

  return enrichPosts(rows, currentUserId)
}

export async function getFavoritePosts(
  userId: string,
  limit = 20,
  offset = 0,
): Promise<FeedPost[]> {
  const favorites = await db
    .select({ postId: favorite.postId })
    .from(favorite)
    .where(eq(favorite.userId, userId))
    .orderBy(desc(favorite.createdAt))
    .limit(limit)
    .offset(offset)

  if (favorites.length === 0) return []

  const postIds = favorites.map((f) => f.postId)
  const rows = await db
    .select()
    .from(post)
    .where(inArray(post.id, postIds))
    .orderBy(desc(post.createdAt))

  return enrichPosts(rows, userId)
}
