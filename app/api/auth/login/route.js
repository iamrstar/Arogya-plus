import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { findUserByEmail } from "@/lib/mongodb-models"

function generateToken(user) {
  const payload = {
    userId: user._id?.toString() || user.id,
    email: user.email,
    userType: user.userType,
    role: user.role,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export async function POST(request) {
  try {
    await connectDB()

    const { email, password, userType } = await request.json()

    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: "Email, password, and user type are required" },
        { status: 400 }
      )
    }

    let user = await findUserByEmail(email)

    // Admin seed fallback — ensure admin always exists in dev
    if (!user && email === "admin@arogya.com") {
      const store = await connectDB()
      const adminUser = { _id: "ADMIN001", name: "Hospital Admin", userType: "admin", email: "admin@arogya.com", password: "Admin@123", role: "Super Admin" }
      if (!store.users.find(u => u.email === "admin@arogya.com")) {
        store.users.push(adminUser)
      }
      user = adminUser
    }

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (user.userType !== userType.toLowerCase()) {
      return NextResponse.json({ error: "Invalid user type for this account" }, { status: 401 })
    }

    const token = generateToken(user)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
      userType: user.userType,
      role: user.role,
    })
  } catch (error) {
    console.error("[AA] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
