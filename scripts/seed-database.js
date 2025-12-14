const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const {
  Hospital,
  Department,
  Doctor,
  Patient,
  Staff,
  Appointment,
  Treatment,
  Medicine,
  Prescription,
  LabTest,
  LabReport,
  Room,
  Bed,
  Admission,
  Payment,
} = require("./database-models")

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/arogya_hospital")

    console.log("Connected to MongoDB")

    // Clear existing data
    await Promise.all([
      Hospital.deleteMany({}),
      Department.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Staff.deleteMany({}),
      Appointment.deleteMany({}),
      Treatment.deleteMany({}),
      Medicine.deleteMany({}),
      Prescription.deleteMany({}),
      LabTest.deleteMany({}),
      LabReport.deleteMany({}),
      Room.deleteMany({}),
      Bed.deleteMany({}),
      Admission.deleteMany({}),
      Payment.deleteMany({}),
    ])

    console.log("Cleared existing data")

    // Create Hospital
    const hospital = await Hospital.create({
      hospitalId: "AROGYA001",
      name: "Arogya Super Specialty Hospital",
      location: "Mumbai, Maharashtra",
      contact: "+91-9876543210",
    })

    // Create Departments
    const departments = await Department.insertMany([
      { deptId: "CARD001", deptName: "Cardiology", specialization: "Heart Care", hospitalId: hospital.hospitalId },
      {
        deptId: "NEUR001",
        deptName: "Neurology",
        specialization: "Brain & Nervous System",
        hospitalId: hospital.hospitalId,
      },
      {
        deptId: "ORTH001",
        deptName: "Orthopedics",
        specialization: "Bone & Joint Care",
        hospitalId: hospital.hospitalId,
      },
      { deptId: "PEDI001", deptName: "Pediatrics", specialization: "Child Care", hospitalId: hospital.hospitalId },
      { deptId: "GYNE001", deptName: "Gynecology", specialization: "Women Health", hospitalId: hospital.hospitalId },
      { deptId: "EMER001", deptName: "Emergency", specialization: "Emergency Care", hospitalId: hospital.hospitalId },
    ])

    // Create Doctors with demo credentials
    const hashedPassword = await bcrypt.hash("doctor123", 10)
    const doctors = await Doctor.insertMany([
      {
        doctorId: "DOC001",
        name: "Dr. Rajesh Kumar",
        designation: "Senior Cardiologist",
        specialization: "Cardiology",
        phone: "+91-9876543211",
        email: "rajesh.kumar@arogya.com",
        password: hashedPassword,
        deptId: "CARD001",
        hospitalId: hospital.hospitalId,
      },
      {
        doctorId: "DOC002",
        name: "Dr. Priya Sharma",
        designation: "Neurologist",
        specialization: "Neurology",
        phone: "+91-9876543212",
        email: "priya.sharma@arogya.com",
        password: hashedPassword,
        deptId: "NEUR001",
        hospitalId: hospital.hospitalId,
      },
      {
        doctorId: "DOC003",
        name: "Dr. Amit Patel",
        designation: "Orthopedic Surgeon",
        specialization: "Orthopedics",
        phone: "+91-9876543213",
        email: "amit.patel@arogya.com",
        password: hashedPassword,
        deptId: "ORTH001",
        hospitalId: hospital.hospitalId,
      },
    ])

    // Create Patients with demo credentials
    const patientPassword = await bcrypt.hash("patient123", 10)
    const patients = await Patient.insertMany([
      {
        patientId: "PAT001",
        name: "Rahul Verma",
        gender: "Male",
        dob: new Date("1985-06-15"),
        phone: "+91-9876543221",
        email: "rahul.verma@email.com",
        password: patientPassword,
        address: "123 Main Street, Mumbai",
        emergencyContact: "+91-9876543222",
        bloodGroup: "O+",
      },
      {
        patientId: "PAT002",
        name: "Sunita Singh",
        gender: "Female",
        dob: new Date("1990-03-22"),
        phone: "+91-9876543223",
        email: "sunita.singh@email.com",
        password: patientPassword,
        address: "456 Park Avenue, Mumbai",
        emergencyContact: "+91-9876543224",
        bloodGroup: "A+",
      },
    ])

    // Create Staff with demo credentials
    const staffPassword = await bcrypt.hash("staff123", 10)
    const staff = await Staff.insertMany([
      {
        staffId: "STAFF001",
        name: "Nurse Mary",
        role: "Nurse",
        shift: "Morning",
        phone: "+91-9876543231",
        email: "mary.nurse@arogya.com",
        password: staffPassword,
        hospitalId: hospital.hospitalId,
        deptId: "CARD001",
      },
      {
        staffId: "STAFF002",
        name: "Receptionist John",
        role: "Receptionist",
        shift: "Morning",
        phone: "+91-9876543232",
        email: "john.reception@arogya.com",
        password: staffPassword,
        hospitalId: hospital.hospitalId,
      },
      {
        staffId: "STAFF003",
        name: "Admin Sarah",
        role: "Admin",
        shift: "Morning",
        phone: "+91-9876543233",
        email: "sarah.admin@arogya.com",
        password: staffPassword,
        hospitalId: hospital.hospitalId,
      },
    ])

    // Create Rooms and Beds
    const rooms = await Room.insertMany([
      {
        roomId: "ROOM001",
        roomType: "ICU",
        floor: 3,
        capacity: 1,
        pricePerDay: 5000,
        facilities: ["Ventilator", "Cardiac Monitor", "Oxygen"],
        hospitalId: hospital.hospitalId,
      },
      {
        roomId: "ROOM002",
        roomType: "Private",
        floor: 2,
        capacity: 1,
        pricePerDay: 2000,
        facilities: ["AC", "TV", "Attached Bathroom"],
        hospitalId: hospital.hospitalId,
      },
      {
        roomId: "ROOM003",
        roomType: "General",
        floor: 1,
        capacity: 4,
        pricePerDay: 800,
        facilities: ["Fan", "Common Bathroom"],
        hospitalId: hospital.hospitalId,
      },
    ])

    // Create Beds
    const beds = await Bed.insertMany([
      { bedId: "BED001", bedNo: "301-A", roomId: "ROOM001" },
      { bedId: "BED002", bedNo: "201-A", roomId: "ROOM002" },
      { bedId: "BED003", bedNo: "101-A", roomId: "ROOM003" },
      { bedId: "BED004", bedNo: "101-B", roomId: "ROOM003" },
      { bedId: "BED005", bedNo: "101-C", roomId: "ROOM003" },
      { bedId: "BED006", bedNo: "101-D", roomId: "ROOM003" },
    ])

    // Create Lab Tests
    const labTests = await LabTest.insertMany([
      {
        testId: "LAB001",
        testName: "Complete Blood Count",
        category: "Hematology",
        normalRange: "WBC: 4000-11000, RBC: 4.5-5.5M",
        price: 500,
      },
      {
        testId: "LAB002",
        testName: "Lipid Profile",
        category: "Biochemistry",
        normalRange: "Total Cholesterol: <200mg/dL",
        price: 800,
      },
      {
        testId: "LAB003",
        testName: "Thyroid Function Test",
        category: "Endocrinology",
        normalRange: "TSH: 0.4-4.0 mIU/L",
        price: 1200,
      },
    ])

    // Create Medicines
    const medicines = await Medicine.insertMany([
      {
        medicineId: "MED001",
        name: "Paracetamol 500mg",
        price: 50,
        expiryDate: new Date("2025-12-31"),
        stock: 1000,
        manufacturer: "ABC Pharma",
        category: "Analgesic",
      },
      {
        medicineId: "MED002",
        name: "Amoxicillin 250mg",
        price: 120,
        expiryDate: new Date("2025-10-31"),
        stock: 500,
        manufacturer: "XYZ Pharma",
        category: "Antibiotic",
      },
      {
        medicineId: "MED003",
        name: "Atorvastatin 10mg",
        price: 200,
        expiryDate: new Date("2025-11-30"),
        stock: 300,
        manufacturer: "DEF Pharma",
        category: "Statin",
      },
    ])

    console.log("Database seeded successfully!")
    console.log("\nDemo Credentials:")
    console.log("Doctor: rajesh.kumar@arogya.com / doctor123")
    console.log("Patient: rahul.verma@email.com / patient123")
    console.log("Staff: mary.nurse@arogya.com / staff123")
    console.log("Admin: sarah.admin@arogya.com / staff123")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await mongoose.disconnect()
  }
}

// Run the seed function
seedDatabase()
