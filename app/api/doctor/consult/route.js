import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function POST(req) {
    try {
        const store = await connectDB()
        const body = await req.json()
        const { patientId, doctorId, condition, diagnosis, prescription, tests, admitRequested, wardType, followUpDate } = body
        const appointmentId = `OPD-SESS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`

        // 1. Find and Remove from OPD Queue
        const opdIndex = (store.opdQueue || []).findIndex(p => p._id === patientId)
        if (opdIndex === -1) return NextResponse.json({ error: "Patient not in OPD queue" }, { status: 404 })

        const patient = store.opdQueue[opdIndex]
        const patientName = patient.name || store.users.find(u => u._id === patientId)?.name || "OPD Patient"
        store.opdQueue.splice(opdIndex, 1)

        // 2. Save Prescriptions (General Archive) & Sync to Patient History
        if (!store.prescriptions) store.prescriptions = []

        const newPrescriptions = (prescription || []).map(p => ({
            _id: `PRES-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            patientId,
            patientName: patientName,
            doctorId,
            doctorName: store.users.find(u => u._id === doctorId)?.name || "Assigned Doctor",
            diagnosis,
            condition,
            medicineName: p.name,
            dosage: p.dosage,
            quantity: p.quantity,
            duration: p.duration,
            instructions: p.instructions,
            tests: tests || [],
            followUpDate,
            appointmentId,
            date: new Date().toISOString()
        }))

        store.prescriptions.push(...newPrescriptions)

        // Sync to patient user object for longevity
        const patientUserIndex = store.users.findIndex(u => u._id === patientId)
        if (patientUserIndex !== -1) {
            const user = store.users[patientUserIndex]
            if (!user.medicationLog) user.medicationLog = []
            if (!user.testLog) user.testLog = []

            // Add prescriptions
            user.medicationLog.push(...(prescription || []).map(p => ({
                appointmentId,
                name: p.name,
                dosage: p.dosage,
                quantity: p.quantity,
                date: new Date().toISOString(),
                instructions: p.instructions
            })))

            // Add tests
            const laboratoryTasks = (tests || []).map(t => {
                const diagInfo = store.masterDiagnostics?.find(d => d.name === t)
                return {
                    _id: `LAB-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                    appointmentId,
                    patientId,
                    patientName: patientName,
                    testName: t,
                    category: diagInfo?.category || "General",
                    orderedBy: store.users.find(u => u._id === doctorId)?.name || "Primary Clinician",
                    orderDate: new Date().toISOString().split('T')[0],
                    status: "Pending",
                    result: null,
                    resultDate: null,
                    notes: null
                }
            })

            if (!store.labTests) store.labTests = []
            store.labTests.push(...laboratoryTasks)

            user.testLog.push(...laboratoryTasks.map(t => ({
                appointmentId: t.appointmentId,
                name: t.testName,
                date: t.orderDate,
                status: "Pending"
            })))
        }

        // 3. Handle Admission Request
        if (admitRequested) {
            const admissionId = `ADM-${Date.now().toString(36).toUpperCase()}`

            // Add to Admitted Patients with "Pending Shift" status
            if (!store.admittedPatients) store.admittedPatients = []
            const newAdmitted = {
                _id: admissionId,
                originalId: patientId,
                name: patientName,
                age: patient.age,
                gender: patient.gender,
                department: patient.department,
                doctor: store.users.find(u => u._id === doctorId)?.name || "Assigned Doctor",
                condition: condition,
                admissionDate: new Date().toISOString().split('T')[0],
                status: "Pending Shifting", // Needs Ward Boy action
                isShifted: false,
                bed: "Assigning...",
                dailyMedicationPlan: prescription || [],
                labTests: tests || []
            }
            store.admittedPatients.push(newAdmitted)

            // Add Task for Ward Boy
            if (!store.staffTasks) store.staffTasks = []
            store.staffTasks.push({
                _id: `TASK-${Date.now()}`,
                type: "Shifting",
                patientName: patientName,
                admissionId: admissionId,
                from: "OPD / Emergency",
                to: wardType || "General Ward",
                status: "Pending",
                createdAt: new Date().toISOString(),
                priority: condition === "Critical" || condition === "Very Critical" ? "Urgent" : "High"
            })
        }

        return NextResponse.json({ success: true, admitRequested })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: "Consultation failed" }, { status: 500 })
    }
}
