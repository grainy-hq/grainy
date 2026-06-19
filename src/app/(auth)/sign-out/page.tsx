"use client"


import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react";
export default function SignOutPage() {
const router = useRouter();
const [error, setError] = useState<string | null>(null);
const [isPending, setIsPending] = useState(false);
async function handleSignOut() {
setError(null);
setIsPending(true);
await authClient.signOut({
fetchOptions: {
onSuccess: () => {
router.push("/");
router.refresh()
        },
        onError: (ctx) => {
setError(ctx.error.message);
setIsPending(false)
        },
      },
    })
  }
return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-md rounded-3xl border border-black/[.08] bg-white p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.08)] dark:border-white/[.12] dark:bg-[#111]">
        <p className="mb-3 text-sm font-medium text-black/55 dark:text-white/55">
          Leaving Grainy
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">Sign out</h1>
        <p className="mt-3 text-sm/6 text-black/60 dark:text-white/60">
          End your current session and return to the home page.
        </p>

        {error ? (
          <p className="mt-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="bg-foreground text-background h-12 flex-1 rounded-full px-5 text-sm font-semibold transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={handleSignOut}
disabled={isPending}
          >
            {isPending ? "Signing out..." : "Sign out"}
          </button>
          <Link
            className="flex h-12 flex-1 items-center justify-center rounded-full border border-black/[.12] px-5 text-sm font-semibold transition hover:bg-black/[.04] dark:border-white/[.18] dark:hover:bg-white/[.08]"
            href="/"
          >
            Stay signed in
          </Link>
        </div>
      </section>
    </main>
  )
}
