import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { addToDailyPlan, removeFromDailyPlan } from "@/lib/mongodb-models"

export async function POST(req) {
    try {
        await connectDB()
        const body = await req.json()
        const { patientId } = body
        const items = body.items || [body]

        if (!patientId || items.length === 0) {
            return NextResponse.json({ error: "Patient ID and items are required" }, { status: 400 })
        }

        const addedItems = []
        for (const item of items) {
            if (!item.medicineId && !item.medicineName) continue
            const planItem = await addToDailyPlan(patientId, item)
            if (planItem) addedItems.push(planItem)
        }

        return NextResponse.json({ success: true, count: addedItems.length })
    } catch (error) {
        console.error("Daily Plan Error:", error)
        return NextResponse.json({ error: "Failed to add to daily plan" }, { status: 500 })
    }
}

export async function DELETE(req) {
    try {
        await connectDB()
        const { searchParams } = new URL(req.url)
        const patientId = searchParams.get("patientId")
        const planItemId = searchParams.get("planItemId")

        if (!patientId || !planItemId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
        }

        const success = await removeFromDailyPlan(patientId, planItemId)
        return NextResponse.json({ success })
    } catch (error) {
        console.error("Daily Plan Delete Error:", error)
        return NextResponse.json({ error: "Failed to remove from daily plan" }, { status: 500 })
    }
}
