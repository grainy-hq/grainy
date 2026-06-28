"use client"

import { AmbientBackground } from "@/components/ui/ambient-background"
import { GlassCard } from "@/components/ui/glass-card"
import { GrainyLogo } from "@/components/ui/grainy-logo"
import { cn } from "@/lib/cn"
import { useRouter } from "next/navigation"
import { useState } from "react"

const STEPS = [
  { id: 1, label: "Identity", desc: "Pick your handle" },
  { id: 2, label: "Story", desc: "Tell your story" },
  { id: 3, label: "Launch", desc: "Preview & go" },
]
export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [error, setError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const usernameValid = username.length >= 3 && username.length <= 30
  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.toLowerCase(),
        bio,
        location,
        completeOnboarding: true,
      }),
    })

    const data = (await res.json()) as { error?: string }
    if (!res.ok) {
      setError(data.error ?? "Something went wrong")
      setSubmitting(false)
      return
    }
    router.push("/feed")
    router.refresh()
  }
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-8"
      data-theme="dark"
    >
      {" "}
      <AmbientBackground />{" "}
      <div className="relative z-10 w-full max-w-5xl">
        {" "}
        <div className="mb-8 flex items-center justify-between">
          {" "}
          <GrainyLogo size="md" />{" "}
          <div className="flex items-center gap-2">
            {" "}
            {STEPS.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                {" "}
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                    step === s.id
                      ? "accent-btn text-white"
                      : step > s.id
                        ? "bg-accent/20 text-accent"
                        : "text-muted bg-white/5",
                  )}
                >
                  {" "}
                  {step > s.id ? "✓" : s.id}{" "}
                </div>{" "}
                {s.id < STEPS.length && (
                  <div
                    className={cn(
                      "h-px w-8 transition-colors duration-300 sm:w-12",
                      step > s.id ? "bg-accent/50" : "bg-white/10",
                    )}
                  />
                )}{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {" "}
          {/* Form panel */}{" "}
          <GlassCard strong className="p-8 sm:p-10">
            {" "}
            <div className="mb-8">
              {" "}
              <p className="text-accent text-xs font-medium tracking-[0.2em] uppercase">
                {" "}
                Step {step} of 3{" "}
              </p>{" "}
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {" "}
                {step === 1 && (
                  <>
                    {" "}
                    Choose your{" "}
                    <span className="gradient-text">identity</span>{" "}
                  </>
                )}{" "}
                {step === 2 && (
                  <>
                    {" "}
                    Share your <span className="gradient-text">story</span>{" "}
                  </>
                )}{" "}
                {step === 3 && (
                  <>
                    {" "}
                    Ready to <span className="gradient-text">launch</span>?{" "}
                  </>
                )}{" "}
              </h1>{" "}
              <p className="text-muted mt-3 leading-relaxed">
                {" "}
                {step === 1 &&
                  "Your username is how friends find you. Make it memorable."}{" "}
                {step === 2 &&
                  "A great bio helps people know who you are before they connect."}{" "}
                {step === 3 &&
                  "Here's how your profile will look. Hit launch when you're happy."}{" "}
              </p>{" "}
            </div>{" "}
            {error && (
              <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {" "}
                {error}{" "}
              </div>
            )}{" "}
            {step === 1 && (
              <div className="space-y-6">
                {" "}
                <div>
                  {" "}
                  <label className="text-foreground/80 mb-2 block text-sm font-medium">
                    {" "}
                    Username{" "}
                  </label>{" "}
                  <div className="input-field flex items-center rounded-2xl px-5 py-1">
                    {" "}
                    <span className="text-accent font-medium">@</span>{" "}
                    <input
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, ""),
                        )
                      }
                      placeholder="yourname"
                      maxLength={30}
                      className="placeholder:text-muted/60 flex-1 bg-transparent py-3 pl-2 text-lg outline-none"
                      autoFocus
                    />{" "}
                  </div>{" "}
                  <div className="mt-3 flex items-center justify-between">
                    {" "}
                    <p className="text-muted text-xs">
                      {" "}
                      Letters, numbers, underscores only{" "}
                    </p>{" "}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        usernameValid ? "text-emerald-400" : "text-muted",
                      )}
                    >
                      {" "}
                      {username.length}/30{" "}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex flex-wrap gap-2">
                  {" "}
                  {["cyndy_l", "robert_fox", "jules_m"].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setUsername(suggestion)}
                      className="text-muted hover:border-accent/30 hover:text-accent rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs transition"
                    >
                      {" "}
                      @{suggestion}{" "}
                    </button>
                  ))}{" "}
                </div>{" "}
              </div>
            )}{" "}
            {step === 2 && (
              <div className="space-y-5">
                {" "}
                <div>
                  {" "}
                  <label className="text-foreground/80 mb-2 block text-sm font-medium">
                    {" "}
                    Bio{" "}
                  </label>{" "}
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Photographer. Nature lover. Always chasing golden hour..."
                    rows={4}
                    maxLength={500}
                    className="input-field placeholder:text-muted/60 w-full resize-none rounded-2xl px-5 py-4 text-sm leading-relaxed outline-none"
                    autoFocus
                  />{" "}
                  <p className="text-muted mt-2 text-right text-xs">
                    {" "}
                    {bio.length}/500{" "}
                  </p>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="text-foreground/80 mb-2 block text-sm font-medium">
                    {" "}
                    Location{" "}
                  </label>{" "}
                  <div className="input-field flex items-center gap-3 rounded-2xl px-5">
                    {" "}
                    <svg
                      className="text-accent size-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      {" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />{" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />{" "}
                    </svg>{" "}
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Torrance, CA, United States"
                      className="placeholder:text-muted/60 flex-1 bg-transparent py-3.5 text-sm outline-none"
                    />{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            )}{" "}
            {step === 3 && (
              <div className="space-y-4">
                {" "}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  {" "}
                  <p className="text-sm text-emerald-300">
                    {" "}
                    Everything looks great! Your profile is ready to go
                    live.{" "}
                  </p>{" "}
                </div>{" "}
                <ul className="text-muted space-y-3 text-sm">
                  {" "}
                  <li className="flex items-center gap-3">
                    {" "}
                    <span className="bg-accent/20 text-accent flex size-6 items-center justify-center rounded-full text-xs">
                      {" "}
                      ✓{" "}
                    </span>{" "}
                    Username @{username}{" "}
                  </li>{" "}
                  {bio && (
                    <li className="flex items-center gap-3">
                      {" "}
                      <span className="bg-accent/20 text-accent flex size-6 items-center justify-center rounded-full text-xs">
                        {" "}
                        ✓{" "}
                      </span>{" "}
                      Bio added{" "}
                    </li>
                  )}{" "}
                  {location && (
                    <li className="flex items-center gap-3">
                      {" "}
                      <span className="bg-accent/20 text-accent flex size-6 items-center justify-center rounded-full text-xs">
                        {" "}
                        ✓{" "}
                      </span>{" "}
                      Location set{" "}
                    </li>
                  )}{" "}
                </ul>{" "}
              </div>
            )}{" "}
            <div className="mt-10 flex items-center justify-between gap-4">
              {" "}
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="text-muted hover:text-foreground rounded-full border border-white/10 px-6 py-3 text-sm font-medium transition hover:border-white/20"
                >
                  {" "}
                  Back{" "}
                </button>
              ) : (
                <div />
              )}{" "}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !usernameValid}
                  className="accent-btn rounded-full px-8 py-3 text-sm font-semibold text-white"
                >
                  {" "}
                  Continue{" "}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="accent-btn rounded-full px-8 py-3 text-sm font-semibold text-white"
                >
                  {" "}
                  {submitting ? "Launching..." : "Launch profile →"}{" "}
                </button>
              )}{" "}
            </div>{" "}
          </GlassCard>{" "}
          {/* Live preview */}{" "}
          <div className="hidden lg:block">
            {" "}
            <p className="text-muted mb-4 text-xs font-medium tracking-[0.2em] uppercase">
              {" "}
              Live preview{" "}
            </p>{" "}
            <ProfilePreview
              username={username}
              bio={bio}
              location={location}
            />{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  )
}
function ProfilePreview({
  username,
  bio,
  location,
}: {
  username: string
  bio: string
  location: string
}) {
  return (
    <GlassCard className="overflow-hidden">
      {" "}
      <div className="from-accent/30 via-accent-secondary/20 to-accent-tertiary/20 relative h-24 bg-gradient-to-br">
        {" "}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(167,139,250,0.4),transparent_60%)]" />{" "}
      </div>{" "}
      <div className="relative px-6 pb-6">
        {" "}
        <div className="gradient-ring -mt-10 mb-4 size-20 rounded-full">
          {" "}
          <div className="bg-background gradient-text flex size-full items-center justify-center rounded-full text-2xl font-bold">
            {" "}
            {username ? username[0]?.toUpperCase() : "?"}{" "}
          </div>{" "}
        </div>{" "}
        <h3 className="text-xl font-bold">
          {" "}
          {username ? `@${username}` : "@yourname"}{" "}
        </h3>{" "}
        {location && (
          <p className="text-muted mt-1 flex items-center gap-1.5 text-sm">
            {" "}
            <svg
              className="size-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />{" "}
            </svg>{" "}
            {location}{" "}
          </p>
        )}{" "}
        {bio ? (
          <p className="text-foreground/80 mt-4 text-sm leading-relaxed">
            {" "}
            {bio}{" "}
          </p>
        ) : (
          <p className="text-muted mt-4 text-sm italic">
            {" "}
            Your bio will appear here...{" "}
          </p>
        )}{" "}
        <div className="mt-6 flex gap-6 border-t border-white/5 pt-4">
          {" "}
          <div>
            {" "}
            <p className="text-lg font-bold">0</p>{" "}
            <p className="text-muted text-xs">Posts</p>{" "}
          </div>{" "}
          <div>
            {" "}
            <p className="text-lg font-bold">0</p>{" "}
            <p className="text-muted text-xs">Followers</p>{" "}
          </div>{" "}
          <div>
            {" "}
            <p className="text-lg font-bold">0</p>{" "}
            <p className="text-muted text-xs">Following</p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </GlassCard>
  )
}
