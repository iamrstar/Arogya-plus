import { NextResponse } from "next/server"
import { getDB, connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
    try {
        await connectDB()
        const token = request.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || user.role !== "Super Admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 401 })
        }

        const store = getDB()
        return NextResponse.json(store.bloodBank)
    } catch (error) {
        console.error("[AA] Blood Bank GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectDB()
        const token = request.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || user.role !== "Super Admin") {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
        }

        const store = getDB()
        const { action, bloodGroup, units, patientName, patientId, requiredDate, urgency } = await request.json()

        if (action === "ADD_STOCK") {
            const item = store.bloodBank.inventory.find(i => i.bloodGroup === bloodGroup)
            if (item) {
                item.units += parseInt(units)
                item.lastUpdated = new Date().toISOString()
            }
            return NextResponse.json({ success: true, inventory: store.bloodBank.inventory })
        } 
        
        if (action === "REQUEST_BLOOD") {
            const newRequest = {
                _id: `BR-${Date.now()}`,
                patientId,
                patientName,
                bloodGroup,
                units: parseInt(units),
                requiredDate,
                urgency: urgency || "Routine",
                status: "Pending",
                requestedAt: new Date().toISOString()
            }
            store.bloodBank.requests.push(newRequest)
            return NextResponse.json({ success: true, request: newRequest })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    } catch (error) {
        console.error("[AA] Blood Bank POST error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request) {
    try {
        await connectDB()
        const token = request.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || user.role !== "Super Admin") {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
        }

        const store = getDB()
        const { requestId, action } = await request.json()

        const bloodRequest = store.bloodBank.requests.find(r => r._id === requestId)
        if (!bloodRequest) return NextResponse.json({ error: "Request not found" }, { status: 404 })

        if (action === "APPROVE") {
            // Check stock
            const stock = store.bloodBank.inventory.find(i => i.bloodGroup === bloodRequest.bloodGroup)
            if (!stock || stock.units < bloodRequest.units) {
                return NextResponse.json({ error: `Insufficient ${bloodRequest.bloodGroup} stock.` }, { status: 400 })
            }

            // Deduct stock
            stock.units -= bloodRequest.units
            stock.lastUpdated = new Date().toISOString()

            bloodRequest.status = "Approved"
            bloodRequest.processedAt = new Date().toISOString()
            bloodRequest.processedBy = user.name

            // Add billing for blood (Super Speciality hospitals bill for processing)
            if (!store.payments) store.payments = []
            store.payments.push({
                _id: `INV-BB-${Date.now()}`,
                patientId: bloodRequest.patientId,
                patientName: bloodRequest.patientName,
                type: "Blood Bank",
                amount: bloodRequest.units * 1500, // Example: 1500 per unit processing fee
                status: "Pending Payment",
                orderId: requestId,
                date: new Date().toISOString()
            })

            return NextResponse.json({ success: true, message: "Request approved and stock deducted." })
        }

        if (action === "REJECT") {
            bloodRequest.status = "Rejected"
            bloodRequest.processedAt = new Date().toISOString()
            return NextResponse.json({ success: true, message: "Request rejected." })
        }

        return NextResponse.json({ error: "Invalid Action" }, { status: 400 })
    } catch (error) {
        console.error("[AA] Blood Bank PATCH error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
