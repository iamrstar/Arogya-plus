import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET() {
    const store = await connectDB()
    return NextResponse.json(store.masterDiagnostics || [])
}
