import { env } from "@/env"
import { drizzle } from "drizzle-orm/pg-proxy"
import z from "zod"

const authHeader = `Bearer ${env.DRIZZLE_PROXY_TOKEN}`

const drizzleProxyResponseSchema = z.object({
  data: z.array(z.record(z.string(), z.unknown())),
})

export const db = drizzle(async (sql, params, method) => {
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

    const payload = await response.json()
    const parseResult = drizzleProxyResponseSchema.safeParse(payload)

    if (!parseResult.success) {
      console.error("Invalid response from pg proxy server: ", payload)
      throw new Error("Invalid response from pg proxy server")
    }

    return { rows: parseResult.data.data }
  } catch (e: unknown) {
    console.error("Error from pg proxy server: ", e)
    return { rows: [] }
  }
})
