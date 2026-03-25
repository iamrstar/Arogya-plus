import { NextResponse } from "next/server"
import { createPurchaseOrder, getPurchaseOrders } from "@/lib/mongodb-models"

export async function POST(req) {
    try {
        const data = await req.json()
        const order = await createPurchaseOrder(data)
        return NextResponse.json(order)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 })
    }
}

export async function GET() {
    try {
        const orders = await getPurchaseOrders()
        return NextResponse.json(orders)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 })
    }
}

export async function PATCH(req) {
    const store = await connectDB() // Get store directly for updating
    try {
        const { orderId, status, receivedQty } = await req.json()
        const order = store.purchaseOrders?.find(o => o._id === orderId)
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        order.status = status
        if (receivedQty) order.receivedQty = receivedQty
        order.updatedAt = new Date().toISOString()

        return NextResponse.json(order)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update purchase order" }, { status: 500 })
    }
}
