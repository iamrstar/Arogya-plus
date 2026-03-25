import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET(request) {
    const store = await connectDB()
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    if (patientId) {
        const patientTests = store.labTests.filter(t => t.patientId === patientId)
        return NextResponse.json(patientTests)
    }

    return NextResponse.json(store.labTests || [])
}

export async function POST(request) {
    const store = await connectDB()
    const data = await request.json()

    const newTest = {
        _id: `LAB${Date.now()}`,
        status: "Pending",
        orderDate: new Date().toISOString().split('T')[0],
        ...data
    }

    if (!store.labTests) store.labTests = []
    store.labTests.push(newTest)

    return NextResponse.json(newTest)
}

export async function PATCH(request) {
    const store = await connectDB()
    const { testId, result, referenceRange, notes } = await request.json()

    const test = store.labTests.find(t => t._id === testId)
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 })

    test.result = result
    test.referenceRange = referenceRange
    test.notes = notes
    test.status = "Completed"
    test.resultDate = new Date().toISOString().split('T')[0]

    return NextResponse.json(test)
}
