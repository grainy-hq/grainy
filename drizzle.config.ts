import { env } from "@/env"
import { defineConfig } from "drizzle-kit"

if (!env.DATABASE_URL)
  throw new Error(
    "DATABASE_URL is not defined in the environment variables. Please set it before running drizzle-kit.",
  )

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
