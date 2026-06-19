"use client"

import { CreatePost } from "@/components/create-post"
import { PostList } from "@/components/post-list"
import { SearchBar } from "@/components/search-bar"
import { fetchJson } from "@/lib/fetch-json"
import { useEffect, useRef, useState } from "react";
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
export function FeedClient({ initialPosts }: { initialPosts: FeedPost[] }) {
const [refreshing, setRefreshing] = useState(false);
const [newCount, setNewCount] = useState(0);
const topIdRef = useRef(initialPosts[0]?.id)
async function checkForNewPosts() {
try {
const data = await fetchJson<{ posts: FeedPost[] }>("/api/feed?limit=5&offset=0");
const latest = data.posts ?? []
if (latest.length > 0 && latest[0]?.id !== topIdRef.current) {
setNewCount((prev) => prev + latest.filter((p) => p.id !== topIdRef.current).length)
}    } catch {      /* ignore */ }  }
useEffect(() => {
const interval = setInterval(checkForNewPosts, 30_000)
function onVisible() {
if (document.visibilityState === "visible") checkForNewPosts()    }
document.addEventListener("visibilitychange", onVisible);
return () => {
clearInterval(interval);
document.removeEventListener("visibilitychange", onVisible)    }  }, [])
async function handleRefresh() {
setRefreshing(true);
window.location.reload()  }
async function handleShowNew() {
window.location.reload();
  }
return (    <div className="space-y-6">      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">        <SearchBar />        <div className="flex gap-2">          <button            onClick={handleRefresh}
disabled={refreshing}
className="rounded-full border border-white/10 px-4 py-3 text-sm text-muted transition hover:bg-white/5 hover:text-foreground disabled:opacity-50"            aria-label="Refresh feed"          >            <svg              className={`size-4 ${refreshing ? "animate-spin" : ""}`}
fill="none"              viewBox="0 0 24 24"              stroke="currentColor"              strokeWidth={2}            >              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />            </svg>          </button>          <CreatePost />        </div>      </div>      {newCount > 0 && (        <button          onClick={handleShowNew}
className="w-full rounded-2xl border border-accent/30 bg-accent/5 py-3 text-sm font-semibold text-accent transition hover:bg-accent/10"        >          Show {newCount} new {newCount === 1 ? "post" : "posts"}        </button>      )}      <PostList        initialPosts={initialPosts}
emptyMessage="Your feed is empty. Add friends and start posting!"      />    </div>
  )
}