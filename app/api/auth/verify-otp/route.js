import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyOTP } from "@/lib/mongodb-models"

export async function POST(request) {
    try {
        await connectDB()
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
        }

        const isValid = await verifyOTP(email, otp, false)

        if (isValid) {
            return NextResponse.json({ success: true, message: "OTP verified successfully" })
        } else {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
        }
    } catch (error) {
        console.error("[AA] Verify OTP error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
