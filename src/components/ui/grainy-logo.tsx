export function GrainyLogo({
size = "md",
  showText = true,
}: {
size?: "sm" | "md" | "lg"
  showText?: boolean;
}) {
const sizes = {
sm: { box: "size-9 text-sm", text: "text-lg" },
    md: { box: "size-12 text-lg", text: "text-xl" },
    lg: { box: "size-16 text-2xl", text: "text-3xl" },
  }
const s = sizes[size]

  return (
    <div className="flex items-center gap-3">
      <div
        className={`gradient-ring flex ${s.box} items-center justify-center rounded-2xl shadow-lg shadow-accent/25`}
      >
        <div className="flex size-full items-center justify-center rounded-[14px] bg-background">
          <span className={`font-bold tracking-tight gradient-text ${s.box}`}>
            G
          </span>
        </div>
      </div>
      {showText && (
        <span className={`font-bold tracking-tight ${s.text}`}>
          Grainy<span className="gradient-text">.</span>
        </span>
      )}
    </div>
  )
}
