import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { updateNotification } from "@/lib/mongodb-models"

export async function PATCH(request, { params }) {
  try {
    await connectDB()
    const { id } = params
    const { read } = await request.json()

    await updateNotification(id, { read })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[AA] Notification PATCH error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    const { id } = params
    const db = require("@/lib/mongodb").getDB()

    await db.collection("notifications").deleteOne({
      _id: new (require("mongodb").ObjectId)(id),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[AA] Notification DELETE error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
