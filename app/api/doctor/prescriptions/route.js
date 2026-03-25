import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(req) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || user.userType !== "doctor") {
            return NextResponse.json({ error: "Access denied: Clinicians only" }, { status: 403 })
        }

        const store = await connectDB()
        const allPrescriptions = store.prescriptions || []

        // Filter for this doctor
        const doctorPrescriptions = allPrescriptions.filter(p => p.doctorId === user.userId)

        // Group by appointmentId / Session
        const grouped = doctorPrescriptions.reduce((acc, p) => {
            const sessionId = p.appointmentId || `LEGACY-${p.date}-${p.patientId}`
            if (!acc[sessionId]) {
                acc[sessionId] = {
                    sessionId,
                    appointmentId: p.appointmentId,
                    patientId: p.patientId,
                    patientName: p.patientName,
                    diagnosis: p.diagnosis,
                    date: p.date,
                    createdAt: p.createdAt,
                    medicines: []
                }
            }
            acc[sessionId].medicines.push({
                name: p.medicineName,
                dosage: p.dosage,
                instructions: p.instructions
            })
            return acc
        }, {})

        // Sort by date latest first
        const result = Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date))

        return NextResponse.json(result)

    } catch (error) {
        console.error("[AA] Prescriptions Archive Error:", error)
        return NextResponse.json({ error: "Clinical archive synchronization failed" }, { status: 500 })
    }
}
