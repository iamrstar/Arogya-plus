import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getAppointmentsByPatient, getAppointmentsByDoctor, createAppointment } from "@/lib/mongodb-models"
import { verifyToken } from "@/lib/auth"
import { sendAppointmentEmail } from "@/lib/mail-utils"

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get("authorization")?.split(" ")[1]
    const user = verifyToken(token)

    let appointments = []
    const userRole = user.userType || user.role

    if (userRole === "patient") {
      appointments = await getAppointmentsByPatient(user.userId)
    } else if (userRole === "doctor") {
      appointments = await getAppointmentsByDoctor(user.userId)
    }

    // Normalize data so date filtering works in the Doctor Portal
    appointments = appointments.map(app => {
      let dateString = app.date
      if (!dateString && app.appointmentDate) {
        // Handle cases where appointmentDate is a string or Date object
        const d = new Date(app.appointmentDate)
        dateString = d.toISOString().split('T')[0]
      }
      return {
        ...app,
        date: dateString || "N/A",
        time: app.time || "10:00 AM",
        status: app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : "Scheduled"
      }
    })

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
    const appointmentData = {
      ...data,
      patientId: user.userId,
      patientName: user.name,
      status: "scheduled",
      appointmentDate: new Date(data.appointmentDate),
    }

    const result = await createAppointment(appointmentData)

    // Send confirmation email
    if (user.email) {
      await sendAppointmentEmail(user.email, {
        patientName: user.name || "Patient",
        doctorName: data.doctorName || "Doctor",
        appointmentDate: appointmentData.appointmentDate,
        department: data.department || "General",
      })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("[AA] Appointments POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
