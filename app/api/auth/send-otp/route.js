import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { createOTP } from "@/lib/mongodb-models"
import { sendOTPEmail } from "@/lib/mail-utils"

export async function POST(request) {
    try {
        await connectDB()
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // Save OTP to database
        await createOTP(email, otp)

        // Send OTP via email
        const emailResult = await sendOTPEmail(email, otp)

        if (!emailResult.success) {
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: "OTP sent successfully to " + email,
        })
    } catch (error) {
        console.error("[AA] Send OTP error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
