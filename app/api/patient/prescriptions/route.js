import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(req) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || user.userType !== "patient") {
            return NextResponse.json({ error: "Access denied: Patients only" }, { status: 403 })
        }

        const store = await connectDB()
        const allPrescriptions = store.prescriptions || []

        // Filter for this patient
        const patientPrescriptions = allPrescriptions.filter(p => p.patientId === user.userId)
        const patientTests = store.labTests?.filter(t => t.patientId === user.userId) || []

        // Group by appointmentId / Session (Reuse clinician grouping logic)
        const grouped = patientPrescriptions.reduce((acc, p) => {
            const sessionId = p.appointmentId || `LEGACY-${p.date}-${p.patientId}`
            if (!acc[sessionId]) {
                acc[sessionId] = {
                    sessionId,
                    appointmentId: p.appointmentId,
                    patientId: p.patientId,
                    doctorName: p.doctorName || "Primary Clinician",
                    diagnosis: p.diagnosis || "General Consultation",
                    date: p.date,
                    createdAt: p.createdAt,
                    medicines: [],
                    tests: []
                }
            }
            acc[sessionId].medicines.push({
                _id: p._id,
                name: p.medicineName,
                dosage: p.dosage,
                quantity: p.quantity,
                duration: p.duration,
                instructions: p.instructions
            })
            return acc
        }, {})

        // Add tests to their respective sessions
        patientTests.forEach(t => {
            const sessionId = t.appointmentId // Note: Tests always have appointmentId now
            if (sessionId && grouped[sessionId]) {
                grouped[sessionId].tests.push({
                    _id: t._id,
                    name: t.testName,
                    category: t.category,
                    status: t.status,
                    result: t.result,
                    referenceRange: t.referenceRange,
                    notes: t.notes,
                    resultDate: t.resultDate
                })
            }
        })

        // Sort by date latest first
        const result = Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date))

        return NextResponse.json(result)

    } catch (error) {
        console.error("[AA] Patient Prescriptions Sync Error:", error)
        return NextResponse.json({ error: "Clinical vault synchronization failed" }, { status: 500 })
    }
}
