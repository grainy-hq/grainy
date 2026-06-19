"use client"

import { createContext, useContext, useEffect, useState } from "react";
type Theme = "light" | "dark";
export type CustomTheme = {
  name?: string
  bg?: string
  fg?: string
  accent?: string
  accentHover?: string
  accentSecondary?: string
  accentTertiary?: string
  muted?: string
  bgStyle?: string
  bgGradient?: string
  cardOpacity?: number
  glassBlur?: string
}
const ThemeContext = createContext<{
theme: Theme
  isPremium: boolean;
customTheme: CustomTheme | null
  hasCustomTheme: boolean;
toggle: () => void;
setTheme: (t: Theme) => void;
setPremium: (v: boolean) => void;
applyCustomTheme: (ct: CustomTheme | null) => void
}>({
theme: "dark",
  isPremium: false,
  customTheme: null,
  hasCustomTheme: false,
  toggle: () => {},
  setTheme: () => {},
  setPremium: () => {},
  applyCustomTheme: () => {},
})

export function useTheme() {
return useContext(ThemeContext)
}
export function ThemeProvider({ children }: { children: React.ReactNode }) {
const [theme, setThemeState] = useState<Theme>("dark");
const [isPremium, setPremium] = useState(false)

  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null)

  const [mounted, setMounted] = useState(false);
useEffect(() => {
setMounted(true);
const stored = localStorage.getItem("theme") as Theme | null
    const storedPremium = localStorage.getItem("premium") === "true"
    setPremium(storedPremium);
const storedCustom = localStorage.getItem("customTheme");
if (storedCustom) {
try { setCustomTheme(JSON.parse(storedCustom)) } catch {}
    }
if (stored === "light" || stored === "dark") {
setThemeState(stored);
applyTheme(stored, storedPremium, storedCustom)
    } else {
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const t: Theme = prefersDark ? "dark" : "light"
      setThemeState(t);
applyTheme(t, storedPremium, storedCustom)
    }
  }, []);
function applyTheme(t: Theme, premium: boolean, custom?: string | null) {
const base = premium ? `premium-${t}` : t
    document.documentElement.setAttribute("data-theme", base);
if (custom) {
try {
const ct = JSON.parse(custom);
applyCustomCssVars(ct)
      } catch {}
    } else {
document.documentElement.removeAttribute("data-custom-theme")
    }
  }
function applyCustomCssVars(ct: CustomTheme) {
const root = document.documentElement
    root.setAttribute("data-custom-theme", "active");
if (ct.bg) root.style.setProperty("--background", ct.bg);
if (ct.fg) root.style.setProperty("--foreground", ct.fg);
if (ct.accent) root.style.setProperty("--accent", ct.accent);
if (ct.accentHover) root.style.setProperty("--accent-hover", ct.accentHover);
if (ct.accentSecondary) root.style.setProperty("--accent-secondary", ct.accentSecondary);
if (ct.accentTertiary) root.style.setProperty("--accent-tertiary", ct.accentTertiary);
if (ct.muted) root.style.setProperty("--muted", ct.muted)
  }
function clearCustomCssVars() {
const root = document.documentElement
    root.removeAttribute("data-custom-theme");

root.style.removeProperty("--background");
root.style.removeProperty("--foreground");
root.style.removeProperty("--accent");
root.style.removeProperty("--accent-hover");
root.style.removeProperty("--accent-secondary");
root.style.removeProperty("--accent-tertiary");
root.style.removeProperty("--muted")
  }
function setTheme(t: Theme) {
setThemeState(t);
const base = isPremium ? `premium-${t}` : t
    document.documentElement.setAttribute("data-theme", base);
localStorage.setItem("theme", t);
if (customTheme) {
applyCustomCssVars(customTheme)
    }
  }
function handleSetPremium(v: boolean) {
setPremium(v);
const base = v ? `premium-${theme}` : theme
    document.documentElement.setAttribute("data-theme", base);
localStorage.setItem("premium", String(v));
if (!v) {
clearCustomCssVars();
setCustomTheme(null);
localStorage.removeItem("customTheme")
    }
  }
function handleApplyCustomTheme(ct: CustomTheme | null) {
setCustomTheme(ct);
if (ct) {
localStorage.setItem("customTheme", JSON.stringify(ct));
applyCustomCssVars(ct)
    } else {
localStorage.removeItem("customTheme");
clearCustomCssVars()
    }
  }
function toggle() {
setTheme(theme === "light" ? "dark" : "light")
  }
if (!mounted) {
return <>{children}</>
  }
return (
    <ThemeContext.Provider
      value={{
theme,
        isPremium,
        customTheme,
        hasCustomTheme: customTheme !== null,
        toggle,
        setTheme,
        setPremium: handleSetPremium,
        applyCustomTheme: handleApplyCustomTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
