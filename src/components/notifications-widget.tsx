"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { fetchJson } from "@/lib/fetch-json"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react";
type NotificationItem = {
id: string;
type: "friend_request" | "friend_accepted" | "comment" | "wow"
  message: string
  actor: { name: string; username: string | null; image: string | null } | null
  actors?: { name: string; username: string | null; image: string | null }[]
  count?: number;
postId: string | null
  createdAt: string
}
function getLastSeen(): string | null {
if (typeof window === "undefined") return null
  return localStorage.getItem("notificationLastSeen")
}
function setLastSeen(time: string) {
if (typeof window !== "undefined") {
localStorage.setItem("notificationLastSeen", time)
  }
}
export function NotificationsWidget() {
const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const [unseenCount, setUnseenCount] = useState(0)

  const latestIdRef = useRef<string | null>(null);
const fetchNotifications = useCallback(() => {
const since = getLastSeen();
const url = since ? `/api/notifications?since=${encodeURIComponent(since)}` : "/api/notifications"
    fetchJson<{ notifications: NotificationItem[]; now?: string }>(url)
      .then((d) => {
const items = d.notifications ?? []
        if (items.length > 0) {
setNotifications((prev) => {
const existingIds = new Set(prev.map((n) => n.id));
const newOnes = items.filter((n) => !existingIds.has(n.id));
if (newOnes.length === 0) return prev
            setUnseenCount((c) => c + newOnes.length);
return [...newOnes, ...prev].slice(0, 30)
          });
if (d.now) latestIdRef.current = d.now
        }
      })
      .catch(() => {})
  }, []);

useEffect(() => {
fetchNotifications();
const interval = setInterval(fetchNotifications, 10_000);
function onVisible() {
if (document.visibilityState === "visible") fetchNotifications()
    }
document.addEventListener("visibilitychange", onVisible);
return () => {
clearInterval(interval);
document.removeEventListener("visibilitychange", onVisible)
    }
  }, [fetchNotifications]);
function markSeen() {
if (latestIdRef.current) {
setLastSeen(latestIdRef.current)
    }
setUnseenCount(0)
  }
return (
    <GlassCard className="p-5">
      <Link href="/notifications" onClick={markSeen} className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Activity</h3>
        {unseenCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}
      </Link>
      {notifications.length === 0 ? (
        <div className="py-6 text-center" onClick={markSeen}>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/5">
            <svg className="size-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-sm text-muted">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-1" onClick={markSeen}>
          {notifications.slice(0, 5).map((n) => (
            <NotificationRow key={n.id} item={n} />
          ))}
          {notifications.length > 5 && (
            <Link href="/notifications" className="block pt-1 text-center text-[11px] text-accent transition hover:text-accent-hover">
              View all
            </Link>
          )}
        </div>
      )}
    </GlassCard>
  )
}
function NotificationRow({ item }: { item: NotificationItem }) {
const profileHref = item.actor?.username ? `/u/${item.actor.username}` : "#"

  return (
    <Link
      href={item.postId ? `/feed` : profileHref}
className="flex items-start gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white/[0.03]"
    >
      <div className="relative shrink-0">
        {item.actor?.image ? (
          <img src={item.actor.image} alt="" className="mt-0.5 size-8 rounded-full object-cover ring-1 ring-white/10" />
        ) : (
          <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
            {item.actor?.name?.[0] ?? "?"}
          </div>
        )}
        <span className="absolute -bottom-0.5 -right-0.5 text-xs">
          {item.type === "wow" ? "😮" : item.type === "comment" ? "💬" : "👤"}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="leading-snug text-foreground/80">
          <span className="font-medium text-accent">{item.actor?.name ?? "Someone"}</span>{" "}
          {item.type === "wow" && item.count && item.count > 1
            ? item.message.replace(/^and /, "")
            : item.message}
        </p>
        {item.actors && item.actors.length > 1 && (
          <p className="mt-0.5 text-[10px] text-muted">
            with {item.actors.slice(1).map((a) => a?.name).filter(Boolean).join(", ")}
          </p>
        )}
        <p className="mt-0.5 text-[10px] text-muted">{formatTimeAgo(item.createdAt)}</p>
      </div>
    </Link>
  )
}
function formatTimeAgo(dateStr: string): string {
const diff = Date.now() - new Date(dateStr).getTime()

  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24);
return `${days}d ago`
}
