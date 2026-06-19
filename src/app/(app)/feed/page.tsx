import { FeedClient } from "@/components/feed-client"
import { getSession } from "@/lib/auth/session"
import { getFeed } from "@/lib/feed"
import { redirect } from "next/navigation"
export default async function FeedPage() {
const session = await getSession();
if (!session?.user) redirect("/sign-up");
const posts = await getFeed(session.user.id);
function safeDate(d: unknown): string {
if (d instanceof Date && !isNaN(d.getTime())) { return d.toISOString(); }
if (typeof d === "string" || typeof d === "number") { return String(d); }
return new Date().toISOString()
  }
const serialized = posts.map((p) => ({
    ...p,
    createdAt: safeDate(p.createdAt),
  }));
return <FeedClient initialPosts={serialized} />
}
