"use client"

import { fetchJson } from "@/lib/fetch-json"
import { PostList } from "@/components/post-list"
import { ProfileMusicPlayer } from "@/components/profile-music-player"
import { VerifiedBadge } from "@/components/verified-badge"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react";
type ProfileData = {
id: string;
name: string;
username: string;
bio: string | null;
location: string | null;
image: string | null;
isPremium: boolean;
profileBackground: string | null;
customTheme: Record<string, unknown> | null;
isVerified: boolean;
itunesTrackName: string | null;
itunesArtistName: string | null;
itunesPreviewUrl: string | null;
itunesArtworkUrl: string | null;
postCount: number;
followerCount: number;
followingCount: number;
isOwnProfile: boolean;
friendshipStatus: "none" | "pending_sent" | "pending_received" | "friends";
  friendRequestId: string | null;
}
type FeedPost = {
id: string;
caption: string | null;
createdAt: string;
author: {
id: string;
name: string;
username: string | null;
image: string | null;
isVerified: boolean;
isPremium: boolean;
}
images: { id: string
url: string
sortOrder: number }[]
wowCount: number;
commentCount: number;
hasWowed: boolean;
hasFavorited: boolean}
export default function ProfilePage() {
const params = useParams<{ username: string }>()

const router = useRouter()

const [profile, setProfile] = useState<ProfileData | null>(null)

const [posts, setPosts] = useState<FeedPost[]>([])

const [loading, setLoading] = useState(true);
const [actionPending, setActionPending] = useState(false);
const [customCss, setCustomCss] = useState<Record<string, string> | null>(null);

  useEffect(() => {
fetchJson<{ profile: ProfileData
posts: FeedPost[] }>(      `/api/profile/${params.username}`,    )      .then((d) => {
setProfile(d.profile);
setPosts(          (d.posts ?? []).map((p) => ({              ...p,              createdAt:                typeof p.createdAt === "string"                  ? p.createdAt                  : new Date(p.createdAt).toISOString(),          })),        )
if (d.profile.customTheme) {
const ct = d.profile.customTheme as {
bg?: string
fg?: string
accent?: string
accentHover?: string;
            accentSecondary?: string;
accentTertiary?: string
muted?: string;
            bgStyle?: string
bgGradient?: string
cardOpacity?: number
glassBlur?: string;
}
const css: Record<string, string> = {}
if (ct.bg) {
      css["--background"] = ct.bg;
            document.documentElement.style.setProperty("--background", ct.bg);
          }
if (ct.fg) css["--foreground"] = ct.fg;
if (ct.accent) css["--accent"] = ct.accent;
if (ct.accentHover) css["--accent-hover"] = ct.accentHover;
if (ct.accentSecondary) css["--accent-secondary"] = ct.accentSecondary;
if (ct.accentTertiary) css["--accent-tertiary"] = ct.accentTertiary;
if (ct.muted) css["--muted"] = ct.muted;
if (ct.bgStyle === "glass") {
const opacity = ct.cardOpacity ?? 0.65;
const blur = ct.glassBlur ?? "20px";
            css["--card"] = `rgba(10, 10, 18, ${opacity})`;
            css["--card-strong"] = `rgba(10, 10, 18, ${Math.min(opacity + 0.2, 0.95)})`;
            css["--profile-card-blur"] = blur;
          } else if (ct.bgStyle === "gradient" && ct.bgGradient) {
css["--background"] = ct.bgGradient;
            document.documentElement.style.setProperty("--background", ct.bgGradient);
          }
setCustomCss(css);
        }
      })
      .catch(() => router.push("/feed"))
      .finally(() => setLoading(false));
return () => {
    document.documentElement.style.removeProperty("--background");
    };
  }, [params.username, router]);
async function sendFriendRequest() {
if (!profile) return;
    setActionPending(true);
await fetch("/api/friends/requests", {
method: "POST",      headers: { "Content-Type": "application/json" },      body: JSON.stringify({ userId: profile.id }),    });
setProfile({ ...profile, friendshipStatus: "pending_sent" });
setActionPending(false);
  }
async function cancelFriendRequest() {
if (!profile || !profile.friendRequestId) return;
    setActionPending(true);
await fetch(`/api/friends/requests/${profile.friendRequestId}/decline`, {
method: "POST",    });
setProfile({ ...profile, friendshipStatus: "none", friendRequestId: null });
setActionPending(false);
  }
async function acceptFriendRequest() {
if (!profile || !profile.friendRequestId) return;
    setActionPending(true);
await fetch(`/api/friends/requests/${profile.friendRequestId}/accept`, {
method: "POST",    });
setProfile({ ...profile, friendshipStatus: "friends", friendRequestId: null });
setActionPending(false);
router.refresh();
  }
async function declineFriendRequest() {
if (!profile || !profile.friendRequestId) return;
    setActionPending(true);
await fetch(`/api/friends/requests/${profile.friendRequestId}/decline`, {
method: "POST",    });
setProfile({ ...profile, friendshipStatus: "none", friendRequestId: null });
setActionPending(false);
  }
async function removeFriend() {
if (!profile) return;
    setActionPending(true);
await fetch("/api/friends/remove", {
method: "POST",      headers: { "Content-Type": "application/json" },      body: JSON.stringify({ userId: profile.id }),    });
setProfile({ ...profile, friendshipStatus: "none" });
setActionPending(false)  }
if (loading || !profile) {
return <p className="text-muted">Loading profile...</p>  }
return (    <div className="space-y-5" style={customCss ?? undefined}>      <div        className="rounded-2xl border border-border p-5 sm:p-6 relative overflow-hidden"        style={{          ...(customCss?.["--card"]            ? { backdropFilter: customCss?.["--profile-card-blur"] ?? "blur(20px)", WebkitBackdropFilter: customCss?.["--profile-card-blur"] ?? "blur(20px)" }            : {}),          ...(profile.profileBackground            ? { backgroundImage: `url(${profile.profileBackground})`, backgroundSize: "cover", backgroundPosition: "center" }            : customCss?.["--profile-bg"] ? { background: customCss?.["--profile-bg"] }            : {}),        }}      >        {profile.profileBackground && (          <div className="absolute inset-0 bg-card/80 backdrop-blur-sm" />        )}        <div className="relative z-10 flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">          {profile.image ? (            <img              src={profile.image}
alt={profile.name}
className="size-24 rounded-full object-cover ring-2 ring-accent/30"            />          ) : (            <div className="flex size-24 items-center justify-center rounded-full bg-accent/20 text-3xl font-bold text-accent">              {profile.name[0]}            </div>          )}          <div className="min-w-0 flex-1">            <h1 className="flex items-center justify-center gap-2 text-2xl font-bold sm:justify-start">              {profile.name}              {profile.isPremium && (                <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent uppercase tracking-wider">                  ✦ Plus                </span>              )}              {profile.isVerified && <VerifiedBadge className="size-5" />}            </h1>            <p className="text-muted">@{profile.username}</p>            {profile.location && (              <p className="mt-1 text-sm text-muted">{profile.location}</p>            )}            {profile.bio && (              <p className="mt-3 text-sm leading-relaxed">{profile.bio}</p>            )}            <div className="mt-4 flex justify-center gap-6 sm:justify-start">              <div className="text-center">                <p className="text-lg font-bold">{profile.postCount}</p>                <p className="text-xs text-muted">Posts</p>              </div>              <div className="text-center">                <p className="text-lg font-bold">{profile.followerCount}</p>                <p className="text-xs text-muted">Followers</p>              </div>              <div className="text-center">                <p className="text-lg font-bold">{profile.followingCount}</p>                <p className="text-xs text-muted">Following</p>              </div>            </div>            {!profile.isOwnProfile && (              <div className="mt-4 flex items-center justify-center gap-2 sm:justify-start">                {profile.friendshipStatus === "none" && (                  <button                    onClick={sendFriendRequest}
disabled={actionPending}
className="accent-btn rounded-full px-6 py-2 text-sm font-semibold text-white"                  >                    Add friend                  </button>                )}                {profile.friendshipStatus === "pending_sent" && (                  <>                    <span className="text-sm text-muted">Request sent</span>                    <button                      onClick={cancelFriendRequest}
disabled={actionPending}
className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-muted transition hover:bg-white/5"                    >                      Cancel                    </button>                  </>                )}                {profile.friendshipStatus === "pending_received" && (                  <>                    <span className="text-sm text-accent">Wants to connect</span>                    <button                      onClick={acceptFriendRequest}
disabled={actionPending}
className="accent-btn rounded-full px-4 py-1.5 text-xs font-semibold text-white"                    >                      Accept                    </button>                    <button                      onClick={declineFriendRequest}
disabled={actionPending}
className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-muted transition hover:bg-white/5"                    >                      Decline                    </button>                  </>                )}                {profile.friendshipStatus === "friends" && (                  <>                    <span className="flex items-center gap-1 text-sm text-accent">                      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">                        <path d="M9 11l3 3L22 4l2 2L12 18 5 11l2-2z" />                      </svg>                      Friends                    </span>                    <button                      onClick={removeFriend}
disabled={actionPending}
className="rounded-full border border-red-500/20 px-4 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"                    >                      Remove friend                    </button>                  </>                )}              </div>            )}          </div>        </div>      </div>      {profile.itunesPreviewUrl && (        <ProfileMusicPlayer          trackName={profile.itunesTrackName}
artistName={profile.itunesArtistName}
previewUrl={profile.itunesPreviewUrl}
artworkUrl={profile.itunesArtworkUrl}
autoPlay={!profile.isOwnProfile}        />      )}      <div>        <h2 className="mb-4 text-lg font-semibold">Posts</h2>        <PostList initialPosts={posts} emptyMessage="No posts yet" />      </div>    </div>  )}