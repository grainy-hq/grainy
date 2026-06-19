"use client"

import { fetchJson } from "@/lib/fetch-json"
import Link from "next/link"
import { useEffect, useState } from "react";
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
export default function NotificationsPage() {
const [notifications, setNotifications] = useState<NotificationItem[]>([]);
useEffect(() => {
const since = localStorage.getItem("notificationLastSeen");
const url = since ? `/api/notifications?since=${encodeURIComponent(since)}` : "/api/notifications"
    fetchJson<{ notifications: NotificationItem[]; now?: string }>(url).then((d) => {
setNotifications(d.notifications ?? []);
if (d.now) localStorage.setItem("notificationLastSeen", d.now)
    }).catch(() => {})
  }, []);
return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Activity</h1>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-muted">No recent activity</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border/50">
          {notifications.map((n) => {
const profileHref = n.actor?.username ? `/u/${n.actor.username}` : "#"
            return (
              <Link
                key={n.id}
href={n.postId ? `/feed` : profileHref}
className="flex items-start gap-3 px-5 py-4 transition hover:bg-white/[0.02]"
              >
                {n.actor?.image ? (
                  <img src={n.actor.image} alt="" className="mt-0.5 size-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
                    {n.actor?.name?.[0] ?? "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground/90">
                    <span className="font-semibold text-accent">{n.actor?.name ?? "Someone"}</span>{" "}
                    {n.count && n.count > 1
                      ? n.message.replace(/^and /, "")
                      : n.message}
                  </p>
                  {n.actors && n.actors.length > 1 && (
                    <p className="mt-0.5 text-xs text-muted">
                      with {n.actors.slice(1).map((a) => a?.name).filter(Boolean).join(", ")}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-muted">{formatTimeAgo(n.createdAt)}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
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
