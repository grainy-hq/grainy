"use client"

import { useTheme, type CustomTheme } from "@/components/theme-provider"
import { fetchJson } from "@/lib/fetch-json"
import { useEffect, useState } from "react"

type Profile = {
  name: string
  isPremium: boolean
  profileBackground: string | null
  customTheme: CustomTheme | null
}
const DEFAULT_CUSTOM: CustomTheme = {
  name: "My Theme",
  bg: "#0a0a12",
  fg: "#f0ece4",
  accent: "#7c6ff0",
  accentHover: "#9a8af5",
  accentSecondary: "#5a4fd0",
  accentTertiary: "#3d35a0",
  muted: "#8a8598",
  bgStyle: "solid",
  bgGradient: "",
  cardOpacity: 0.65,
  glassBlur: "20px",
}
const PRESETS: { name: string; theme: Partial<CustomTheme> }[] = [
  {
    name: "Ocean",
    theme: {
      bg: "#0a1628",
      fg: "#e0f0ff",
      accent: "#4a9eff",
      accentHover: "#6ab4ff",
      accentSecondary: "#2a7acc",
      accentTertiary: "#1a5a99",
      muted: "#8a9ab8",
    },
  },
  {
    name: "Forest",
    theme: {
      bg: "#0a1a10",
      fg: "#e0f0e4",
      accent: "#4a9e6f",
      accentHover: "#6ab88a",
      accentSecondary: "#2a7a55",
      accentTertiary: "#1a5a3d",
      muted: "#8a9a90",
    },
  },
  {
    name: "Sunset",
    theme: {
      bg: "#1a0a12",
      fg: "#f0e0e4",
      accent: "#e86a4a",
      accentHover: "#f08a6a",
      accentSecondary: "#c0553a",
      accentTertiary: "#903d2a",
      muted: "#a08a8a",
    },
  },
  {
    name: "Midnight",
    theme: {
      bg: "#050508",
      fg: "#d8d8e8",
      accent: "#a080ff",
      accentHover: "#b8a0ff",
      accentSecondary: "#7860cc",
      accentTertiary: "#5040a0",
      muted: "#787090",
    },
  },
  {
    name: "Candy",
    theme: {
      bg: "#1a0a1a",
      fg: "#f0e0f0",
      accent: "#ff6aaa",
      accentHover: "#ff8ac0",
      accentSecondary: "#cc5088",
      accentTertiary: "#a03866",
      muted: "#a08098",
    },
  },
]

