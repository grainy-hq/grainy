"use client"

import { AmbientBackground } from "@/components/ui/ambient-background"
import { GlassCard } from "@/components/ui/glass-card"
import { GrainyLogo } from "@/components/ui/grainy-logo"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const [isPending, setIsPending] = useState(false)
  const [mode, setMode] = useState<"pick" | "email" | "discord">("pick")
  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    setIsPending(true)
    await authClient.signUp.email(
      { email, password, name },
      {
        onSuccess: () => {
          router.push("/onboarding")
          router.refresh()
        },
        onError: (ctx) => {
          setError(ctx.error.message)
          setIsPending(false)
        },
      },
    )
  }
  async function handleDiscordSignIn() {
    setError(null)
    setIsPending(true)
    await authClient.signIn.social(
      { provider: "discord", callbackURL: "/feed" },
      {
        onError: (ctx) => {
          setError(ctx.error.message)
          setIsPending(false)
        },
      },
    )
  }
  if (mode === "pick") {
    return (
      <main
        className="relative flex min-h-screen items-center justify-center px-6 py-16"
        data-theme="dark"
      >
        {" "}
        <AmbientBackground />{" "}
        <div className="relative z-10 w-full max-w-md">
          {" "}
          <div className="mb-8 flex justify-center">
            {" "}
            <GrainyLogo size="md" />{" "}
          </div>{" "}
          <GlassCard strong className="p-8 sm:p-10">
            {" "}
            <p className="text-accent text-xs font-medium tracking-[0.2em] uppercase">
              Welcome
            </p>{" "}
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              {" "}
              Join the <span className="gradient-text">community</span>{" "}
            </h1>{" "}
            <p className="text-muted mt-3 text-sm leading-relaxed">
              Choose how you&apos d like to sign up.
            </p>{" "}
            <div className="mt-8 space-y-3">
              {" "}
              <button
                onClick={() => setMode("email")}
                className="border-border bg-background flex h-14 w-full items-center justify-center gap-3 rounded-2xl border px-5 text-sm font-semibold transition hover:bg-white/5"
              >
                {" "}
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />{" "}
                </svg>{" "}
                Email & password{" "}
              </button>{" "}
              <button
                onClick={() => setMode("discord")}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#5865f2] px-5 text-sm font-semibold text-white transition hover:bg-[#4752c4]"
              >
                {" "}
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                  {" "}
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />{" "}
                </svg>{" "}
                Discord{" "}
              </button>{" "}
            </div>{" "}
            <p className="text-muted mt-8 text-center text-sm">
              {" "}
              Already have an account?{" "}
              <Link
                className="text-accent hover:text-accent-hover font-medium"
                href="/sign-in"
              >
                Sign in
              </Link>{" "}
            </p>{" "}
          </GlassCard>{" "}
        </div>{" "}
      </main>
    )
  }
  if (mode === "discord") {
    return (
      <main
        className="relative flex min-h-screen items-center justify-center px-6 py-16"
        data-theme="dark"
      >
        {" "}
        <AmbientBackground />{" "}
        <div className="relative z-10 w-full max-w-md">
          {" "}
          <div className="mb-8 flex justify-center">
            {" "}
            <GrainyLogo size="md" />{" "}
          </div>{" "}
          <GlassCard strong className="p-8 sm:p-10">
            {" "}
            <p className="text-accent text-xs font-medium tracking-[0.2em] uppercase">
              Welcome
            </p>{" "}
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              {" "}
              Join with <span className="gradient-text">Discord</span>{" "}
            </h1>{" "}
            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}{" "}
            <button
              onClick={handleDiscordSignIn}
              disabled={isPending}
              className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#5865f2] px-5 text-sm font-semibold text-white transition hover:bg-[#4752c4] disabled:opacity-60"
            >
              {" "}
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                {" "}
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />{" "}
              </svg>{" "}
              {isPending ? "Opening Discord..." : "Continue with Discord"}{" "}
            </button>{" "}
            <button
              onClick={() => setMode("pick")}
              className="text-muted hover:text-foreground mt-3 w-full rounded-xl py-2 text-sm transition"
            >
              {" "}
              Back{" "}
            </button>{" "}
          </GlassCard>{" "}
        </div>{" "}
      </main>
    )
  }
  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-6 py-16"
      data-theme="dark"
    >
      {" "}
      <AmbientBackground />{" "}
      <div className="relative z-10 w-full max-w-md">
        {" "}
        <div className="mb-8 flex justify-center">
          {" "}
          <GrainyLogo size="md" />{" "}
        </div>{" "}
        <GlassCard strong className="p-8 sm:p-10">
          {" "}
          <p className="text-accent text-xs font-medium tracking-[0.2em] uppercase">
            Join
          </p>{" "}
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {" "}
            Sign up with <span className="gradient-text">email</span>{" "}
          </h1>{" "}
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}{" "}
          <form onSubmit={handleEmailSignUp} className="mt-6 space-y-4">
            {" "}
            <div>
              {" "}
              <label className="text-muted mb-1 block text-sm font-medium">
                Name
              </label>{" "}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="border-border bg-background focus:border-accent w-full rounded-xl border px-4 py-3 text-sm outline-none"
              />{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="text-muted mb-1 block text-sm font-medium">
                Email
              </label>{" "}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="border-border bg-background focus:border-accent w-full rounded-xl border px-4 py-3 text-sm outline-none"
              />{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="text-muted mb-1 block text-sm font-medium">
                Password
              </label>{" "}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="border-border bg-background focus:border-accent w-full rounded-xl border px-4 py-3 text-sm outline-none"
              />{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="text-muted mb-1 block text-sm font-medium">
                Confirm password
              </label>{" "}
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                className="border-border bg-background focus:border-accent w-full rounded-xl border px-4 py-3 text-sm outline-none"
              />{" "}
            </div>{" "}
            <button
              type="submit"
              disabled={isPending || !email || !password || !name}
              className="accent-btn w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {" "}
              {isPending ? "Creating account..." : "Create account"}{" "}
            </button>{" "}
          </form>{" "}
          <button
            onClick={() => setMode("pick")}
            className="text-muted hover:text-foreground mt-3 w-full rounded-xl py-2 text-sm transition"
          >
            {" "}
            Choose different method{" "}
          </button>{" "}
          <p className="text-muted mt-6 text-center text-sm">
            {" "}
            Already have an account?{" "}
            <Link
              className="text-accent hover:text-accent-hover font-medium"
              href="/sign-in"
            >
              Sign in
            </Link>{" "}
          </p>{" "}
        </GlassCard>{" "}
      </div>{" "}
    </main>
  )
}
