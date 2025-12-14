import { connectDB, getDB } from "../lib/mongodb.js"

async function setupDatabase() {
  try {
    console.log("[AA] Starting MongoDB setup...")
    await connectDB()

    const db = getDB()

    // Create demo users
    const demoUsers = [
      {
        id: "DOC001",
        name: "Dr. Rajesh Kumar",
        email: "rajesh.kumar@arogya.com",
        password: "doctor123",
        userType: "doctor",
        role: "doctor",
        specialization: "Cardiology",
        phone: "+91-9876543210",
        department: "Cardiology",
        qualifications: "MBBS, MD (Cardiology)",
        yearsOfExperience: 12,
      },
      {
        id: "PAT001",
        name: "Rahul Verma",
        email: "rahul.verma@email.com",
        password: "patient123",
        userType: "patient",
        role: "patient",
        phone: "+91-9876543211",
        dob: "1990-05-15",
        gender: "Male",
        address: "123 Main Street, Mumbai",
        emergencyContact: "+91-9876543220",
      },
      {
        id: "STAFF001",
        name: "Mary Johnson",
        email: "mary.nurse@arogya.com",
        password: "staff123",
        userType: "staff",
        role: "nurse",
        phone: "+91-9876543212",
        department: "General Ward",
        shift: "Morning",
      },
      {
        id: "STAFF002",
        name: "Sarah Admin",
        email: "sarah.admin@arogya.com",
        password: "staff123",
        userType: "staff",
        role: "admin",
        phone: "+91-9876543213",
        department: "Administration",
      },
      {
        id: "DOC002",
        name: "Dr. Priya Sharma",
        email: "priya.sharma@arogya.com",
        password: "doctor123",
        userType: "doctor",
        role: "doctor",
        specialization: "Neurology",
        phone: "+91-9876543214",
        department: "Neurology",
        qualifications: "MBBS, MD (Neurology)",
        yearsOfExperience: 8,
      },
      {
        id: "STAFF003",
        name: "John Doe",
        email: "john.doe@arogya.com",
        password: "staff123",
        userType: "staff",
        role: "lab_technician",
        phone: "+91-9876543215",
        department: "Laboratory",
      },
      {
        id: "STAFF004",
        name: "Emma Wilson",
        email: "emma.wilson@arogya.com",
        password: "staff123",
        userType: "staff",
        role: "pharmacist",
        phone: "+91-9876543216",
        department: "Pharmacy",
      },
      {
        id: "STAFF005",
        name: "Ahmed Khan",
        email: "ahmed.khan@arogya.com",
        password: "staff123",
        userType: "staff",
        role: "ambulance_driver",
        phone: "+91-9876543217",
        department: "Transport",
      },
    ]

    const usersCollection = db.collection("users")

    // Clear existing users (optional - comment out to preserve data)
    // await usersCollection.deleteMany({})

    // Insert demo users
    for (const user of demoUsers) {
      const exists = await usersCollection.findOne({ email: user.email })
      if (!exists) {
        await usersCollection.insertOne({
          ...user,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        console.log(`[AA] Created user: ${user.email}`)
      } else {
        console.log(`[AA] User already exists: ${user.email}`)
      }
    }

    console.log("[AA] MongoDB setup completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("[AA] Setup error:", error)
    process.exit(1)
  }
}

setupDatabase()
