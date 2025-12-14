import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getNotificationsByUser } from "@/lib/mongodb-models"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get("authorization")?.split(" ")[1]
    const user = verifyToken(token)

    const notifications = await getNotificationsByUser(user.userId)

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("[AA] Notifications GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
