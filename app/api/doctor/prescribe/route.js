import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function POST(req) {
    try {
        const store = await connectDB()
        const { patientId, doctorId, medicines } = await req.json()

        if (!patientId || !medicines || medicines.length === 0) {
            return NextResponse.json({ error: "Patient ID and Medicines are required" }, { status: 400 })
        }

        const patientName = store.users?.find(u => u._id === patientId)?.name || "Unknown Patient"
        const doctorName = store.users?.find(u => u._id === doctorId)?.name || "Doctor"

        if (!store.prescriptions) store.prescriptions = []

        const newPrescriptions = medicines.map(p => ({
            _id: `PRES-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            patientId,
            patientName: patientName,
            doctorId,
            doctorName: doctorName,
            medicineName: p.name,
            dosage: p.dosage,
            quantity: p.quantity || 10,
            duration: p.duration,
            instructions: p.frequency || p.instructions,
            date: new Date().toISOString()
        }))

        store.prescriptions.push(...newPrescriptions)

        // Sync to patient user object for longevity
        const patientUserIndex = (store.users || []).findIndex(u => u._id === patientId)
        if (patientUserIndex !== -1) {
            const user = store.users[patientUserIndex]
            if (!user.medicationLog) user.medicationLog = []

            // Add prescriptions
            user.medicationLog.push(...medicines.map(p => ({
                name: p.name,
                dosage: p.dosage,
                quantity: p.quantity || 10,
                date: new Date().toISOString(),
                instructions: p.frequency || p.instructions
            })))
        }

        return NextResponse.json({ success: true, message: "Prescription added successfully" })

    } catch (error) {
        console.error("[AA] Prescribe POST Error:", error)
        return NextResponse.json({ error: "Failed to prescribe medicine" }, { status: 500 })
    }
}
