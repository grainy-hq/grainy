"use client"

import { AmbientBackground } from "@/components/ui/ambient-background"
import { GlassCard } from "@/components/ui/glass-card"
import { fetchJson } from "@/lib/fetch-json"
import { useCallback, useEffect, useRef, useState } from "react"

type Tab =
  | "overview"
  | "users"
  | "reports"
  | "announcements"
  | "features"
  | "analytics"
  | "logs"
type Metrics = {
  users: number
  posts: number
  explorePosts: number
  comments: number
  exploreComments: number
  pendingReports: number
  recentUsers: {
    id: string
    name: string
    email: string
    username: string | null
    createdAt: string
  }[]
}
type UserRow = {
  id: string
  name: string
  email: string
  username: string | null
  image: string | null
  isPremium: boolean
  isVerified: boolean
  bannedFromPosting: boolean
  bannedFromCommenting: boolean
  createdAt: string
}
type ReportItem = {
  id: string
  reason: string
  status: string
  createdAt: string
  reporter: { id: string; name: string; username: string | null }
}
type Announcement = {
  id: string
  message: string
  active: boolean
  createdAt: string
}
type FeatureToggle = {
  id: string
  featureKey: string
  enabled: boolean
  description: string | null
}
type DailySeries = { date: string; count: number }[]
export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [tab, setTab] = useState<Tab>("overview")
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  const [users, setUsers] = useState<UserRow[]>([])

  const [reports, setReports] = useState<ReportItem[]>([])

  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  const [features, setFeatures] = useState<FeatureToggle[]>([])

  const [analytics, setAnalytics] = useState<Record<
    string,
    DailySeries
  > | null>(null)

  const [announceMsg, setAnnounceMsg] = useState("")
  const [newFeatureKey, setNewFeatureKey] = useState("")
  const [newFeatureDesc, setNewFeatureDesc] = useState("")
  function checkPassword() {
    if (password === "GrainyTeam@2026") {
      setAuthenticated(true)
      setError("")
    } else {
      setError("Invalid password")
    }
  }
  const loadAll = useCallback(() => {
    fetchJson<Metrics>("/api/admin/metrics")
      .then((d) => setMetrics(d))
      .catch(() => {})
    fetchJson<{ users: UserRow[] }>("/api/admin/users")
      .then((d) => setUsers(d.users))
      .catch(() => {})
    fetchJson<{ reports: ReportItem[] }>("/api/admin/reports")
      .then((d) => setReports(d.reports))
      .catch(() => {})
    fetchJson<{ announcements: Announcement[] }>("/api/admin/announcements")
      .then((d) => setAnnouncements(d.announcements))
      .catch(() => {})
    fetchJson<{ features: FeatureToggle[] }>("/api/admin/features")
      .then((d) => setFeatures(d.features))
      .catch(() => {})
    fetchJson<Record<string, DailySeries>>("/api/admin/analytics")
      .then((d) => setAnalytics(d))
      .catch(() => {})
  }, [])
  useEffect(() => {
    if (authenticated) loadAll()
  }, [authenticated, loadAll])
  async function updateUser(userId: string, updates: Record<string, unknown>) {
    try {
      await fetchJson("/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ userId, ...updates }),
      })

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
      )
    } catch {
      /* ignore */
    }
  }
  async function resolveReport(
    reportId: string,
    status: "resolved" | "dismissed",
  ) {
    try {
      await fetchJson("/api/admin/reports", {
        method: "PATCH",
        body: JSON.stringify({ reportId, status }),
      })
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r)),
      )
    } catch {
      /* ignore */
    }
  }
  async function createAnnouncement() {
    if (!announceMsg.trim()) return
    try {
      await fetchJson("/api/admin/announcements", {
        method: "POST",
        body: JSON.stringify({ message: announceMsg }),
      })
      setAnnounceMsg("")
      loadAll()
    } catch {
      /* ignore */
    }
  }
  async function toggleAnnouncement(id: string, active: boolean) {
    try {
      await fetchJson(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      })
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active } : a)),
      )
    } catch {
      /* ignore */
    }
  }
  async function deleteAnnouncement(id: string) {
    try {
      await fetchJson(`/api/admin/announcements/${id}`, { method: "DELETE" })
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    } catch {
      /* ignore */
    }
  }
  async function toggleFeature(featureKey: string, enabled: boolean) {
    try {
      await fetchJson("/api/admin/features", {
        method: "PATCH",
        body: JSON.stringify({ featureKey, enabled }),
      })
      setFeatures((prev) =>
        prev.map((f) => (f.featureKey === featureKey ? { ...f, enabled } : f)),
      )
    } catch {
      /* ignore */
    }
  }
  async function createFeature() {
    if (!newFeatureKey.trim()) return
    try {
      await fetchJson("/api/admin/features", {
        method: "POST",
        body: JSON.stringify({
          featureKey: newFeatureKey.trim(),
          description: newFeatureDesc.trim() || undefined,
        }),
      })
      setNewFeatureKey("")
      setNewFeatureDesc("")
      loadAll()
    } catch {
      /* ignore */
    }
  }
  if (!authenticated) {
    return (
      <main
        className="relative flex min-h-screen items-center justify-center px-6 py-16"
        data-theme="dark"
      >
        {" "}
        <AmbientBackground />{" "}
        <div className="relative z-10 w-full max-w-sm">
          {" "}
          <GlassCard strong className="p-8">
            {" "}
            <h1 className="text-2xl font-bold">Admin</h1>{" "}
            <p className="text-muted mt-1 text-sm">Enter admin password</p>{" "}
            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}{" "}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkPassword()}
              placeholder="Password"
              className="border-border bg-background focus:border-accent mt-4 w-full rounded-xl border px-4 py-3 text-sm outline-none"
            />{" "}
            <button
              onClick={checkPassword}
              className="accent-btn mt-4 w-full rounded-xl py-3 text-sm font-semibold text-white"
            >
              Access dashboard
            </button>{" "}
          </GlassCard>{" "}
        </div>{" "}
      </main>
    )
  }
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8" data-theme="dark">
      {" "}
      <div className="flex items-center justify-between">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>{" "}
          <p className="text-muted text-sm">Manage Grainy community</p>{" "}
        </div>{" "}
        <div className="flex gap-2">
          {" "}
          <button
            onClick={loadAll}
            className="text-muted rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
          >
            Refresh
          </button>{" "}
          <button
            onClick={() => setAuthenticated(false)}
            className="text-muted rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
          >
            Lock
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        {" "}
        {(
          [
            "overview",
            "users",
            "reports",
            "announcements",
            "features",
            "analytics",
            "logs",
          ] as Tab[]
        ).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${tab === t ? "bg-accent/20 text-accent" : "text-muted hover:text-foreground hover:bg-white/5"}`}
          >
            {" "}
            {t === "logs" ? "Logs" : t}{" "}
          </button>
        ))}{" "}
      </div>{" "}
      {/* OVERVIEW */}{" "}
      {tab === "overview" && metrics && (
        <>
          {" "}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {" "}
            {[
              { label: "Users", value: metrics.users },
              { label: "Posts", value: metrics.posts },
              { label: "Explore Posts", value: metrics.explorePosts },
              {
                label: "Pending Reports",
                value: metrics.pendingReports,
                highlight: metrics.pendingReports > 0,
              },
            ].map((s) => (
              <GlassCard key={s.label} className="p-6">
                {" "}
                <p className="text-muted text-sm">{s.label}</p>{" "}
                <p
                  className={`mt-1 text-3xl font-bold ${s.highlight ? "text-red-400" : ""}`}
                >
                  {s.value}
                </p>{" "}
              </GlassCard>
            ))}{" "}
          </div>{" "}
          {Array.isArray(metrics.recentUsers) &&
            metrics.recentUsers.length > 0 && (
              <GlassCard className="p-6">
                {" "}
                <h3 className="mb-3 font-semibold">Recent Users</h3>{" "}
                <div className="space-y-2">
                  {" "}
                  {metrics.recentUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between text-sm"
                    >
                      {" "}
                      <span>{u.name}</span>
                      <span className="text-muted">{u.email}</span>{" "}
                      <span className="text-muted text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>{" "}
                    </div>
                  ))}{" "}
                </div>{" "}
              </GlassCard>
            )}{" "}
        </>
      )}{" "}
      {/* USERS */}{" "}
      {tab === "users" && (
        <div className="space-y-2">
          {" "}
          {users.map((u) => (
            <GlassCard key={u.id} className="p-4">
              {" "}
              <div className="flex flex-wrap items-center gap-4">
                {" "}
                <div className="min-w-0 flex-1">
                  {" "}
                  <p className="font-semibold">{u.name}</p>{" "}
                  <p className="text-muted text-xs">{u.email}</p>{" "}
                  {u.username && (
                    <p className="text-muted text-xs">@{u.username}</p>
                  )}{" "}
                </div>{" "}
                <div className="flex flex-wrap gap-2">
                  {" "}
                  <ActionBtn
                    active={u.bannedFromPosting}
                    label1="Banned"
                    label0="Ban Posting"
                    onClick={() =>
                      updateUser(u.id, { banPosting: !u.bannedFromPosting })
                    }
                    danger
                  />{" "}
                  <ActionBtn
                    active={u.bannedFromCommenting}
                    label1="Banned"
                    label0="Ban Comments"
                    onClick={() =>
                      updateUser(u.id, {
                        banCommenting: !u.bannedFromCommenting,
                      })
                    }
                    danger
                  />{" "}
                  <ActionBtn
                    active={u.isPremium}
                    label1="Premium"
                    label0="Set Premium"
                    onClick={() =>
                      updateUser(u.id, { isPremium: !u.isPremium })
                    }
                    accent
                  />{" "}
                  <ActionBtn
                    active={u.isVerified}
                    label1="Verified"
                    label0="Verify"
                    onClick={() =>
                      updateUser(u.id, { isVerified: !u.isVerified })
                    }
                    accent
                  />{" "}
                </div>{" "}
              </div>{" "}
            </GlassCard>
          ))}{" "}
        </div>
      )}{" "}
      {/* REPORTS */}{" "}
      {tab === "reports" && (
        <div className="space-y-2">
          {" "}
          {reports.length === 0 ? (
            <GlassCard className="text-muted p-8 text-center text-sm">
              No reports
            </GlassCard>
          ) : (
            reports.map((r) => (
              <GlassCard key={r.id} className="p-4">
                {" "}
                <div className="flex flex-wrap items-center gap-4">
                  {" "}
                  <div className="min-w-0 flex-1">
                    {" "}
                    <p className="text-sm font-medium capitalize">
                      {r.reason.replace(/_/g, " ")}
                    </p>{" "}
                    <p className="text-muted text-xs">
                      Reported by @{r.reporter.username ?? r.reporter.name}{" "}
                      &middot; {new Date(r.createdAt).toLocaleDateString()}
                    </p>{" "}
                    <StatusBadge status={r.status} />{" "}
                  </div>{" "}
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      {" "}
                      <button
                        onClick={() => resolveReport(r.id, "resolved")}
                        className="rounded-xl bg-green-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-600"
                      >
                        Resolve
                      </button>{" "}
                      <button
                        onClick={() => resolveReport(r.id, "dismissed")}
                        className="text-muted rounded-xl bg-white/10 px-4 py-1.5 text-xs font-semibold hover:bg-white/20"
                      >
                        Dismiss
                      </button>{" "}
                    </div>
                  )}{" "}
                </div>{" "}
              </GlassCard>
            ))
          )}{" "}
        </div>
      )}{" "}
      {/* ANNOUNCEMENTS */}{" "}
      {tab === "announcements" && (
        <div className="space-y-4">
          {" "}
          <GlassCard className="p-6">
            {" "}
            <h3 className="mb-3 font-semibold">New Announcement</h3>{" "}
            <textarea
              value={announceMsg}
              onChange={(e) => setAnnounceMsg(e.target.value)}
              placeholder="Emergency message for all users..."
              rows={3}
              className="focus:border-accent mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
            />{" "}
            <button
              onClick={createAnnouncement}
              disabled={!announceMsg.trim()}
              className="accent-btn rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Broadcast
            </button>{" "}
          </GlassCard>{" "}
          {announcements.length === 0 ? (
            <GlassCard className="text-muted p-8 text-center text-sm">
              No announcements
            </GlassCard>
          ) : (
            announcements.map((a) => (
              <GlassCard key={a.id} className="p-4">
                {" "}
                <div className="flex items-start gap-4">
                  {" "}
                  <div className="min-w-0 flex-1">
                    {" "}
                    <p className="text-sm">{a.message}</p>{" "}
                    <p className="text-muted mt-1 text-[10px]">
                      {new Date(a.createdAt).toLocaleString()}
                    </p>{" "}
                  </div>{" "}
                  <div className="flex shrink-0 gap-2">
                    {" "}
                    <button
                      onClick={() => toggleAnnouncement(a.id, !a.active)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium ${a.active ? "bg-green-500/20 text-green-300" : "text-muted bg-white/5"}`}
                    >
                      {" "}
                      {a.active ? "Active" : "Inactive"}{" "}
                    </button>{" "}
                    <button
                      onClick={() => deleteAnnouncement(a.id)}
                      className="rounded-xl bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/30"
                    >
                      Delete
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </GlassCard>
            ))
          )}{" "}
        </div>
      )}{" "}
      {/* FEATURES */}{" "}
      {tab === "features" && (
        <div className="space-y-4">
          {" "}
          <GlassCard className="p-6">
            {" "}
            <h3 className="mb-3 font-semibold">Add Feature Toggle</h3>{" "}
            <div className="flex flex-wrap gap-3">
              {" "}
              <input
                value={newFeatureKey}
                onChange={(e) => setNewFeatureKey(e.target.value)}
                placeholder="feature_key"
                className="focus:border-accent flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
              />{" "}
              <input
                value={newFeatureDesc}
                onChange={(e) => setNewFeatureDesc(e.target.value)}
                placeholder="Description (optional)"
                className="focus:border-accent flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
              />{" "}
              <button
                onClick={createFeature}
                disabled={!newFeatureKey.trim()}
                className="accent-btn rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Add
              </button>{" "}
            </div>{" "}
          </GlassCard>{" "}
          <div className="space-y-2">
            {" "}
            {features.map((f) => (
              <GlassCard key={f.id} className="p-4">
                {" "}
                <div className="flex items-center gap-4">
                  {" "}
                  <div className="min-w-0 flex-1">
                    {" "}
                    <p className="font-mono text-sm font-semibold">
                      {f.featureKey}
                    </p>{" "}
                    {f.description && (
                      <p className="text-muted text-xs">{f.description}</p>
                    )}{" "}
                  </div>{" "}
                  <button
                    onClick={() => toggleFeature(f.featureKey, !f.enabled)}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${f.enabled ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}
                  >
                    {" "}
                    {f.enabled ? "ENABLED" : "DISABLED"}{" "}
                  </button>{" "}
                </div>{" "}
              </GlassCard>
            ))}{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* ANALYTICS */}{" "}
      {tab === "analytics" && analytics && (
        <div className="space-y-4">
          {" "}
          <AnalyticsCard
            title="New Users"
            data={analytics.dailyUsers ?? []}
            color="#22c55e"
          />{" "}
          <AnalyticsCard
            title="New Posts"
            data={analytics.dailyPosts ?? []}
            color="#3b82f6"
          />{" "}
          <AnalyticsCard
            title="Explore Posts"
            data={analytics.dailyExplorePosts ?? []}
            color="#a855f7"
          />{" "}
          <AnalyticsCard
            title="Comments"
            data={analytics.dailyComments ?? []}
            color="#f59e0b"
          />{" "}
          <AnalyticsCard
            title="Explore Comments"
            data={analytics.dailyExploreComments ?? []}
            color="#ec4899"
          />{" "}
          <AnalyticsCard
            title="Wows"
            data={analytics.dailyWows ?? []}
            color="#06b6d4"
          />{" "}
          <AnalyticsCard
            title="Explore Wows"
            data={analytics.dailyExploreWows ?? []}
            color="#f97316"
          />{" "}
        </div>
      )}{" "}
      {/* LOGS */}{" "}
      {tab === "logs" && (
        <GlassCard className="p-6">
          {" "}
          <p className="text-muted text-sm">
            Admin log entries are stored in the database. View them directly or
            export from your database dashboard.
          </p>{" "}
        </GlassCard>
      )}{" "}
    </main>
  )
}
function ActionBtn({
  active,
  label1,
  label0,
  onClick,
  danger,
  accent,
}: {
  active: boolean
  label1: string
  label0: string
  onClick: () => void
  danger?: boolean
  accent?: boolean
}) {
  const bg = active
    ? danger
      ? "bg-red-500/20 text-red-300"
      : "bg-accent/20 text-accent"
    : "bg-white/5 text-muted hover:bg-white/10"
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${bg}`}
    >
      {active ? label1 : label0}
    </button>
  )
}
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-300",
    resolved: "bg-green-500/20 text-green-300",
    dismissed: "bg-white/10 text-muted",
  }
  return (
    <span
      className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${colors[status] ?? colors.dismissed}`}
    >
      {status}
    </span>
  )
}
function AnalyticsCard({
  title,
  data,
  color,
}: {
  title: string
  data: DailySeries
  color: string
}) {
  const maxVal = Math.max(...data.map((d) => d.count), 1)

  const points = data.length
  return (
    <GlassCard className="p-6">
      {" "}
      <div className="mb-3 flex items-center justify-between">
        {" "}
        <h3 className="font-semibold">{title}</h3>{" "}
        <span className="text-muted text-sm">
          {" "}
          {data.reduce((s, d) => s + d.count, 0)} total &middot;{" "}
          {data.length > 0
            ? Math.round(data.reduce((s, d) => s + d.count, 0) / data.length)
            : 0}
          /day avg{" "}
        </span>{" "}
      </div>{" "}
      {data.length === 0 ? (
        <p className="text-muted py-6 text-center text-sm">
          No data for last 30 days
        </p>
      ) : (
        <div className="relative h-40">
          {" "}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {" "}
            {data.map((d, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${(d.count / maxVal) * 100}%`,
                  backgroundColor: color,
                  opacity: 0.6 + (d.count / maxVal) * 0.4,
                  minHeight: d.count > 0 ? 2 : 0,
                }}
                title={`${d.date}: ${d.count}`}
              />
            ))}{" "}
          </div>{" "}
          <div className="text-muted absolute right-0 bottom-0 left-0 flex justify-between text-[10px]">
            {" "}
            <span>{data[0]?.date ?? ""}</span>{" "}
            <span>{data[data.length - 1]?.date ?? ""}</span>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </GlassCard>
  )
}
