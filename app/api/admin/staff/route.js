import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET() {
    const store = await connectDB()
    const staff = store.staff || []
    const users = store.users || []
    
    // 1. Map existing staff with their credentials
    const staffWithCredentials = staff.map(staffMember => {
        const user = users.find(u => u._id === staffMember._id)
        return {
            ...staffMember,
            email: user?.email || "N/A",
            password: user?.password || "••••••••"
        }
    })
    
    // 2. Identify doctors who are not in the staff list and add them
    const existingStaffIds = new Set(staff.map(s => s._id))
    const doctors = users.filter(u => u.userType === "doctor" && !existingStaffIds.has(u._id))
    
    const mappedDoctors = doctors.map(doc => ({
        _id: doc._id,
        name: doc.name,
        role: "Doctor",
        department: doc.specialization || doc.department || "Medical",
        shift: doc.shift || "Variable",
        status: doc.status || "Active",
        phone: doc.phone || "N/A",
        joinDate: doc.joinDate || "N/A",
        email: doc.email,
        password: doc.password
    }))
    
    // Combine and return
    return NextResponse.json([...staffWithCredentials, ...mappedDoctors])
}

export async function POST(request) {
    try {
        const store = await connectDB()
        const data = await request.json()

        const { name, email, password, role, department, shift, phone, specialization } = data

        if (!name || !email || !password || !role || !department || !shift) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Check if user already exists
        const existingUser = store.users.find(u => u.email.toLowerCase() === email.toLowerCase())
        if (existingUser) {
            return NextResponse.json({ error: "User already exists with this email" }, { status: 409 })
        }

        const isDoctor = role.toLowerCase() === "doctor"
        const prefix = isDoctor ? "DOC" : "STF"
        const timestamp = Date.now().toString().slice(-4)
        const random = Math.floor(Math.random() * 100).toString().padStart(2, "0")
        const id = `${prefix}${timestamp}${random}`

        const newUser = {
            _id: id,
            name,
            email: email.toLowerCase(),
            password, // Plain text as per existing registration flow for now
            userType: isDoctor ? "doctor" : "staff",
            role,
            department,
            shift,
            phone: phone || "Not Provided",
            status: "On Duty",
            joinDate: new Date().toISOString().split('T')[0],
            ...(isDoctor && { specialization: specialization || "General Medicine" })
        }

        // Add to users (for login)
        store.users.push(newUser)

        // Add to staff (for listing)
        const newStaff = {
            _id: id,
            name,
            role,
            department,
            shift,
            status: "On Duty",
            phone: phone || "Not Provided",
            joinDate: new Date().toISOString().split('T')[0]
        }
        store.staff.push(newStaff)

        return NextResponse.json({ success: true, user: newUser }, { status: 201 })
    } catch (error) {
        console.error("Staff registration error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
