import { GlassCard } from "@/components/ui/glass-card"
export default function DirectPage() {
return (
    <GlassCard className="p-10 text-center">
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent-secondary/20">
        <svg className="size-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold">Direct Messages</h1>
      <p className="mt-3 max-w-sm mx-auto text-muted leading-relaxed">
        Direct messaging is coming soon. For now, connect with friends through
        their profiles.
      </p>
    </GlassCard>
  )
}
