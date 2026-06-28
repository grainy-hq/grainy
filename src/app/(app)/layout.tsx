import { AnnouncementBanner } from "@/components/announcement-banner"
import { FriendRequests } from "@/components/friend-requests"
import { MobileNav } from "@/components/mobile-nav"
import { NotificationsWidget } from "@/components/notifications-widget"
import { Sidebar } from "@/components/sidebar"
import { AmbientBackground } from "@/components/ui/ambient-background"
import { getCurrentUser } from "@/lib/auth/session"
import { db } from "@/lib/db/client"
import { friendRequest, post } from "@/lib/db/schema"
import { and, count, eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/sign-up")
  }
  if (!user.onboardingComplete) {
    redirect("/onboarding")
  }
  const [postCount] = await db
    .select({ count: count() })
    .from(post)
    .where(eq(post.authorId, user.id))
  const [followerCount] = await db
    .select({ count: count() })
    .from(friendRequest)
    .where(
      and(
        eq(friendRequest.status, "accepted"),
        eq(friendRequest.receiverId, user.id),
      ),
    )
  const [followingCount] = await db
    .select({ count: count() })
    .from(friendRequest)
    .where(
      and(
        eq(friendRequest.status, "accepted"),
        eq(friendRequest.senderId, user.id),
      ),
    )
  const profile = {
    name: user.name,
    username: user.username,
    image: user.image,
    location: user.location,
    isVerified: user.isVerified,
    isPremium: user.isPremium ?? false,
    postCount: postCount?.count ?? 0,
    followerCount: followerCount?.count ?? 0,
    followingCount: followingCount?.count ?? 0,
  }
  return (
    <div className="bg-background relative min-h-screen">
      <AnnouncementBanner />
      <AmbientBackground />
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 lg:grid-cols-[280px_1fr_300px] lg:p-6">
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar profile={profile} />
          </div>
        </div>

        <main className="min-w-0 pb-20 lg:pb-0">{children}</main>

        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <FriendRequests />
            <NotificationsWidget />
            <footer className="text-muted px-2 text-xs">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <span className="hover:text-foreground cursor-pointer transition">
                  About
                </span>
                <span className="hover:text-foreground cursor-pointer transition">
                  Help
                </span>
                <span className="hover:text-foreground cursor-pointer transition">
                  Privacy
                </span>
                <span className="hover:text-foreground cursor-pointer transition">
                  Terms
                </span>
              </div>
              <p className="mt-2 opacity-60">&copy; 2026 Grainy Life</p>
            </footer>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}
