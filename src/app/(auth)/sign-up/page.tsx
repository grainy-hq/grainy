"use client"

import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { useState } from "react"

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleDiscordSignIn() {
    setError(null)
    setIsPending(true)

    await authClient.signIn.social(
      {
        provider: "discord",
        callbackURL: "/",
      },
      {
        onError: (ctx) => {
          setError(ctx.error.message)
          setIsPending(false)
        },
      },
    )
  }

  return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-md rounded-3xl border border-black/[.08] bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)] dark:border-white/[.12] dark:bg-[#111]">
        <p className="mb-3 text-sm font-medium text-black/55 dark:text-white/55">
          Create your Grainy account
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">Sign up</h1>
        <p className="mt-3 text-sm/6 text-black/60 dark:text-white/60">
          Continue with Discord to create or access your account.
        </p>

        <div className="mt-8 space-y-5">
          {error ? (
            <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <button
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#5865f2] px-5 text-sm font-semibold text-white transition hover:bg-[#4752c4] disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={handleDiscordSignIn}
            disabled={isPending}
          >
            <span aria-hidden="true" className="text-base">
              ◐
            </span>
            {isPending ? "Opening Discord..." : "Continue with Discord"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-black/55 dark:text-white/55">
          Changed your mind?{" "}
          <Link className="text-foreground font-medium underline" href="/">
            Back home
          </Link>
        </p>
      </section>
    </main>
  )
}
