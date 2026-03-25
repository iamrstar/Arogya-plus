import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { generatePrescriptionPDF } from "@/lib/mail-utils"

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url)
        const appointmentId = searchParams.get("appointmentId")
        const patientId = searchParams.get("patientId")

        if (!appointmentId || !patientId) {
            return NextResponse.json({ error: "Missing clinical parameters" }, { status: 400 })
        }

        const store = await connectDB()

        // 1. Reconstruct the clinical session data
        const sessionPrescriptions = (store.prescriptions || []).filter(p => p.appointmentId === appointmentId)

        if (sessionPrescriptions.length === 0) {
            return NextResponse.json({ error: "Prescription record not found" }, { status: 404 })
        }

        const primary = sessionPrescriptions[0]

        // Find associated lab tests for this session
        const sessionTests = (store.labTests || [])
            .filter(t => t.appointmentId === appointmentId)
            .map(t => ({
                name: t.testName,
                status: t.status,
                result: t.result,
                referenceRange: t.referenceRange
            }))

        // Find follow-up date from the appointment record
        const appointment = (store.appointments || []).find(a => a._id === appointmentId)
        const followUpDate = appointment?.followUpDate || null

        // 2. Map to PDF generator format
        // Handle both flattened (medicineName) and legacy/nested (prescription array) formats
        const normalizedPrescriptions = []
        sessionPrescriptions.forEach(p => {
            if (p.medicineName) {
                normalizedPrescriptions.push({
                    name: p.medicineName,
                    dosage: p.dosage,
                    duration: p.duration,
                    instructions: p.instructions
                })
            } else if (Array.isArray(p.prescription)) {
                // Handle OPD nested format
                normalizedPrescriptions.push(...p.prescription.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    duration: m.duration,
                    instructions: m.instructions
                })))
            }
        })

        const pdfDetails = {
            patientName: primary.patientName,
            doctorName: primary.doctorName,
            diagnosis: primary.diagnosis,
            prescriptions: normalizedPrescriptions,
            tests: sessionTests,
            followUpDate: followUpDate
        }

        // 3. Generate PDF
        const pdfBuffer = await generatePrescriptionPDF(pdfDetails)

        // 4. Return as PDF stream
        const safePatientName = (primary.patientName || "Arogya_Patient").replace(/\s+/g, '_')
        return new Response(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="Prescription_${safePatientName}.pdf"`
            }
        })

    } catch (error) {
        console.error("[AA] PDF Fetch Error:", error)
        return NextResponse.json({
            error: "Clinical PDF generation failed",
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 })
    }
}
