import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { user } from "@/lib/db/schema"
import { uploadImage, validateImage } from "@/lib/storage"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const formData = await request.formData()
  const file = formData.get("image") as File | null
  if (!file) return jsonError("No image provided", 400)

  const error = validateImage(file)
  if (error) return jsonError(error, 400)

  const url = await uploadImage(file)

  await db.update(user).set({ image: url }).where(eq(user.id, session.user.id))

  return jsonOk({ url })
}
