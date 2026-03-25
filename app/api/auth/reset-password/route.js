import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyOTP, getUserByEmail, updatePassword } from "@/lib/mongodb-models"

export async function POST(request) {
    try {
        await connectDB()
        const { email, otp, newPassword } = await request.json()

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: "Email, OTP and new password are required" }, { status: 400 })
        }

        // 1. Verify OTP
        const isOtpValid = await verifyOTP(email, otp)
        if (!isOtpValid) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
        }

        // 2. Check if user exists
        const user = await getUserByEmail(email)
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // 3. Update password (in a real app, hash it)
        await updatePassword(email, newPassword)

        return NextResponse.json({ message: "Password reset successful" })
    } catch (error) {
        console.error("[AA] Reset Password error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
