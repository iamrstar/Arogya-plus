import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization")
        const token = authHeader?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || (user.userType !== "staff" && user.role !== "Lab Technician" && user.role !== "Radiologist Tech")) {
            // Allow general staff check but specific for Lab Techs
        }

        const { searchParams } = new URL(req.url)
        const date = searchParams.get("date") || new Date().toISOString().split('T')[0]
        const status = searchParams.get("status") || "all"

        const store = await connectDB()
        let tasks = store.labTests || []

        // Filter by date (orderDate)
        if (date !== "all") {
            tasks = tasks.filter(t => t.orderDate === date)
        }

        // Filter by status
        if (status !== "all") {
            tasks = tasks.filter(t => t.status.toLowerCase() === status.toLowerCase())
        }

        return NextResponse.json(tasks)
    } catch (error) {
        console.error("[AA] Lab Tasks Fetch Error:", error)
        return NextResponse.json({ error: "Diagnostic task synchronization failed" }, { status: 500 })
    }
}

export async function PATCH(req) {
    try {
        const authHeader = req.headers.get("Authorization")
        const token = authHeader?.split(" ")[1]
        const user = verifyToken(token)

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const store = await connectDB()
        const { testId, status, result, referenceRange, notes } = await req.json()

        const testIndex = (store.labTests || []).findIndex(t => t._id === testId)
        if (testIndex === -1) return NextResponse.json({ error: "Diagnostic task not found" }, { status: 404 })

        const test = store.labTests[testIndex]

        // Update the central archive
        store.labTests[testIndex] = {
            ...test,
            status: status || test.status,
            result: result !== undefined ? result : test.result,
            referenceRange: referenceRange !== undefined ? referenceRange : test.referenceRange,
            notes: notes !== undefined ? notes : test.notes,
            resultDate: status === "Completed" ? new Date().toISOString().split('T')[0] : test.resultDate,
            updatedBy: user.name,
            updatedAt: new Date().toISOString()
        }

        // Sync back to patient user object testLog
        const patientIndex = store.users.findIndex(u => u._id === test.patientId)
        if (patientIndex !== -1) {
            const patient = store.users[patientIndex]
            if (patient.testLog) {
                const logIndex = patient.testLog.findIndex(l => l.appointmentId === test.appointmentId && l.name === test.testName)
                if (logIndex !== -1) {
                    patient.testLog[logIndex].status = status || test.status
                    patient.testLog[logIndex].updatedAt = new Date().toISOString()
                }
            }
        }

        return NextResponse.json({ success: true, test: store.labTests[testIndex] })
    } catch (error) {
        console.error("[AA] Lab Task Update Error:", error)
        return NextResponse.json({ error: "Diagnostic finalization failed" }, { status: 500 })
    }
}
