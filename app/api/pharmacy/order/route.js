import { NextResponse } from "next/server"
import { createPharmacyOrder, getPharmacyOrders, updatePharmacyOrder } from "@/lib/mongodb-models"

export async function POST(req) {
    try {
        const data = await req.json()
        const order = await createPharmacyOrder(data)
        return NextResponse.json(order)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url)
        const patientId = searchParams.get("patientId")
        const status = searchParams.get("status")
        const orders = await getPharmacyOrders({ patientId, status })
        return NextResponse.json(orders)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }
}

export async function PATCH(req) {
    try {
        const data = await req.json()
        const { orderId, ...updates } = data
        const updatedOrder = await updatePharmacyOrder(orderId, updates)
        if (!updatedOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }
        return NextResponse.json(updatedOrder)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }
}
