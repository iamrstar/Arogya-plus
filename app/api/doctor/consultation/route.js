import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { sendEPrescriptionEmail } from "@/lib/mail-utils"

export async function POST(req) {
    try {
        const authHeader = req.headers.get("Authorization")
        const token = authHeader?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || user.userType !== "doctor") {
            return NextResponse.json({ error: "Unauthorized clinical access" }, { status: 401 })
        }

        const store = await connectDB()
        const {
            appointmentId,
            patientId,
            patientName,
            diagnosis,
            isSerious,
            shiftToHospital,
            prescriptions,
            tests,
            followUpDate
        } = await req.json()

        // 1. Update Appointment Status
        const appIndex = store.appointments.findIndex(a => a._id === appointmentId)
        if (appIndex !== -1) {
            store.appointments[appIndex].status = "Completed"
            store.appointments[appIndex].followUpDate = followUpDate
            store.appointments[appIndex].updatedAt = new Date().toISOString()
        }

        // 2. Save Prescriptions & Update Patient medicationLog
        if (!store.prescriptions) store.prescriptions = []
        const patientIndex = store.users.findIndex(u => u._id === patientId)

        const newPrescriptions = prescriptions.map(p => ({
            _id: `RX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            appointmentId,
            patientId,
            patientName,
            doctorId: user.userId,
            doctorName: user.name,
            diagnosis,
            medicineId: p.medicineId,
            medicineName: p.name,
            dosage: p.dosage,
            quantity: p.quantity,
            duration: p.duration,
            instructions: p.instructions,
            date: new Date().toISOString(),
            createdAt: new Date().toISOString()
        }))
        store.prescriptions.push(...newPrescriptions)

        // Sync to patient object for "History" views
        if (patientIndex !== -1) {
            if (!store.users[patientIndex].medicationLog) store.users[patientIndex].medicationLog = []
            store.users[patientIndex].medicationLog.push(...newPrescriptions.map(p => ({
                appointmentId: p.appointmentId,
                name: p.medicineName,
                dosage: p.dosage,
                quantity: p.quantity,
                date: p.date,
                instructions: p.instructions
            })))
        }

        // 3. Save Lab Tests & Update Patient testLog
        if (!store.labTests) store.labTests = []
        const newTests = tests.map(t => {
            const diagInfo = store.masterDiagnostics?.find(d => d.name === t)
            return {
                _id: `LAB-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                appointmentId,
                patientId,
                patientName,
                testName: t,
                category: diagInfo?.category || "General",
                orderedBy: user.name,
                orderDate: new Date().toISOString().split('T')[0],
                status: "Pending",
                createdAt: new Date().toISOString()
            }
        })
        store.labTests.push(...newTests)

        if (patientIndex !== -1) {
            if (!store.users[patientIndex].testLog) store.users[patientIndex].testLog = []
            store.users[patientIndex].testLog.push(...newTests.map(t => ({
                appointmentId: t.appointmentId,
                name: t.testName,
                date: t.orderDate,
                status: t.status
            })))
        }

        // 4. Handle Emergency Hospital Shift
        if (shiftToHospital) {
            const admissionId = `ADM-EMR-${Date.now().toString(36).toUpperCase()}`

            // Add to admittedPatients
            if (!store.admittedPatients) store.admittedPatients = []
            const patientData = store.users.find(u => u._id === patientId)

            store.admittedPatients.push({
                _id: admissionId,
                patientId,
                name: patientName,
                age: patientData?.age || "N/A",
                gender: patientData?.gender || "N/A",
                department: user.specialization,
                doctor: user.name,
                condition: isSerious ? "Critical" : "Stable",
                admissionDate: new Date().toISOString().split('T')[0],
                status: "Pending Shifting",
                bed: "Assigning...",
                isEmergency: true
            })

            // Create Staff Shifting Task
            if (!store.staffTasks) store.staffTasks = []
            store.staffTasks.push({
                _id: `TASK-SHIFT-${Date.now()}`,
                type: "Shifting",
                patientName,
                from: "Consultation Room",
                to: `${user.specialization} Ward`,
                status: "Pending",
                priority: "Urgent",
                createdAt: new Date().toISOString(),
                notes: `Emergency shift initiated by ${user.name}. Diagnosis: ${diagnosis}`
            })
        }

        // 5. Digital Broadcast (Email)
        try {
            const patientUser = store.users.find(u => u._id === patientId)
            if (patientUser?.email) {
                await sendEPrescriptionEmail(patientUser.email, {
                    patientName,
                    doctorName: user.name,
                    diagnosis,
                    prescriptions,
                    tests,
                    isSerious,
                    shiftToHospital
                })
            }
        } catch (emailErr) {
            console.error("[AA] Email dispatch failed:", emailErr)
        }

        return NextResponse.json({
            success: true,
            message: "Consultation synchronized and dispatched",
            prescriptionsCount: newPrescriptions.length,
            testsCount: newTests.length
        })

    } catch (error) {
        console.error("[AA] Consultation API Error:", error)
        return NextResponse.json({ error: "Internal clinical sync failure" }, { status: 500 })
    }
}
