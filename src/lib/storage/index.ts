import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { env } from "@/env"
import { getCloudflareContext } from "@opennextjs/cloudflare"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

const MAX_SIZE = 10 * 1024 * 1024

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  }
  return map[mimeType] ?? ".jpg"
}

export function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Only JPEG, PNG, WebP, and GIF images are allowed"
  }
  if (file.size > MAX_SIZE) {
    return "Image must be smaller than 10MB"
  }
  return null
}

export async function uploadImage(file: File): Promise<string> {
  const error = validateImage(file)
  if (error) throw new Error(error)

  const ext = getExtension(file.type)
  const filename = `${crypto.randomUUID()}${ext}`
  const buffer = await file.arrayBuffer()

  if (env.ENVIRONMENT === "development") {
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })
    await writeFile(path.join(uploadsDir, filename), Buffer.from(buffer))
    return `/uploads/${filename}`
  }

  const { env: cfEnv } = getCloudflareContext()
  const bucket = cfEnv.UPLOADS
  const key = `uploads/${filename}`

  await bucket.put(key, buffer, {
    httpMetadata: { contentType: file.type },
  })

  if (env.R2_PUBLIC_URL) {
    return `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`
  }

  return `/api/uploads/${key}`
}
