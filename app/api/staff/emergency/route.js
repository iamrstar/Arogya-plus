import { NextResponse } from "next/server"
import { getDB, connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
    try {
        await connectDB()
        const token = request.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || user.role === "Patient") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }

        const store = getDB()
        
        return NextResponse.json({
            ambulances: store.ambulances || [],
            emergencyCases: store.emergencyCases || []
        })
    } catch (error) {
        console.error("[AA] Emergency GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectDB()
        const token = request.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || user.role === "Patient") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
        }

        const store = getDB()
        const { action, callerName, phone, location, condition, ambulanceId, caseId } = await request.json()

        if (action === "DISPATCH_AMBULANCE") {
            const ambulance = store.ambulances.find(a => a._id === ambulanceId)
            if (!ambulance) return NextResponse.json({ error: "Ambulance not found" }, { status: 404 })

            if (ambulance.status !== "Available") {
                return NextResponse.json({ error: "Ambulance is not available" }, { status: 400 })
            }

            ambulance.status = "On Duty"
            ambulance.location = location || "En Route"

            const newCase = {
                _id: `EMR-${Date.now()}`,
                callerName,
                phone,
                location,
                condition,
                assignedAmbulance: ambulanceId,
                status: "Dispatched",
                timestamp: new Date().toISOString()
            }
            store.emergencyCases.push(newCase)

            return NextResponse.json({ success: true, case: newCase })
        }

        if (action === "ARRIVED") {
            const emergencyCase = store.emergencyCases.find(c => c._id === caseId)
            if (!emergencyCase) return NextResponse.json({ error: "Case not found" }, { status: 404 })

            emergencyCase.status = "Arrived at ER"
            emergencyCase.arrivedAt = new Date().toISOString()

            // Free the ambulance
            const ambulance = store.ambulances.find(a => a._id === emergencyCase.assignedAmbulance)
            if (ambulance) {
                ambulance.status = "Available"
                ambulance.location = "Hospital Base"
            }

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    } catch (error) {
        console.error("[AA] Emergency POST error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
