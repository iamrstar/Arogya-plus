import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET() {
    const store = await connectDB()
    return NextResponse.json({
        userEmails: store.users?.map(u => ({ email: u.email, type: u.userType, hasPass: !!u.password })),
        count: store.users?.length
    })
}
