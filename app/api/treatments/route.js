import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getTreatmentsByPatient, createTreatment } from "@/lib/mongodb-models"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get("authorization")?.split(" ")[1]
    const user = verifyToken(token)

    let treatments = []
    if (user.role === "patient") {
      treatments = await getTreatmentsByPatient(user.userId)
    }

    return NextResponse.json(treatments)
  } catch (error) {
    console.error("[AA] Treatments GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const token = request.headers.get("authorization")?.split(" ")[1]
    const user = verifyToken(token)

    const data = await request.json()
    const result = await createTreatment({
      ...data,
      patientId: user.userId,
      doctorId: user.role === "doctor" ? user.userId : data.doctorId,
      status: "scheduled",
      startDate: new Date(data.startDate),
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("[AA] Treatments POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
