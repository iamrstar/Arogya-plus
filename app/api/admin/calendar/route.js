import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET() {
    const store = await connectDB()

    // Normalize appointments
    const appointments = (store.appointments || []).map(apt => ({
        id: apt._id,
        title: `Apt: ${apt.patientName}`,
        date: apt.date,
        time: apt.time,
        type: "Appointment",
        color: "#3b82f6", // Blue
        doctor: apt.doctorName,
        details: apt.type
    }))

    // Normalize OT schedule
    const otSchedule = (store.otSchedule || []).map(ot => {
        // OT schedule usually has a range like "08:00 AM — 10:30 AM"
        // We'll just take the start time or assume current logic
        // For simplicity in a mock, we'll assign them to "2026-03-20" if no date is present
        return {
            id: ot._id,
            title: `OT: ${ot.patient}`,
            date: "2026-03-20", // Defaulting to tomorrow for demo
            time: ot.time.split(" — ")[0],
            type: "OT",
            color: "#ef4444", // Red
            doctor: ot.surgeon,
            details: ot.procedure
        }
    })

    const events = [...appointments, ...otSchedule]
    return NextResponse.json(events)
}
