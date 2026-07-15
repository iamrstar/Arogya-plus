import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET(req) {
    try {
        const store = await connectDB()
        const requests = store.emergencyRequests || []
        
        // Sort by newest first
        const sorted = [...requests].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        return NextResponse.json(sorted)
    } catch (error) {
        console.error("Error fetching emergency requests:", error)
        return NextResponse.json({ error: "Failed to fetch emergency requests" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const store = await connectDB()
        const body = await req.json()
        
        const newRequest = {
            _id: `EMR${Math.floor(Math.random() * 10000)}`,
            caller: body.caller || "Unknown Caller",
            phone: body.phone || "Unknown Number",
            location: body.location || "Hospital Premises",
            type: body.type || "Medical Emergency",
            status: "Pending",
            assignedAmbulance: null,
            timestamp: new Date().toISOString()
        }
        
        if (!store.emergencyRequests) {
            store.emergencyRequests = []
        }
        
        store.emergencyRequests.unshift(newRequest)
        
        return NextResponse.json({ success: true, request: newRequest })
    } catch (error) {
        console.error("Error creating emergency request:", error)
        return NextResponse.json({ error: "Failed to create emergency request" }, { status: 500 })
    }
}

export async function PUT(req) {
    try {
        const store = await connectDB()
        const body = await req.json()
        
        const { id, status, assignedAmbulance } = body
        
        if (!id) {
            return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
        }
        
        const requestIndex = store.emergencyRequests.findIndex(r => r._id === id)
        
        if (requestIndex === -1) {
            return NextResponse.json({ error: "Emergency request not found" }, { status: 404 })
        }
        
        if (status) store.emergencyRequests[requestIndex].status = status
        if (assignedAmbulance !== undefined) store.emergencyRequests[requestIndex].assignedAmbulance = assignedAmbulance
        
        return NextResponse.json({ success: true, request: store.emergencyRequests[requestIndex] })
    } catch (error) {
        console.error("Error updating emergency request:", error)
        return NextResponse.json({ error: "Failed to update emergency request" }, { status: 500 })
    }
}
