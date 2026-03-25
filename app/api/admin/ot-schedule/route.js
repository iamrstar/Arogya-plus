import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET() {
    const store = await connectDB()
    return NextResponse.json(store.otSchedule || [])
}

export async function POST(request) {
    const store = await connectDB()
    const { patient, patientId, surgeon, procedure, otRoom, time, department, bedNumber, cost } = await request.json()

    if (!patient || !surgeon || !procedure) {
        return NextResponse.json({ error: "Patient, surgeon, and procedure are required" }, { status: 400 })
    }

    const newOT = {
        _id: `OT${Date.now()}`,
        patient,
        patientId: patientId || null,
        surgeon,
        procedure,
        otRoom: otRoom || "OT-1",
        time: time || "TBD",
        status: "Scheduled",
        department: department || "General",
        bedNumber: bedNumber || null,
        cost: cost || 0
    }

    if (!store.otSchedule) store.otSchedule = []
    store.otSchedule.push(newOT)

    return NextResponse.json(newOT)
}

export async function PATCH(request) {
    const store = await connectDB()
    const { otId, status, cost } = await request.json()
    const ot = store.otSchedule?.find(o => o._id === otId)
    if (!ot) return NextResponse.json({ error: "OT entry not found" }, { status: 404 })

    if (status) ot.status = status
    if (cost !== undefined) ot.cost = cost

    return NextResponse.json(ot)
}
