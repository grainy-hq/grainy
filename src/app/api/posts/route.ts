import { jsonError, jsonOk } from "@/lib/api/response"
import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db/client"
import { post, postImage } from "@/lib/db/schema"
import { uploadImage } from "@/lib/storage"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const formData = await request.formData()
  const caption = (formData.get("caption") as string | null)?.trim() ?? ""
  const files = formData.getAll("images") as File[]

  const validFiles = files.filter((f) => f.size > 0)
  if (!caption && validFiles.length === 0) {
    return jsonError("Post must have a caption or at least one image")
  }

  if (validFiles.length > 10) {
    return jsonError("Maximum 10 images per post")
  }

  const postId = crypto.randomUUID()

  const imageUrls: string[] = []
  for (const file of validFiles) {
    try {
      const url = await uploadImage(file)
      imageUrls.push(url)
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "Upload failed")
    }
  }

  await db.insert(post).values({
    id: postId,
    authorId: session.user.id,
    caption: caption || null,
  })

  if (imageUrls.length > 0) {
    await db.insert(postImage).values(
      imageUrls.map((url, i) => ({
        id: crypto.randomUUID(),
        postId,
        url,
        sortOrder: i,
      })),
    )
  }

  return jsonOk({ id: postId }, 201)
}
