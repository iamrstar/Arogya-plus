import { NextResponse } from "next/server"
import { connectDB, getDB } from "@/lib/mongodb"


const demoUsers = [
  {
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@arogya.com",
    password: "doctor123",
    userType: "doctor",
    role: "doctor",
    specialization: "Cardiology",
    phone: "+91-9876543210",
    qualification: "MD, DM Cardiology",
    experience: 10,
  },
  {
    name: "Dr. Priya Singh",
    email: "priya.singh@arogya.com",
    password: "doctor123",
    userType: "doctor",
    role: "doctor",
    specialization: "Orthopedics",
    phone: "+91-9876543220",
    qualification: "MS Orthopedics",
    experience: 8,
  },
  {
    name: "Rahul Verma",
    email: "rahul.verma@email.com",
    password: "patient123",
    userType: "patient",
    role: "patient",
    phone: "+91-9876543211",
    dob: "1990-05-15",
    gender: "Male",
    address: "123 Main Street, Mumbai",
  },
  {
    name: "Anjali Sharma",
    email: "anjali.sharma@email.com",
    password: "patient123",
    userType: "patient",
    role: "patient",
    phone: "+91-9876543221",
    dob: "1985-03-20",
    gender: "Female",
    address: "456 Oak Avenue, Bangalore",
  },
  {
    name: "Mary Johnson",
    email: "mary.nurse@arogya.com",
    password: "staff123",
    userType: "staff",
    role: "nurse",
    phone: "+91-9876543212",
    department: "ICU",
    shift: "Morning",
  },
  {
    name: "Sarah Admin",
    email: "sarah.admin@arogya.com",
    password: "staff123",
    userType: "staff",
    role: "admin",
    phone: "+91-9876543213",
    department: "Administration",
  },
  {
    name: "John Technician",
    email: "john.lab@arogya.com",
    password: "staff123",
    userType: "staff",
    role: "lab_technician",
    phone: "+91-9876543214",
    department: "Laboratory",
  },
  {
    name: "Ravi Pharmacist",
    email: "ravi.pharma@arogya.com",
    password: "staff123",
    userType: "staff",
    role: "pharmacist",
    phone: "+91-9876543215",
    department: "Pharmacy",
  },
]

export async function GET(request) {
  try {
    await connectDB()
    const db = getDB()

    // Clear existing users
    db.users = []

    // Add demo users
    const insertedIds = []
    demoUsers.forEach((user) => {
      const id = Math.random().toString(36).substr(2, 9)
      db.users.push({
        _id: id,
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      insertedIds.push(id)
    })

    console.log("[AA] Database seeded with", insertedIds.length, "users")

    return NextResponse.json({
      success: true,
      message: `Database seeded with ${insertedIds.length} demo users`,
      users: demoUsers.map((u) => ({
        email: u.email,
        password: u.password,
        role: u.role,
      })),
    })
  } catch (error) {
    console.error("[AA] Seed error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
