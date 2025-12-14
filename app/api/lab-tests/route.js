import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getLabTestsByPatient, createLabTest } from "@/lib/mongodb-models"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get("authorization")?.split(" ")[1]
    const user = verifyToken(token)

    let tests = []
    if (user.role === "patient") {
      tests = await getLabTestsByPatient(user.userId)
    }

    return NextResponse.json(tests)
  } catch (error) {
    console.error("[AA] Lab Tests GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const token = request.headers.get("authorization")?.split(" ")[1]
    const user = verifyToken(token)

    const data = await request.json()
    const result = await createLabTest({
      ...data,
      patientId: user.userId,
      status: "pending",
      orderDate: new Date(),
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("[AA] Lab Tests POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
