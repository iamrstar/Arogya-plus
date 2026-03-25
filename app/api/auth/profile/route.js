import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getUserById, updateUser } from "@/lib/mongodb-models"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
    try {
        await connectDB()
        const token = request.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user) {
            return NextResponse.json({ error: "Unauthorized clinical access" }, { status: 401 })
        }

        const userData = await getUserById(user.userId)
        if (!userData) {
            return NextResponse.json({ error: "Identity not found" }, { status: 404 })
        }

        // Don't send sensitive data
        const { password, ...safeData } = userData
        return NextResponse.json(safeData)
    } catch (error) {
        console.error("[AA] Profile GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request) {
    try {
        await connectDB()
        const token = request.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user) {
            return NextResponse.json({ error: "Unauthorized clinical access" }, { status: 401 })
        }

        const updates = await request.json()

        // Prevent sensitive field updates via this route
        delete updates.password
        delete updates.role
        delete updates.userType
        delete updates._id
        delete updates.email

        const result = await updateUser(user.userId, updates)

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: "Update failed or no changes made" }, { status: 400 })
        }

        return NextResponse.json({ success: true, message: "Clinical profile updated" })
    } catch (error) {
        console.error("[AA] Profile PATCH error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
