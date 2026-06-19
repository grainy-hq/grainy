"use client"

import { AmbientBackground } from "@/components/ui/ambient-background"
import { GrainyLogo } from "@/components/ui/grainy-logo"
import { GlassCard } from "@/components/ui/glass-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
function SignOutButton() {
const router = useRouter()

  const [pending, setPending] = useState(false);
async function handleSignOut() {
setPending(true);
await authClient.signOut({
fetchOptions: {
onSuccess: () => {
router.push("/");
router.refresh()
        },
        onError: () => setPending(false),
      },
    })
  }
return (
    <button
      onClick={handleSignOut}
disabled={pending}
className="rounded-full border border-border bg-card px-8 py-3 text-sm font-medium text-foreground transition hover:bg-card-hover disabled:opacity-50"
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  )
}
export default function HomePage() {
const [session, setSession] = useState<boolean | null>(null);
useEffect(() => {
authClient.getSession().then((res) => setSession(!!res.data))
  }, []);
return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <ThemeToggle
        compact
        className="fixed right-6 top-6 z-50 flex size-10 items-center justify-center rounded-full border border-border bg-card text-sm transition hover:bg-card-hover"
      />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center text-center">
          <GrainyLogo size="lg" showText={false} />
          <h1 className="mt-8 text-5xl font-bold tracking-tight sm:text-7xl">
            <span className="gradient-text">Grainy</span>
            <span className="text-foreground"> Life</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted sm:text-xl">
            Your friends. Your feed. Your vibe. A place to share what matters.
          </p>
          <div className="mt-10 flex items-center gap-4">
            {session ? (
              <>
                <Link
                  href="/feed"
                  className="accent-btn rounded-full px-10 py-3.5 text-sm font-semibold text-white"
                >
                  Go to feed
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="accent-btn rounded-full px-10 py-3.5 text-sm font-semibold text-white"
                >
                  Get started
                </Link>
                <Link
                  href="/sign-in"
                  className="rounded-full border border-border bg-card px-8 py-3.5 text-sm font-medium text-muted transition hover:text-foreground hover:bg-card-hover"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
