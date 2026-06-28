import { createEnv } from "@t3-oss/env-nextjs"
import * as z from "zod"

export const env = createEnv({
  server: {
    ENVIRONMENT: z.enum(["development", "production"]).default("development"),

    DATABASE_URL: z.url().optional(),

    DRIZZLE_PROXY_URL: z.url(),
    DRIZZLE_PROXY_TOKEN: z.string(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),

    R2_PUBLIC_URL: z.union([z.url(), z.literal("")]).optional(),
    ADMIN_PASSWORD: z.string(),
  },
  client: {},
  runtimeEnv: {
    ENVIRONMENT: process.env.ENVIRONMENT,

    DATABASE_URL: process.env.DATABASE_URL,
    DRIZZLE_PROXY_URL: process.env.DRIZZLE_PROXY_URL,
    DRIZZLE_PROXY_TOKEN: process.env.DRIZZLE_PROXY_TOKEN,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,

    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
