import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { clearExistingUsers } from "@/lib/mongodb-models"

export async function POST(request) {
    try {
        await connectDB()
        await clearExistingUsers()

        return NextResponse.json({
            success: true,
            message: "All user credentials have been deleted successfully.",
        })
    } catch (error) {
        console.error("[AA] Cleanup error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
