import { cn } from "@/lib/cn"

export function GlassCard({
  children,
  className,
  strong = false,
}: {
  children: React.ReactNode
  className?: string
  strong?: boolean
}) {
  return (
    <div
      className={cn(
        "border-border rounded-xl border",
        strong ? "bg-card" : "bg-card",
        className,
      )}
    >
      {children}
    </div>
  )
}
