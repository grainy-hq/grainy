import { createEnv } from "@t3-oss/env-nextjs"
import * as z from "zod"

export const env = createEnv({
  server: {
    ENVIRONMENT: z.enum(["development", "production"]).default("development"),

    // This environment variable is only needed for the drizzle-kit CLI, not for the application itself.
    DATABASE_URL: z.url().optional(),

    DRIZZLE_PROXY_URL: z.url(),
    DRIZZLE_PROXY_TOKEN: z.string(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
  },
  client: {},
  runtimeEnv: {
    ENVIRONMENT: process.env.ENVIRONMENT,

    DATABASE_URL: process.env.DATABASE_URL,
    DRIZZLE_PROXY_URL: process.env.DRIZZLE_PROXY_URL,
    DRIZZLE_PROXY_TOKEN: process.env.DRIZZLE_PROXY_TOKEN,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  },
})
