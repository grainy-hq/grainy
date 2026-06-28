import { db } from "@/lib/db/client"
import { friendRequest } from "@/lib/db/schema"
import { and, eq, or } from "drizzle-orm"

export async function getFriendIds(userId: string): Promise<string[]> {
  const friendships = await db
    .select()
    .from(friendRequest)
    .where(
      and(
        eq(friendRequest.status, "accepted"),
        or(
          eq(friendRequest.senderId, userId),
          eq(friendRequest.receiverId, userId),
        ),
      ),
    )

  return friendships.map((f) =>
    f.senderId === userId ? f.receiverId : f.senderId,
  )
}

export async function areFriends(
  userId: string,
  otherUserId: string,
): Promise<boolean> {
  const [row] = await db
    .select()
    .from(friendRequest)
    .where(
      and(
        eq(friendRequest.status, "accepted"),
        or(
          and(
            eq(friendRequest.senderId, userId),
            eq(friendRequest.receiverId, otherUserId),
          ),
          and(
            eq(friendRequest.senderId, otherUserId),
            eq(friendRequest.receiverId, userId),
          ),
        ),
      ),
    )
    .limit(1)

  return !!row
}
