import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { updateAppointment } from "@/lib/mongodb-models"
import { verifyToken } from "@/lib/auth"

export async function PATCH(request, { params }) {
    try {
        await connectDB()
        const { id } = params
        const token = request.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user) {
            return NextResponse.json({ error: "Unauthorized clinical access" }, { status: 401 })
        }

        const updates = await request.json()

        // Ensure we convert date strings to Date objects if present
        if (updates.appointmentDate) {
            updates.appointmentDate = new Date(updates.appointmentDate)
        }

        const result = await updateAppointment(id, updates)

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: "Identity not found in clinical registry" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Appointment record updated successfully"
        })
    } catch (error) {
        console.error("[AA] Appointment PATCH error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
