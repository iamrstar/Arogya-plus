import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET() {
    const store = await connectDB()
    return NextResponse.json(store.medicines || [])
}

export async function PATCH(request) {
    const store = await connectDB()
    const { medicineId, action, restockStatus, incrementQty } = await request.json()
    const medicine = store.medicines?.find(m => m._id === medicineId)
    if (!medicine) return NextResponse.json({ error: "Medicine not found" }, { status: 404 })

    if (action === "fulfill") {
        medicine.stock = (medicine.stock || 0) + (incrementQty || 0)
        medicine.restockRequested = false
        medicine.availableToFulfillAt = null
        // Update medicine status based on new stock
        if (medicine.stock > 100) medicine.status = "In Stock"
        else if (medicine.stock > 20) medicine.status = "Low Stock"
        else if (medicine.stock > 0) medicine.status = "Critical"
    } else {
        medicine.restockRequested = restockStatus
        if (restockStatus) {
            // Set 10 minutes from now as fulfillment time
            medicine.availableToFulfillAt = Date.now() + 10 * 60 * 1000
        } else {
            medicine.availableToFulfillAt = null
        }
    }

    return NextResponse.json(medicine)
}

export async function POST(request) {
    const store = await connectDB()
    const data = await request.json()

    const newMed = {
        _id: `MED${Date.now()}`,
        name: data.name,
        category: data.category,
        stock: parseInt(data.stock) || 0,
        unit: data.unit || "Tablets",
        batch: data.batch || `B${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
        expiry: data.expiry,
        supplier: data.supplier,
        status: "In Stock"
    }

    // Set initial status based on stock
    if (newMed.stock <= 0) newMed.status = "Out of Stock"
    else if (newMed.stock <= 20) newMed.status = "Critical"
    else if (newMed.stock <= 100) newMed.status = "Low Stock"

    if (!store.medicines) store.medicines = []
    store.medicines.push(newMed)

    return NextResponse.json(newMed, { status: 201 })
}
