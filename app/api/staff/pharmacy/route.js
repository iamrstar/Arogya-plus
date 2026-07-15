import { NextResponse } from "next/server"
import { getDB, connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
    try {
        await connectDB()
        const token = request.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || user.role !== "Pharmacist") {
            // Strictly require Pharmacist role (or Admin for testing)
            if (user?.role !== "Super Admin") {
                return NextResponse.json({ error: "Unauthorized. Pharmacy access only." }, { status: 401 })
            }
        }

        const store = getDB()
        
        // Find all prescriptions that are NOT dispensed
        const allRx = store.prescriptions || []
        
        // Group by appointmentId/patientId to show as orders
        const ordersMap = {}
        allRx.forEach(rx => {
            const status = rx.status || "Pending"
            const orderId = rx.appointmentId || `GEN-${rx.patientId}-${rx.date?.split('T')[0]}`
            
            if (!ordersMap[orderId]) {
                ordersMap[orderId] = {
                    orderId,
                    appointmentId: rx.appointmentId,
                    patientId: rx.patientId,
                    patientName: rx.patientName,
                    doctorId: rx.doctorId,
                    doctorName: rx.doctorName,
                    date: rx.date || rx.createdAt,
                    items: [],
                    status: status // Overall order status
                }
            }
            
            // If any item is pending, the order is pending
            if (status === "Pending") ordersMap[orderId].status = "Pending"
            
            ordersMap[orderId].items.push({
                _id: rx._id,
                medicineId: rx.medicineId,
                medicineName: rx.medicineName,
                dosage: rx.dosage,
                quantity: rx.quantity,
                duration: rx.duration,
                instructions: rx.instructions,
                status: status
            })
        })

        // Sort: Pending first, then by date descending
        const orders = Object.values(ordersMap).sort((a, b) => {
            if (a.status === "Pending" && b.status !== "Pending") return -1
            if (a.status !== "Pending" && b.status === "Pending") return 1
            return new Date(b.date) - new Date(a.date)
        })

        // Also fetch critical inventory for the dashboard
        const inventory = store.medicines || []
        const lowStock = inventory.filter(m => m.stock < 50)

        return NextResponse.json({ orders, lowStock })
    } catch (error) {
        console.error("[AA] Pharmacy GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request) {
    try {
        await connectDB()
        const token = request.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || (user.role !== "Pharmacist" && user.role !== "Super Admin")) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
        }

        const store = getDB()
        const { orderId, action } = await request.json()

        if (action === "DISPENSE") {
            // Find all prescriptions in this order
            const rxs = store.prescriptions.filter(rx => 
                rx.appointmentId === orderId || `GEN-${rx.patientId}-${rx.date?.split('T')[0]}` === orderId
            )

            if (rxs.length === 0) return NextResponse.json({ error: "Order not found" }, { status: 404 })

            let totalCost = 0

            // Dispense each and deduct stock
            rxs.forEach(rx => {
                if (rx.status !== "Dispensed") {
                    rx.status = "Dispensed"
                    rx.dispensedAt = new Date().toISOString()
                    rx.dispensedBy = user.name

                    // Deduct Stock and calculate cost
                    const med = store.medicines?.find(m => m._id === rx.medicineId || m.name === rx.medicineName)
                    if (med) {
                        med.stock = Math.max(0, med.stock - (rx.quantity || 1))
                        if (med.stock < 50 && med.stock > 0) med.status = "Low Stock"
                        if (med.stock === 0) med.status = "Out of Stock"
                        
                        rx.cost = med.price * (rx.quantity || 1)
                        totalCost += rx.cost
                    } else {
                        // Fallback cost
                        rx.cost = 50 * (rx.quantity || 1)
                        totalCost += rx.cost
                    }
                }
            })

            // Generate Pharmacy Bill for this order
            if (!store.payments) store.payments = []
            
            // Check if patient is admitted (IPD) or OPD
            const isAdmitted = store.admittedPatients?.find(p => p.patientId === rxs[0].patientId || p.originalId === rxs[0].patientId)
            
            // If they are OPD, the bill is due immediately. If IPD, it gets added to final bill.
            // For now, generate an invoice record for both.
            store.payments.push({
                _id: `INV-PHX-${Date.now()}`,
                patientId: rxs[0].patientId,
                patientName: rxs[0].patientName,
                type: "Pharmacy",
                amount: totalCost,
                status: isAdmitted ? "Added to Final Bill" : "Pending Payment",
                orderId: orderId,
                date: new Date().toISOString()
            })

            return NextResponse.json({ success: true, message: "Order Dispensed Successfully", totalCost })
        }

        return NextResponse.json({ error: "Invalid Action" }, { status: 400 })
    } catch (error) {
        console.error("[AA] Pharmacy PATCH error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
