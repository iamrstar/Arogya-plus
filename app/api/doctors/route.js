import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getAllDoctors } from "@/lib/mongodb-models"

export async function GET() {
    try {
        await connectDB()
        const doctors = await getAllDoctors()

        // Sanitize sensitive data
        const sanitizedDoctors = doctors.map(d => ({
            id: d._id,
            name: d.name,
            specialization: d.specialization || d.speciality || "General Medicine",
            experience: d.experience,
            image: d.image
        }))

        return NextResponse.json(sanitizedDoctors)
    } catch (error) {
        console.error("[AA] Doctors GET error:", error)
        return NextResponse.json({ error: "Failed to fetch clinicians" }, { status: 500 })
    }
}
