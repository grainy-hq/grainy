"use client"

import { ItunesPicker } from "@/components/itunes-picker"
import { fetchJson } from "@/lib/fetch-json"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
type ItunesTrack = {
trackId: number;
trackName: string;
artistName: string;
previewUrl: string;
artworkUrl100: string
}

type Profile = {
name: string;
username: string | null
  image: string | null
  bio: string | null
  location: string | null
  isPremium: boolean
  profileBackground: string | null
  itunesTrackId: string | null
  itunesTrackName: string | null
  itunesArtistName: string | null
  itunesPreviewUrl: string | null
  itunesArtworkUrl: string | null
}
export default function SettingsPage() {
const [profile, setProfile] = useState<Profile | null>(null)

  const [name, setName] = useState("");
const [bannerUrl, setBannerUrl] = useState("");
const [bio, setBio] = useState("");
const [location, setLocation] = useState("");
const [selectedTrack, setSelectedTrack] = useState<ItunesTrack | null>(null)

  const [saving, setSaving] = useState(false)

  const [message, setMessage] = useState<string | null>(null);
const router = useRouter();
useEffect(() => {
fetchJson<{ profile: Profile }>("/api/profile").then((d) => {
const p = d.profile
        setProfile(p);
        setName(p.name ?? "");
setBannerUrl(p.profileBackground ?? "");
setBio(p.bio ?? "");
setLocation(p.location ?? "");
if (p.itunesTrackId) {
setSelectedTrack({
trackId: Number(p.itunesTrackId),
            trackName: p.itunesTrackName ?? "",
            artistName: p.itunesArtistName ?? "",
            previewUrl: p.itunesPreviewUrl ?? "",
            artworkUrl100: p.itunesArtworkUrl ?? "",
          })
        }
      }).catch(() => setMessage("Failed to load profile"))
  }, []);
async function handleSave(e: React.FormEvent) {
e.preventDefault();
setSaving(true);
setMessage(null);
const body: Record<string, unknown> = { name, bio, location, profileBackground: bannerUrl || null }
if (selectedTrack) {
body.itunesTrackId = String(selectedTrack.trackId);
body.itunesTrackName = selectedTrack.trackName
      body.itunesArtistName = selectedTrack.artistName
      body.itunesPreviewUrl = selectedTrack.previewUrl
      body.itunesArtworkUrl = selectedTrack.artworkUrl100
    } else {
body.itunesTrackId = null
      body.itunesTrackName = null
      body.itunesArtistName = null
      body.itunesPreviewUrl = null
      body.itunesArtworkUrl = null;
}
const res = await fetch("/api/profile", {
method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
if (res.ok) {
setMessage("Profile saved!");
router.refresh()
    } else {
const data = (await res.json()) as { error?: string }
setMessage(data.error ?? "Failed to save")
    }
setSaving(false)
  }
async function handleSignOut() {
await authClient.signOut({
fetchOptions: { onSuccess: () => router.push("/") },
    })
  }
if (!profile) {
return <p className="text-muted">Loading...</p>
  }
return (
    <div className="mx-auto max-w-xl space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-border bg-card p-6">
        {message && (
          <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{message}</p>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">Profile photo</label>
          <div className="flex items-center gap-4">
            {profile.image ? (
              <img src={profile.image} alt="" className="size-16 rounded-full object-cover ring-2 ring-accent/30" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
                {profile.name[0]}
              </div>
            )}
            <label className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm transition hover:bg-border/50">
              Change photo
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
const file = e.target.files?.[0]
                if (!file) return;
                const formData = new FormData();
formData.set("image", file);
const res = await fetch("/api/profile/upload", { method: "POST", body: formData });
if (res.ok) {
const data = (await res.json()) as { url: string }
setProfile({ ...profile, image: data.url });
setMessage("Profile photo updated!")
                } else {
const data = (await res.json()) as { error?: string }
setMessage(data.error ?? "Failed to upload")
                }
              }} />
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Profile banner</label>
          {bannerUrl && (
            <div className="relative mb-3 overflow-hidden rounded-xl bg-white/5">
              <img src={bannerUrl} alt="Banner preview" className="h-32 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
              <button type="button" onClick={() => setBannerUrl("")} className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur transition hover:bg-black/80">Remove</button>
            </div>
          )}
          <input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://example.com/banner.jpg" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
          <p className="mt-1 text-xs text-muted">Paste an image URL to set as your profile banner.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Display name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Profile song</label>
          <ItunesPicker selected={selectedTrack} onSelect={setSelectedTrack} />
        </div>

        <button type="submit" disabled={saving} className="accent-btn w-full rounded-full py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <button onClick={handleSignOut} className="w-full rounded-full border border-border py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10">
        Sign out
      </button>
    </div>
  )
}
