import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET(request) {
    try {
        const store = await connectDB()
        const { searchParams } = new URL(request.url)
        const staffId = searchParams.get("staffId")
        const role = searchParams.get("role")

        let tasks = store.staffTasks || []

        // Filter by role or specific assignment
        if (role === "Ward Boy") {
            tasks = tasks.filter(t => t.type === "Shifting")
        }
        if (staffId) {
            tasks = tasks.filter(t => t.assignedTo === staffId || !t.assignedTo)
        }

        return NextResponse.json(tasks)
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
    }
}

export async function PATCH(request) {
    try {
        const store = await connectDB()
        const body = await request.json()
        const { taskId, action } = body

        const taskIndex = (store.staffTasks || []).findIndex(t => t._id === taskId)
        if (taskIndex === -1) return NextResponse.json({ error: "Task not found" }, { status: 404 })

        const task = store.staffTasks[taskIndex]

        if (action === "accept") {
            task.status = "In Progress"
        } else if (action === "shifted") {
            task.status = "Completed"
            task.completedAt = new Date().toISOString()

            // Update associated patient status to "Stable" and set isShifted: true
            const patient = store.admittedPatients?.find(p => p._id === task.admissionId)
            if (patient) {
                patient.status = "Shifted"
                patient.isShifted = true
                patient.admissionDate = new Date().toISOString().split('T')[0]
            }
        }

        return NextResponse.json({ success: true, task })
    } catch (e) {
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
    }
}
