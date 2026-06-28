"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { GlassCard } from "@/components/ui/glass-card"
import { VerifiedBadge } from "@/components/verified-badge"
import { cn } from "@/lib/cn"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ContactsWidget } from "./contacts-widget"

type SidebarProfile = {
  name: string
  username: string | null
  image: string | null
  location: string | null
  isVerified: boolean
  isPremium: boolean
  postCount: number
  followerCount: number
  followingCount: number
}
function profileNavItem(username: string | null) {
  if (!username) return null
  return {
    href: `/u/${username}`,
    label: "Profile",
    icon: (
      <svg
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  }
}
const navItems = [
  {
    href: "/feed",
    label: "Feed",
    icon: (
      <svg
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: "/explore",
    label: "Explore",
    icon: (
      <svg
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "My favorites",
    icon: (
      <svg
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
  },
  {
    href: "/direct",
    label: "Direct",
    icon: (
      <svg
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
]

export function Sidebar({ profile }: { profile: SidebarProfile }) {
  const pathname = usePathname()

  const allNavItems = [
    ...navItems.slice(0, 1),
    ...(profile.username ? [profileNavItem(profile.username)!] : []),
    ...navItems.slice(1),
  ]

  return (
    <aside className="flex h-full flex-col gap-4">
      <GlassCard className="overflow-hidden">
        <div className="from-accent/25 via-accent-secondary/15 h-16 bg-gradient-to-br to-transparent" />
        <div className="px-5 pb-5">
          <Link
            href={profile.username ? `/u/${profile.username}` : "/settings"}
            className="-mt-8 flex flex-col items-center text-center"
          >
            <div className="gradient-ring rounded-full">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="size-16 rounded-full object-cover ring-4 ring-[#0a0a12]"
                />
              ) : (
                <div className="bg-background gradient-text flex size-16 items-center justify-center rounded-full text-xl font-bold">
                  {profile.name[0]}
                </div>
              )}
            </div>
            <h2 className="mt-3 flex items-center gap-1 text-lg font-bold">
              {profile.name}
              {profile.isVerified && <VerifiedBadge />}
            </h2>
            {profile.location && (
              <p className="text-muted mt-0.5 text-xs">{profile.location}</p>
            )}
          </Link>

          <div className="mt-5 flex justify-center gap-8 text-center">
            {[
              { value: profile.postCount, label: "Posts" },
              { value: formatCount(profile.followerCount), label: "Followers" },
              {
                value: formatCount(profile.followingCount),
                label: "Following",
              },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-muted text-[10px] tracking-wider uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-2">
        <nav>
          {allNavItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "nav-active-glow text-accent"
                    : "text-muted hover:text-foreground hover:bg-white/5",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
          <ThemeToggle className="w-full" />
          {profile.isPremium && (
            <Link
              href="/plus"
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                pathname.startsWith("/plus")
                  ? "nav-active-glow text-accent"
                  : "text-accent hover:bg-accent/10",
              )}
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Plus
            </Link>
          )}
        </nav>
      </GlassCard>

      <ContactsWidget />
    </aside>
  )
}
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
