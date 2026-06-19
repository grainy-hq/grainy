import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { getUserPosts } from "@/lib/feed"
import { areFriends } from "@/lib/friends"
import { db } from "@/lib/db/client"
import { friendRequest, post, user } from "@/lib/db/schema"
import { and, count, eq, sql } from "drizzle-orm"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { username } = await params

  const [profile] = await db
    .select()
    .from(user)
    .where(eq(sql`lower(${user.username})`, username.toLowerCase()))
    .limit(1)

  if (!profile?.onboardingComplete) {
    return jsonError("Profile not found", 404)
  }

  const isOwnProfile = profile.id === session.user.id
  const isFriend = await areFriends(session.user.id, profile.id)

  const [postCount] = await db
    .select({ count: count() })
    .from(post)
    .where(eq(post.authorId, profile.id))

  const [followerCount] = await db
    .select({ count: count() })
    .from(friendRequest)
    .where(
      and(
        eq(friendRequest.status, "accepted"),
        eq(friendRequest.receiverId, profile.id),
      ),
    )

  const [followingCount] = await db
    .select({ count: count() })
    .from(friendRequest)
    .where(
      and(
        eq(friendRequest.status, "accepted"),
        eq(friendRequest.senderId, profile.id),
      ),
    )

  let friendshipStatus: "none" | "pending_sent" | "pending_received" | "friends" =
    "none"
  let friendRequestId: string | null = null

  if (!isOwnProfile) {
    if (isFriend) {
      friendshipStatus = "friends"
    } else {
      const [sent] = await db
        .select({ id: friendRequest.id })
        .from(friendRequest)
        .where(
          and(
            eq(friendRequest.senderId, session.user.id),
            eq(friendRequest.receiverId, profile.id),
            eq(friendRequest.status, "pending"),
          ),
        )
        .limit(1)

      if (sent) {
        friendshipStatus = "pending_sent"
        friendRequestId = sent.id
      } else {
        const [received] = await db
          .select({ id: friendRequest.id })
          .from(friendRequest)
          .where(
            and(
              eq(friendRequest.senderId, profile.id),
              eq(friendRequest.receiverId, session.user.id),
              eq(friendRequest.status, "pending"),
            ),
          )
          .limit(1)

        if (received) {
          friendshipStatus = "pending_received"
          friendRequestId = received.id
        }
      }
    }
  }

  const posts = await getUserPosts(
    profile.id,
    session.user.id,
    20,
    0,
  )

  return jsonOk({
    profile: {
      id: profile.id,
      name: profile.name,
      username: profile.username,
      bio: profile.bio,
      location: profile.location,
      image: profile.image,
      isPremium: profile.isPremium,
      profileBackground: profile.profileBackground,
      customTheme: profile.customTheme,
      isVerified: profile.isVerified,
      itunesTrackId: profile.itunesTrackId,
      itunesTrackName: profile.itunesTrackName,
      itunesArtistName: profile.itunesArtistName,
      itunesPreviewUrl: profile.itunesPreviewUrl,
      itunesArtworkUrl: profile.itunesArtworkUrl,
      postCount: postCount?.count ?? 0,
      followerCount: followerCount?.count ?? 0,
      followingCount: followingCount?.count ?? 0,
      isOwnProfile,
      friendshipStatus,
      friendRequestId,
    },
    posts,
  })
}
