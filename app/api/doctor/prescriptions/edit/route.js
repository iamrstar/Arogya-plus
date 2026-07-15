import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function PUT(req) {
    try {
        const store = await connectDB()
        const { sessionId, medicines } = await req.json()

        if (!sessionId || !medicines) {
            return NextResponse.json({ error: "Session ID and medicines are required" }, { status: 400 })
        }

        // We need to delete all existing prescriptions for this session and insert the new ones
        if (store.prescriptions) {
            // Find patient details from one of the existing prescriptions
            const existingPrescription = store.prescriptions.find(p => 
                (p.appointmentId === sessionId) || (`LEGACY-${p.date}-${p.patientId}` === sessionId)
            )

            if (!existingPrescription) {
                return NextResponse.json({ error: "Prescription session not found" }, { status: 404 })
            }

            // Remove old ones
            store.prescriptions = store.prescriptions.filter(p => 
                (p.appointmentId !== sessionId) && (`LEGACY-${p.date}-${p.patientId}` !== sessionId)
            )

            // Insert new ones
            const newPrescriptions = medicines.map(p => ({
                _id: `PRES-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                patientId: existingPrescription.patientId,
                patientName: existingPrescription.patientName,
                doctorId: existingPrescription.doctorId,
                doctorName: existingPrescription.doctorName,
                diagnosis: existingPrescription.diagnosis,
                medicineName: p.name,
                dosage: p.dosage,
                quantity: p.quantity || 10,
                duration: p.duration || existingPrescription.duration,
                instructions: p.instructions || p.frequency,
                date: existingPrescription.date,
                appointmentId: existingPrescription.appointmentId
            }))

            store.prescriptions.push(...newPrescriptions)
        }

        return NextResponse.json({ success: true, message: "Prescription updated successfully" })
    } catch (error) {
        console.error("[AA] Prescriptions Edit Error:", error)
        return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 })
    }
}
