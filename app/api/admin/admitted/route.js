import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { deductMedicineStock } from "@/lib/mongodb-models"

export async function GET(request) {
    const store = await connectDB()
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const action = searchParams.get("action")

    if (patientId && action === "bill") {
        const patient = store.admittedPatients?.find(p => p._id === patientId)
        if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 })

        const dept = store.departments.find(d => d.name === patient.department)
        const bedRate = dept?.bedRate || 2000

        // Calculate days
        const admissionDate = new Date(patient.admissionDate)
        const today = new Date()
        const diffTime = Math.abs(today - admissionDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1 // Min 1 day

        const otProcedures = (store.otSchedule || []).filter(ot => ot.patientId === patientId && ot.status === "Completed")
        const otTotal = otProcedures.reduce((sum, ot) => sum + (ot.cost || 0), 0)

        const bedTotal = diffDays * bedRate
        const medTotal = (patient.medicationLog || []).reduce((sum, m) => sum + ((m.price || 0) * (m.quantity || 1)), 0)

        return NextResponse.json({
            patientName: patient.name,
            admissionDate: patient.admissionDate,
            days: diffDays,
            bedRate,
            bedTotal,
            medications: patient.medicationLog || [],
            medTotal,
            otProcedures,
            otTotal,
            grandTotal: bedTotal + medTotal + otTotal
        })
    }

    return NextResponse.json(store.admittedPatients || [])
}

export async function PATCH(request) {
    const store = await connectDB()
    const body = await request.json()
    const { patientId, action, medicineId, quantity } = body

    if (action === "discharge") {
        const patient = store.admittedPatients?.find(p => p._id === patientId)
        if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 })

        // Release the bed
        const bed = store.beds?.find(b => b.bedNumber === patient.bed)
        if (bed) {
            bed.status = "Available"
            bed.patientId = null
            bed.patientName = null
            bed.admissionDate = null
        }

        // Add to payment history (simple mock)
        if (!store.payments) store.payments = []
        // We'll calculate grand total one last time for the record
        const dept = store.departments.find(d => d.name === patient.department)
        const days = Math.ceil(Math.abs(new Date() - new Date(patient.admissionDate)) / (1000 * 60 * 60 * 24)) || 1
        const medTotal = (patient.medicationLog || []).reduce((sum, m) => sum + (m.price * m.quantity), 0)
        const otTotal = (store.otSchedule || []).filter(ot => ot.patientId === patientId && ot.status === "Completed").reduce((sum, ot) => sum + (ot.cost || 0), 0)
        const grandTotal = (days * (dept?.bedRate || 2000)) + medTotal + otTotal

        store.payments.push({
            id: `PAY-${Date.now()}`,
            invoiceNo: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
            description: `Inpatient Discharge — ${patient.name}`,
            amount: grandTotal,
            date: new Date().toISOString().split('T')[0],
            status: "Pending",
            patientId: patient._id
        })

        // Remove from admitted
        store.admittedPatients = store.admittedPatients.filter(p => p._id !== patientId)
        return NextResponse.json({ success: true, discharged: patient.name, billAmount: grandTotal })
    }

    if (action === "medicate") {
        const patient = store.admittedPatients?.find(p => p._id === patientId)
        if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 })

        const items = body.items || [{ medicineId: body.medicineId, quantity: body.quantity }]
        const results = []

        for (const item of items) {
            if (!item.medicineId) continue
            const updatedMed = await deductMedicineStock(item.medicineId, item.quantity || 1)
            if (!updatedMed) continue

            if (!patient.medicationLog) patient.medicationLog = []
            patient.medicationLog.push({
                medicineId: updatedMed._id,
                name: updatedMed.name,
                quantity: item.quantity || 1,
                price: updatedMed.price || 0,
                date: new Date().toISOString()
            })
            results.push(updatedMed.name)
        }

        // Mark plan item as administered if requested
        if (body.planItemId && patient.dailyMedicationPlan) {
            const planItem = patient.dailyMedicationPlan.find(i => i._id === body.planItemId)
            if (planItem) planItem.status = "administered"
        }

        if (results.length === 0) return NextResponse.json({ error: "No items could be processed" }, { status: 400 })
        return NextResponse.json({ success: true, medicines: results })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
