import { env } from "@/env"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  if (env.ENVIRONMENT === "development") {
    return NextResponse.json(
      { error: "R2 proxy only available in production" },
      { status: 404 },
    )
  }

  const { key } = await params
  const objectKey = key.join("/")

  const { env: cfEnv } = getCloudflareContext()
  const object = await cfEnv.UPLOADS.get(objectKey)

  if (!object) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const headers = new Headers()
  if (object.httpMetadata?.contentType) {
    headers.set("Content-Type", object.httpMetadata.contentType)
  }
  headers.set("Cache-Control", "public, max-age=31536000, immutable")

  return new NextResponse(object.body, { headers })
}
