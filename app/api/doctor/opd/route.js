import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET(req) {
    try {
        const store = await connectDB()
        const { searchParams } = new URL(req.url)
        const doctorId = searchParams.get("doctorId")

        if (!doctorId) {
            return NextResponse.json({ error: "Doctor ID required" }, { status: 400 })
        }

        // Filter OPD queue for this specific doctor and join with user data for history
        const queue = (store.opdQueue || [])
            .filter(p => p.doctorId === doctorId)
            .map(p => {
                const userRecord = store.users?.find(u => u._id === p._id || u._id === p.patientId)
                return {
                    ...p,
                    medicationLog: userRecord?.medicationLog || [],
                    testLog: userRecord?.testLog || [],
                    vitals: userRecord?.vitals || { heartRate: "72 bpm", bloodPressure: "120/80" }
                }
            })
        return NextResponse.json(queue)
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch OPD queue" }, { status: 500 })
    }
}
