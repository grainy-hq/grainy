"use client"

import { useTheme } from "@/components/theme-provider"
import Link from "next/link"
export function ThemeToggle({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
const { theme, toggle, isPremium } = useTheme();
if (compact) {
return (
      <button
        onClick={toggle}
className={className}
aria-label="Toggle theme"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    )
  }
return (
    <div className="space-y-1">
      <button
        onClick={toggle}
className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 text-muted hover:bg-white/5 hover:text-foreground ${className ?? ""}`}
aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
        {theme === "light" ? "Dark mode" : "Light mode"}
      </button>
      {isPremium && (
        <Link
          href="/plus"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 text-accent hover:bg-accent/10"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Plus
        </Link>
      )}
    </div>
  )
}