export default function PlusPage() {
  const { isPremium, applyCustomTheme, setPremium } = useTheme()

  const [profile, setProfile] = useState<Profile | null>(null)

  const [ct, setCt] = useState<CustomTheme>(DEFAULT_CUSTOM)

  const [saving, setSaving] = useState(false)

  const [msg, setMsg] = useState<string | null>(null)

  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [activationCode, setActivationCode] = useState("")
  const [activating, setActivating] = useState(false)

  const [activationMsg, setActivationMsg] = useState<string | null>(null)
  useEffect(() => {
    fetchJson<{ profile: Profile }>("/api/profile")
      .then((d) => {
        const p = d.profile
        setProfile(p)
        if (p.customTheme) {
          setCt(p.customTheme)
          setActivePreset(p.customTheme.name ?? null)
        }
      })
      .catch(() => {})
  }, [])
  async function handleActivate() {
    if (!activationCode.trim()) return
    setActivating(true)
    setActivationMsg(null)
    try {
      const res = await fetch("/api/premium/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activationCode }),
      })
      const data = (await res.json()) as { error?: string; premium?: boolean }
      if (res.ok && data.premium) {
        setActivationMsg("Grainy+ activated! Welcome to premium.")
        setProfile((p) => (p ? { ...p, isPremium: true } : p))
        setPremium(true)
      } else {
        setActivationMsg(data.error ?? "Activation failed")
      }
    } catch {
      setActivationMsg("Something went wrong")
    }
    setActivating(false)
  }
  if (!profile) {
    return (
      <p className="text-muted mx-auto max-w-xl py-10 text-center">
        Loading...
      </p>
    )
  }
  const isActuallyPremium = isPremium || profile.isPremium

  if (!isActuallyPremium) {
    return (
      <div className="mx-auto max-w-xl space-y-8 py-10">
        <div className="text-center">
          <div className="mb-2 text-5xl">✦</div>
          <h1 className="text-3xl font-bold">Grainy Plus</h1>
          <p className="text-muted mt-2">
            Unlock premium features and support the platform.
          </p>
        </div>

        <div className="space-y-4">
          <div className="border-border bg-card rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">Verification</h2>
                <p className="text-muted mt-1 text-sm">
                  Get a verified blue badge on your profile, posts, and
                  comments.
                  <br />
                  <span className="text-muted/70 text-xs">
                    Only if you are a recognized public figure or work directly
                    with Grainy.
                  </span>
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-accent text-2xl font-bold">$5</p>
                <p className="text-muted text-xs">one-time</p>
              </div>
            </div>
          </div>

          <div className="border-border bg-card rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">Premium + Verification</h2>
                <p className="text-muted mt-1 text-sm">
                  Everything in Verification, plus exclusive green theme, custom
                  profile background, and full Grainy+ badge. Includes verified
                  badge.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-accent text-2xl font-bold">$7</p>
                <p className="text-muted text-xs">one-time</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-border bg-card rounded-lg border p-6">
          <h3 className="mb-3 font-semibold">Activate your purchase</h3>
          <div className="flex gap-2">
            <input
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              placeholder="XXXX-XXXXX"
              className="border-border bg-background focus:border-accent flex-1 rounded-lg border px-3 py-2 text-sm tracking-widest uppercase outline-none"
            />
            <button
              onClick={handleActivate}
              disabled={activating || !activationCode.trim()}
              className="bg-accent shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {activating ? "..." : "Activate"}
            </button>
          </div>
          {activationMsg && (
            <p className="text-accent mt-2 text-sm">{activationMsg}</p>
          )}
        </div>

        <a
          href="https://discord.gg/qps35EfqeX"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#4752c4]"
        >
          <svg
            className="size-4 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          Join Discord to buy access
        </a>
      </div>
    )
  }
  function applyPreset(p: (typeof PRESETS)[number]) {
    setCt((prev) => ({ ...prev, ...p.theme, name: p.name }))
    setActivePreset(p.name)
  }
  function handleChange(field: keyof CustomTheme, value: string | number) {
    const next = { ...ct, [field]: value }
    setCt(next)
    applyCustomTheme(next)
  }
  async function handleSave() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch("/api/premium/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customTheme: ct }),
      })
      if (res.ok) {
        setMsg("Theme saved!")
      } else {
        setMsg("Failed to save")
      }
    } catch {
      setMsg("Failed to save")
    }
    setSaving(false)
  }
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      <div className="flex items-center gap-3">
        <div className="bg-accent/20 flex size-10 items-center justify-center rounded-lg text-lg">
          ✦
        </div>
        <div>
          <h1 className="text-2xl font-bold">Grainy Plus</h1>
          <p className="text-muted text-sm">You&apos;re a premium member</p>
        </div>
      </div>

      {msg && (
        <p className="bg-accent/10 text-accent rounded-lg px-3 py-2 text-sm">
          {msg}
        </p>
      )}

      <div className="border-border bg-card rounded-lg border p-6">
        <h2 className="mb-4 font-semibold">Preset themes</h2>
        <div className="flex flex-wrap gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                activePreset === p.name
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:bg-border/50 hover:text-foreground"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-border bg-card rounded-lg border p-6">
        <h2 className="mb-4 font-semibold">Customize</h2>
        <div className="space-y-4">
          {(
            [
              { key: "name", label: "Theme name" },
              { key: "bg", label: "Background" },
              { key: "fg", label: "Text" },
              { key: "accent", label: "Accent" },
              { key: "accentHover", label: "Accent hover" },
              { key: "accentSecondary", label: "Accent secondary" },
              { key: "accentTertiary", label: "Accent tertiary" },
              { key: "muted", label: "Muted text" },
            ] as const
          ).map(({ key, label }) => (
            <div key={key}>
              <label className="text-muted mb-1 block text-xs font-medium">
                {label}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={ct[key as keyof typeof ct] as string}
                  onChange={(e) =>
                    handleChange(key as keyof CustomTheme, e.target.value)
                  }
                  className="border-border size-9 cursor-pointer rounded-lg border bg-transparent p-0.5"
                />
                <input
                  type="text"
                  value={ct[key as keyof typeof ct] as string}
                  onChange={(e) =>
                    handleChange(key as keyof CustomTheme, e.target.value)
                  }
                  className="border-border bg-background focus:border-accent flex-1 rounded-lg border px-3 py-2 font-mono text-xs outline-none"
                />
              </div>
            </div>
          ))}

          <div>
            <label className="text-muted mb-1 block text-xs font-medium">
              Background style
            </label>
            <select
              value={ct.bgStyle}
              onChange={(e) => handleChange("bgStyle", e.target.value)}
              className="border-border bg-background focus:border-accent w-full rounded-lg border px-3 py-2 text-sm outline-none"
            >
              <option value="solid">Solid</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>

          {ct.bgStyle === "gradient" && (
            <div>
              <label className="text-muted mb-1 block text-xs font-medium">
                Gradient CSS
              </label>
              <input
                type="text"
                value={ct.bgGradient ?? ""}
                onChange={(e) => handleChange("bgGradient", e.target.value)}
                placeholder="linear-gradient(135deg, #0a0a12, #1a1a2e)"
                className="border-border bg-background focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-xs outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted mb-1 block text-xs font-medium">
                Card opacity
              </label>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={ct.cardOpacity}
                onChange={(e) =>
                  handleChange("cardOpacity", parseFloat(e.target.value))
                }
                className="border-border bg-background focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-muted mb-1 block text-xs font-medium">
                Glass blur
              </label>
              <input
                type="text"
                value={ct.glassBlur ?? ""}
                onChange={(e) => handleChange("glassBlur", e.target.value)}
                placeholder="20px"
                className="border-border bg-background focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-xs outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-border bg-card rounded-lg border p-6">
        <h2 className="mb-4 font-semibold">Preview</h2>
        <div
          className="rounded-lg border p-5"
          style={{
            background:
              ct.bgStyle === "gradient" && ct.bgGradient
                ? ct.bgGradient
                : ct.bg,
            color: ct.fg,
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: ct.accent + "33", color: ct.accent }}
            >
              JD
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: ct.fg }}>
                Jane Doe <span className="text-[#1d9bf0]">✓</span>
              </p>
              <p className="text-xs" style={{ color: ct.muted }}>
                @janedoe
              </p>
            </div>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: ct.fg + "dd" }}
          >
            Just joined Grainy! Loving the vibe here.
          </p>
          <div className="mt-3 flex gap-4 text-xs" style={{ color: ct.muted }}>
            <span>12 likes</span>
            <span>4 comments</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-accent w-full rounded-lg py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save theme"}
      </button>
    </div>
  )
}
