import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { ExploreClient } from "./explore-client"

export default async function ExplorePage() {
  const session = await getSession()
  if (!session?.user) redirect("/sign-up")
  return <ExploreClient />
}
