import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET(req) {
    try {
        const store = await connectDB()
        return NextResponse.json({
            organs: store.organs || [],
            waitlist: store.organWaitlist || []
        })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch organ registry data" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const store = await connectDB()
        const body = await req.json()
        const { action, matchData } = body
        
        if (action === "match") {
            // Mock Match Algorithm
            const { organId, waitlistId } = matchData
            const organIndex = store.organs.findIndex(o => o._id === organId)
            const waitlistIndex = store.organWaitlist.findIndex(w => w._id === waitlistId)
            
            if (organIndex > -1 && waitlistIndex > -1) {
                store.organs[organIndex].status = "Allocated"
                store.organWaitlist[waitlistIndex].status = "Matched"
                return NextResponse.json({ success: true, message: "Match successful! Transplant scheduled." })
            }
            return NextResponse.json({ error: "Invalid data" }, { status: 400 })
        }
        
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: "Operation failed" }, { status: 500 })
    }
}
