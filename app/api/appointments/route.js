import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getAppointmentsByPatient, getAppointmentsByDoctor, createAppointment } from "@/lib/mongodb-models"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get("authorization")?.split(" ")[1]
    const user = verifyToken(token)

    let appointments = []
    if (user.role === "patient") {
      appointments = await getAppointmentsByPatient(user.userId)
    } else if (user.role === "doctor") {
      appointments = await getAppointmentsByDoctor(user.userId)
    }

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("[AA] Appointments GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const token = request.headers.get("authorization")?.split(" ")[1]
    const user = verifyToken(token)

    const data = await request.json()
    const result = await createAppointment({
      ...data,
      patientId: user.userId,
      status: "scheduled",
      appointmentDate: new Date(data.appointmentDate),
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("[AA] Appointments POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
