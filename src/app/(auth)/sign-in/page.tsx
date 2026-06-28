"use client"

import { AmbientBackground } from "@/components/ui/ambient-background"
import { GlassCard } from "@/components/ui/glass-card"
import { GrainyLogo } from "@/components/ui/grainy-logo"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignInPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const [isPending, setIsPending] = useState(false)
  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => {
          router.push("/feed")
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
            Welcome back
          </p>{" "}
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Sign in</h1>{" "}
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {" "}
              {error}{" "}
            </div>
          )}{" "}
          <form onSubmit={handleEmailSignIn} className="mt-6 space-y-4">
            {" "}
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
                placeholder="••••••••"
                required
                className="border-border bg-background focus:border-accent w-full rounded-xl border px-4 py-3 text-sm outline-none"
              />{" "}
            </div>{" "}
            <button
              type="submit"
              disabled={isPending || !email || !password}
              className="accent-btn w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {" "}
              {isPending ? "Signing in..." : "Sign in"}{" "}
            </button>{" "}
          </form>{" "}
          <div className="text-muted my-6 flex items-center gap-3 text-xs">
            {" "}
            <div className="h-px flex-1 bg-white/10" />{" "}
            <span>or continue with</span>{" "}
            <div className="h-px flex-1 bg-white/10" />{" "}
          </div>{" "}
          <button
            onClick={handleDiscordSignIn}
            disabled={isPending}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-[#5865f2] px-5 text-sm font-semibold text-white transition hover:bg-[#4752c4] disabled:opacity-60"
          >
            {" "}
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              {" "}
              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />{" "}
            </svg>{" "}
            Discord{" "}
          </button>{" "}
          <p className="text-muted mt-8 text-center text-sm">
            {" "}
            No account?{" "}
            <Link
              className="text-accent hover:text-accent-hover font-medium"
              href="/sign-up"
            >
              {" "}
              Sign up{" "}
            </Link>{" "}
          </p>{" "}
        </GlassCard>{" "}
      </div>{" "}
    </main>
  )
}
