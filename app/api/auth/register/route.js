import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { findUserByEmail, createUser, verifyOTP } from "@/lib/mongodb-models"

function generateId(prefix) {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}${timestamp}${random}`
}

export async function POST(request) {
  try {
    await connectDB()

    const data = await request.json()
    const { userType, email, password, name, phone, otp, ...additionalData } = data

    if (!userType || !email || !password || !name || !phone || !otp) {
      return NextResponse.json({ error: "Required fields missing (including OTP)" }, { status: 400 })
    }

    // Verify OTP
    const isOtpValid = await verifyOTP(email, otp)
    if (!isOtpValid) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 })
    }

    // Create new user with enhanced data
    const newUser = {
      _id: generateId(userType === "doctor" ? "DOC" : userType === "patient" ? "PAT" : "STAFF"),
      name,
      email: email.toLowerCase(),
      password, // In a real app, hash this!
      userType: userType.toLowerCase(),
      role: data.role || userType.toLowerCase(),
      phone,
      isVerified: true,
      ...additionalData,
    }

    await createUser(newUser)

    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully after OTP verification",
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[AA] Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
