import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET() {
    const store = await connectDB()
    return NextResponse.json(store.beds || [])
}

export async function PATCH(request) {
    const store = await connectDB()
    const { bedId, action, patientName, patientId } = await request.json()

    const bed = store.beds?.find(b => b._id === bedId)
    if (!bed) return NextResponse.json({ error: "Bed not found" }, { status: 404 })

    if (action === "release") {
        bed.status = "Available"
        bed.patientId = null
        bed.patientName = null
        bed.admissionDate = null
        // Also remove from admitted patients
        if (store.admittedPatients) {
            store.admittedPatients = store.admittedPatients.filter(p => p.bed !== bed.bedNumber)
        }
    } else if (action === "assign") {
        bed.status = "Occupied"
        bed.patientName = patientName
        bed.patientId = patientId || `ADM${Date.now()}`
        bed.admissionDate = new Date().toISOString().split('T')[0]
    } else if (action === "transfer") {
        // Transfer patient from this bed to a target bed in another department
        const { targetBedId } = await request.json().catch(() => ({}))
        const targetBed = store.beds?.find(b => b._id === (request._targetBedId || targetBedId))
        // Release old bed
        const oldPatientName = bed.patientName
        const oldPatientId = bed.patientId
        bed.status = "Available"
        bed.patientId = null
        bed.patientName = null
        bed.admissionDate = null
        return NextResponse.json({ success: true, releasedBed: bed.bedNumber, patient: oldPatientName, patientId: oldPatientId })
    }

    return NextResponse.json(bed)
}
