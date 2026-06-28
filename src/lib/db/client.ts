import { env } from "@/env"
import * as schema from "@/lib/db/schema"
import { drizzle } from "drizzle-orm/pg-proxy"

const authHeader = `Bearer ${env.DRIZZLE_PROXY_TOKEN}`

export const db = drizzle(
  async (sql, params, method) => {
    try {
      const response = await fetch(env.DRIZZLE_PROXY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          sql,
          params,
          method,
        }),
        cache: "no-store",
      })

      if (!response.ok)
        throw new Error(
          `Request failed with status ${response.status}: ${response.statusText}`,
        )

      const rows: unknown[] = await response.json()
      return { rows }
    } catch (e: unknown) {
      console.error("Error from pg proxy server: ", e)
      throw e
    }
  },
  { schema },
)
