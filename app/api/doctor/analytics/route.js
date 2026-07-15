import { NextResponse } from "next/server"
import { getDB, connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get("authorization")?.split(" ")[1]
    const user = verifyToken(token)

    if (!user || (user.role !== "doctor" && user.userType !== "doctor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getDB()
    
    // Filter appointments for this doctor
    const doctorAppointments = db.appointments.filter(a => a.doctorId === user.userId)
    const completedAppointments = doctorAppointments.filter(a => a.status.toLowerCase() === "completed")
    
    // Unique patients from appointments
    const uniquePatients = new Set(doctorAppointments.map(a => a.patientId))

    // Lab tests ordered by this doctor
    const doctorLabTests = db.labTests ? db.labTests.filter(t => t.orderedBy === user.name) : []
    const pendingLabTests = doctorLabTests.filter(t => t.status.toLowerCase() === "pending")

    // Prescriptions written by this doctor
    const doctorPrescriptions = db.prescriptions ? db.prescriptions.filter(p => p.doctorId === user.userId) : []

    // Fake revenue for chart
    const revenueByMonth = [
      { month: "Jan", revenue: 45000 },
      { month: "Feb", revenue: 52000 },
      { month: "Mar", revenue: 48000 },
      { month: "Apr", revenue: 61000 },
      { month: "May", revenue: 59000 },
      { month: "Jun", revenue: 75000 },
    ]

    return NextResponse.json({
      metrics: {
        totalAppointments: doctorAppointments.length,
        completedAppointments: completedAppointments.length,
        totalPatients: uniquePatients.size,
        pendingLabReports: pendingLabTests.length,
        totalPrescriptions: doctorPrescriptions.length
      },
      revenueByMonth
    })
  } catch (error) {
    console.error("[AA] Doctor Analytics GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
