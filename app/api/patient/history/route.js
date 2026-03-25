import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization")
        const token = authHeader?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || user.userType !== "patient") {
            return NextResponse.json({ error: "Unauthorized patient access" }, { status: 401 })
        }

        const store = await connectDB()
        const patientData = store.users.find(u => u._id === user.userId)

        if (!patientData) {
            return NextResponse.json({ error: "Patient record not found" }, { status: 404 })
        }

        // Return real logs from the patient record
        return NextResponse.json({
            medicationLog: patientData.medicationLog || [],
            testLog: patientData.testLog || [],
            vitals: patientData.vitals || { heartRate: "72 bpm", bloodPressure: "120/80" },
            name: patientData.name,
            id: patientData._id
        })

    } catch (error) {
        console.error("[AA] Patient History API Error:", error)
        return NextResponse.json({ error: "Internal clinical sync failure" }, { status: 500 })
    }
}
