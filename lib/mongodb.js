// MongoDB REST API client for  environment
// Uses MongoDB Atlas Data API instead of MongoDB client

const MONGODB_URI = process.env.MONGODB_URI
const API_KEY = process.env.MONGODB_API_KEY || "demo"

// Parse MongoDB URI to get connection details
function parseMongoURI(uri) {
  if (!uri) throw new Error("MONGODB_URI not found")

  const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\//)
  if (!match) throw new Error("Invalid MongoDB URI format")

  return {
    username: match[1],
    password: match[2],
    cluster: match[3],
  }
}

// Helper to generate beds for a department
const generateBeds = (deptName, prefix, startNum, count) => {
  const beds = []
  for (let i = 1; i <= count; i++) {
    const num = startNum + i - 1
    // Keep some existing status for realism
    let status = "Available"
    let patientId = null
    let patientName = null
    let admissionDate = null

    // Match existing data for first 5 beds to maintain consistency
    if (deptName === "Cardiology") {
      if (i === 1) { status = "Occupied"; patientId = "ADM001"; patientName = "Arjun Mehta"; admissionDate = "2026-03-15" }
      if (i === 2) { status = "Occupied"; patientId = "ADM002"; patientName = "Lakshmi Iyer"; admissionDate = "2026-03-16" }
      if (i === 4) { status = "Maintenance" }
    } else if (deptName === "Neurology") {
      if (i === 1) { status = "Occupied"; patientId = "ADM003"; patientName = "Suresh Babu"; admissionDate = "2026-03-14" }
      if (i === 3) { status = "Occupied"; patientId = "ADM004"; patientName = "Kavita Joshi"; admissionDate = "2026-03-17" }
    } else if (deptName === "Orthopedics") {
      if (i === 1) { status = "Occupied"; patientId = "ADM005"; patientName = "Ravi Shankar"; admissionDate = "2026-03-13" }
      if (i === 2) { status = "Occupied"; patientId = "ADM006"; patientName = "Deepa Nair"; admissionDate = "2026-03-18" }
      if (i === 3) { status = "Occupied"; patientId = "ADM007"; patientName = "Manish Tiwari"; admissionDate = "2026-03-16" }
    } else if (deptName === "General Medicine") {
      if (i === 1) { status = "Occupied"; patientId = "ADM008"; patientName = "Pooja Verma"; admissionDate = "2026-03-17" }
      if (i === 3) { status = "Occupied"; patientId = "ADM009"; patientName = "Arun Kumar"; admissionDate = "2026-03-19" }
    } else if (deptName === "ICU") {
      if (i <= 4) {
        const data = [
          { id: "ADM010", name: "Rajesh Khanna", date: "2026-03-12" },
          { id: "ADM011", name: "Shalini Gupta", date: "2026-03-18" },
          { id: "ADM012", name: "Vikram Malhotra", date: "2026-03-15" },
          { id: "ADM013", name: "Neha Saxena", date: "2026-03-19" }
        ][i - 1]
        status = "Occupied"; patientId = data.id; patientName = data.name; admissionDate = data.date
      }
    } else if (deptName === "Pediatrics") {
      if (i === 1) { status = "Occupied"; patientId = "ADM014"; patientName = "Baby Aarav Sharma"; admissionDate = "2026-03-18" }
      if (i === 2) { status = "Occupied"; patientId = "ADM015"; patientName = "Baby Ishita Roy"; admissionDate = "2026-03-17" }
    }

    beds.push({
      _id: `BED-${prefix}${i < 10 ? '0' + i : i}`,
      department: deptName,
      bedNumber: `${prefix}-${num}`,
      status,
      patientId,
      patientName,
      admissionDate
    })
  }
  return beds
}

// Persistent in-memory store for development (attached to global to survive HMR)
if (!global._mongoStore) {
  global._mongoStore = {
    users: [
      { _id: "DOC001", name: "Dr. Rajesh Kumar", userType: "doctor", specialization: "Cardiology", email: "rajesh@arogya.com", password: "Doctor@123" },
      { _id: "DOC002", name: "Dr. Priya Sharma", userType: "doctor", specialization: "Neurology", email: "priya@arogya.com", password: "Doctor@123" },
      { _id: "DOC003", name: "Dr. Amit Patel", specialization: "Orthopedics", userType: "doctor", email: "amit@arogya.com", password: "Doctor@123", isHeadOfDept: true },
      { _id: "DOC004", name: "Dr. Vikram Mehra", specialization: "Orthopedics", userType: "doctor", email: "vikram@arogya.com", password: "Doctor@123" },
      { _id: "PAT001", name: "Karan Johar", userType: "patient", email: "karan@personal.in", password: "Patient@123" },
      { _id: "STF005", name: "Ramesh Yadav", userType: "staff", role: "Ward Boy", email: "ramesh@arogya.com", password: "Staff@123" },
      { _id: "STF006", name: "Sunita Kapoor", userType: "staff", role: "Nurse", email: "sunita@arogya.com", password: "Nurse@123", department: "Cardiology" },
      { _id: "STF010", name: "Anjali Bhatt", userType: "staff", role: "Nurse", email: "anjali@arogya.com", password: "Nurse@123", department: "Neurology" },
      { _id: "STF003", name: "Suresh Raina", userType: "staff", role: "Lab Technician", email: "suresh@arogya.com", password: "Lab@123", department: "Diagnostics" },
      { _id: "ADMIN001", name: "Hospital Admin", userType: "admin", email: "admin@arogya.com", password: "Admin@123", role: "Super Admin" },
    ],
    appointments: [
      { _id: "APT001", patientId: "ADM010", patientName: "Rahul Dravid", doctorId: "DOC001", doctorName: "Dr. Rajesh Kumar", date: "2026-03-20", time: "10:00 AM", type: "First Visit", status: "Scheduled" },
      { _id: "APT002", patientId: "ADM011", patientName: "Sachin Tendulkar", doctorId: "DOC002", doctorName: "Dr. Priya Sharma", date: "2026-03-20", time: "11:30 AM", type: "Follow-up", status: "Scheduled" },
      { _id: "APT003", patientId: "ADM012", patientName: "Virat Kohli", doctorId: "DOC003", doctorName: "Dr. Amit Patel", date: "2026-03-21", time: "09:00 AM", type: "Consultation", status: "Scheduled" },
    ],
    labTests: [
      { _id: "LAB001", patientId: "ADM001", patientName: "Arjun Mehta", testName: "Complete Blood Count (CBC)", category: "Hematology", orderedBy: "Dr. Rajesh Kumar", orderDate: "2026-03-15", status: "Completed", result: "Normal", referenceRange: "WBC: 4.5-11.0 K/uL", resultDate: "2026-03-16", notes: "Normal" },
      { _id: "LAB002", patientId: "ADM002", patientName: "Lakshmi Iyer", testName: "Lipid Profile", category: "Biochemistry", orderedBy: "Dr. Rajesh Kumar", orderDate: "2026-03-16", status: "Pending", result: null, referenceRange: "Total Cholesterol: <200 mg/dL", resultDate: null, notes: null },
      { _id: "LAB003", patientId: "ADM003", patientName: "Suresh Babu", testName: "Thyroid Function Test", category: "Endocrinology", orderedBy: "Dr. Priya Sharma", orderDate: "2026-03-14", status: "Completed", result: "TSH 2.5 mIU/L", referenceRange: "0.4-4.0 mIU/L", resultDate: "2026-03-15", notes: "Within normal limits" },
    ],
    treatments: [],
    payments: [],
    notifications: [],
    otps: [],
    pharmacyOrders: [],
    prescriptions: [
      {
        _id: "RX-MOCK-001",
        appointmentId: "APT001",
        patientId: "ADM010",
        patientName: "Rahul Dravid",
        doctorId: "DOC001",
        doctorName: "Dr. Rajesh Kumar",
        diagnosis: "Chest Pain - Stable Angina",
        medicineName: "Aspirin 75mg",
        dosage: "1-0-0",
        quantity: 30,
        duration: "30 Days",
        instructions: "After food",
        date: "2026-03-20T10:00:00Z",
        createdAt: "2026-03-20T10:00:00Z"
      },
      {
        _id: "RX-MOCK-002",
        appointmentId: "APT002",
        patientId: "ADM011",
        patientName: "Sachin Tendulkar",
        doctorId: "DOC002",
        doctorName: "Dr. Priya Sharma",
        diagnosis: "Persistent Migraine",
        medicineName: "Sumatriptan 50mg",
        dosage: "0-0-1",
        quantity: 10,
        duration: "10 Days",
        instructions: "On onset of headache",
        date: "2026-03-20T11:30:00Z",
        createdAt: "2026-03-20T11:30:00Z"
      }
    ],
    hospitals: [
      { _id: "HOSP001", name: "Apollo Multispecialty Hospital", city: "Kolkata", specialities: ["Cardiology", "Neurology", "Gastroenterology"], lat: 22.5697, lng: 88.4067, rating: 4.8, address: "Canal Circular Rd, Kadapara, Kolkata, West Bengal" },
      { _id: "HOSP002", name: "AIIMS Delhi", city: "Delhi", specialities: ["Oncology", "Pediatrics", "Cardiology"], lat: 28.5672, lng: 77.2100, rating: 4.9, address: "Ansari Nagar, New Delhi" },
      { _id: "HOSP003", name: "Manipal Hospital Old Airport Road", city: "Bangalore", specialities: ["Orthopedics", "Pulmonology", "Neurology"], lat: 12.9593, lng: 77.6444, rating: 4.7, address: "98, Old Airport Rd, HAL 2nd Stage, Bangalore, Karnataka" },
      { _id: "HOSP004", name: "Fortis Memorial Research Institute", city: "Gurgaon", specialities: ["Transplant", "Hematology", "Robotic Surgery"], lat: 28.4552, lng: 77.0717, rating: 4.8, address: "Sector 44, opposite HUDA City Centre, Gurgaon, Haryana" },
    ],

    // ── DEPARTMENTS ──
    departments: [
      { _id: "DEPT01", name: "Cardiology", floor: "3rd Floor", head: "Dr. Rajesh Kumar", totalBeds: 10, color: "#ef4444", bedRate: 3500 },
      { _id: "DEPT02", name: "Neurology", floor: "4th Floor", head: "Dr. Priya Sharma", totalBeds: 10, color: "#8b5cf6", bedRate: 4000 },
      { _id: "DEPT03", name: "Orthopedics", floor: "2nd Floor", head: "Dr. Amit Patel", totalBeds: 10, color: "#3b82f6", bedRate: 3000 },
      { _id: "DEPT04", name: "General Medicine", floor: "1st Floor", head: "Dr. Sneha Reddy", totalBeds: 10, color: "#10b981", bedRate: 2000 },
      { _id: "DEPT05", name: "ICU", floor: "5th Floor", head: "Dr. Vikram Singh", totalBeds: 10, color: "#f59e0b", bedRate: 8500 },
      { _id: "DEPT06", name: "Pediatrics", floor: "1st Floor", head: "Dr. Ananya Das", totalBeds: 10, color: "#ec4899", bedRate: 2500 },
    ],

    // ── BEDS ──
    beds: [
      ...generateBeds("Cardiology", "C", 101, 10),
      ...generateBeds("Neurology", "N", 201, 10),
      ...generateBeds("Orthopedics", "O", 301, 10),
      ...generateBeds("General Medicine", "G", 401, 10),
      ...generateBeds("ICU", "I", 501, 10),
      ...generateBeds("Pediatrics", "P", 601, 10),
    ],

    // ── ADMITTED PATIENTS ──
    admittedPatients: [
      { _id: "ADM001", name: "Arjun Mehta", age: 58, gender: "Male", department: "Cardiology", bed: "C-101", doctor: "Dr. Rajesh Kumar", condition: "Post Angioplasty Recovery", admissionDate: "2026-03-15", status: "Stable" },
      { _id: "ADM002", name: "Lakshmi Iyer", age: 62, gender: "Female", department: "Cardiology", bed: "C-102", doctor: "Dr. Rajesh Kumar", condition: "Atrial Fibrillation", admissionDate: "2026-03-16", status: "Under Observation" },
      {
        _id: "ADM003", name: "Suresh Babu", age: 45, gender: "Male", department: "Neurology", bed: "N-201", doctor: "Dr. Priya Sharma", condition: "Migraine with Aura", admissionDate: "2026-03-14", status: "Improving", dailyMedicationPlan: [
          { _id: "PLAN-001", medicineId: "MED003", medicineName: "Insulin Glargine (Lantus)", dosage: "10 units", shift: "Morning", instructions: "Before breakfast", status: "pending" },
          { _id: "PLAN-002", medicineId: "MED001", medicineName: "Paracetamol 500mg (Dolo-650)", dosage: "1 tablet", shift: "Morning", instructions: "After food", status: "pending" }
        ]
      },
      { _id: "ADM004", name: "Kavita Joshi", age: 35, gender: "Female", department: "Neurology", bed: "N-203", doctor: "Dr. Priya Sharma", condition: "Epilepsy Monitoring", admissionDate: "2026-03-17", status: "Under Observation" },
      { _id: "ADM005", name: "Ravi Shankar", age: 40, gender: "Male", department: "Orthopedics", bed: "O-301", doctor: "Dr. Amit Patel", condition: "Fracture — Left Femur", admissionDate: "2026-03-13", status: "Post Surgery" },
      { _id: "ADM006", name: "Deepa Nair", age: 28, gender: "Female", department: "Orthopedics", bed: "O-302", doctor: "Dr. Amit Patel", condition: "ACL Reconstruction", admissionDate: "2026-03-18", status: "Pre Surgery" },
      { _id: "ADM007", name: "Manish Tiwari", age: 55, gender: "Male", department: "Orthopedics", bed: "O-303", doctor: "Dr. Amit Patel", condition: "Total Knee Replacement", admissionDate: "2026-03-16", status: "Recovering" },
      { _id: "ADM008", name: "Pooja Verma", age: 30, gender: "Female", department: "General Medicine", bed: "G-401", doctor: "Dr. Sneha Reddy", condition: "Typhoid Fever", admissionDate: "2026-03-17", status: "Improving" },
      { _id: "ADM009", name: "Arun Kumar", age: 48, gender: "Male", department: "General Medicine", bed: "G-403", doctor: "Dr. Sneha Reddy", condition: "Dengue — Platelet Monitoring", admissionDate: "2026-03-19", status: "Critical" },
      { _id: "ADM010", name: "Rajesh Khanna", age: 70, gender: "Male", department: "ICU", bed: "I-501", doctor: "Dr. Vikram Singh", condition: "Sepsis — Multi-Organ Support", admissionDate: "2026-03-12", status: "Critical" },
      { _id: "ADM011", name: "Shalini Gupta", age: 55, gender: "Female", department: "ICU", bed: "I-502", doctor: "Dr. Vikram Singh", condition: "Post Cardiac Arrest", admissionDate: "2026-03-18", status: "Critical" },
      { _id: "ADM012", name: "Vikram Malhotra", age: 42, gender: "Male", department: "ICU", bed: "I-503", doctor: "Dr. Vikram Singh", condition: "Acute Kidney Injury", admissionDate: "2026-03-15", status: "Under Observation" },
      { _id: "ADM013", name: "Neha Saxena", age: 38, gender: "Female", department: "ICU", bed: "I-504", doctor: "Dr. Vikram Singh", condition: "Diabetic Ketoacidosis", admissionDate: "2026-03-19", status: "Stabilizing" },
      { _id: "ADM014", name: "Baby Aarav Sharma", age: 3, gender: "Male", department: "Pediatrics", bed: "P-601", doctor: "Dr. Ananya Das", condition: "Bronchiolitis", admissionDate: "2026-03-18", status: "Improving" },
      { _id: "ADM015", name: "Baby Ishita Roy", age: 1, gender: "Female", department: "Pediatrics", bed: "P-602", doctor: "Dr. Ananya Das", condition: "Neonatal Jaundice", admissionDate: "2026-03-17", status: "Under Phototherapy" },
    ],

    // ── OPD QUEUE (Waiting for Consultation) ──
    opdQueue: [
      { _id: "PAT-OPD-001", name: "Suman Kalyanpur", age: 45, gender: "Female", department: "Neurology", doctorId: "DOC002", reason: "Chronic Cluster Headache", status: "Waiting", registeredAt: "2026-03-19T22:30:00Z" },
      { _id: "PAT-OPD-002", name: "Kishore Kumar", age: 29, gender: "Male", department: "Neurology", doctorId: "DOC002", reason: "Sudden Numbness in Arms", status: "In-Consulation", registeredAt: "2026-03-19T23:00:00Z" },
      { _id: "PAT-OPD-003", name: "Lata Mangeshkar", age: 52, gender: "Female", department: "Neurology", doctorId: "DOC002", reason: "Persistent Dizziness", status: "Waiting", registeredAt: "2026-03-19T23:30:00Z" }
    ],

    // ── STAFF TASKS (Shifting, Cleaning, etc) ──
    staffTasks: [
      { _id: "TASK-001", type: "Shifting", patientName: "Rahul Verma", from: "OPD", to: "Ward N-205", status: "Pending", priority: "High", assignedTo: "STF005" }
    ],

    // ── OT SCHEDULE ──
    otSchedule: [
      { _id: "OT001", patient: "Deepa Nair", patientId: "ADM006", surgeon: "Dr. Amit Patel", procedure: "ACL Reconstruction Surgery", otRoom: "OT-1", time: "08:00 AM — 10:30 AM", status: "Completed", department: "Orthopedics", cost: 45000 },
      { _id: "OT002", patient: "Arjun Mehta", patientId: "ADM001", surgeon: "Dr. Rajesh Kumar", procedure: "Coronary Artery Bypass Graft", otRoom: "OT-2", time: "09:00 AM — 01:00 PM", status: "In Progress", department: "Cardiology", cost: 150000 },
      { _id: "OT003", patient: "Ravi Shankar", patientId: "ADM005", surgeon: "Dr. Amit Patel", procedure: "Open Reduction Internal Fixation", otRoom: "OT-1", time: "11:00 AM — 01:30 PM", status: "Scheduled", department: "Orthopedics", cost: 35000 },
      { _id: "OT004", patient: "Rajesh Khanna", patientId: "ADM010", surgeon: "Dr. Vikram Singh", procedure: "Emergency Laparotomy", otRoom: "OT-3", time: "02:00 PM — 04:00 PM", status: "Scheduled", department: "ICU", cost: 65000 },
      { _id: "OT005", patient: "Suresh Babu", patientId: "ADM003", surgeon: "Dr. Priya Sharma", procedure: "Craniotomy for Tumor Excision", otRoom: "OT-2", time: "03:00 PM — 06:00 PM", status: "Scheduled", department: "Neurology", cost: 120000 },
      { _id: "OT006", patient: "Manish Tiwari", patientId: "ADM007", surgeon: "Dr. Amit Patel", procedure: "Total Knee Replacement", otRoom: "OT-1", time: "04:00 PM — 06:30 PM", status: "Scheduled", department: "Orthopedics", cost: 110000 },
    ],

    // ── EXPANDED STAFF ──
    staff: [
      { _id: "STF001", name: "Anil Kulkarni", role: "Head Nurse", department: "ICU", shift: "Morning", status: "On Duty", phone: "+91 98765-43210", joinDate: "2020-06-15" },
      { _id: "STF002", name: "Priya Menon", role: "Pharmacist", department: "Pharmacy", shift: "Morning", status: "On Duty", phone: "+91 98765-43211", joinDate: "2021-01-10" },
      { _id: "STF003", name: "Suresh Raina", role: "Lab Technician", department: "Diagnostics", shift: "Morning", status: "On Duty", phone: "+91 98765-43212", joinDate: "2019-08-20" },
      { _id: "STF004", name: "Meena Kumari", role: "Receptionist", department: "Front Desk", shift: "Morning", status: "On Duty", phone: "+91 98765-43213", joinDate: "2022-03-05" },
      { _id: "STF005", name: "Ramesh Yadav", role: "Ward Boy", department: "General Medicine", shift: "Morning", status: "On Duty", phone: "+91 98765-43214", joinDate: "2021-11-12" },
      { _id: "STF006", name: "Sunita Devi", role: "Staff Nurse", department: "Cardiology", shift: "Evening", status: "On Duty", phone: "+91 98765-43215", joinDate: "2018-04-18" },
      { _id: "STF007", name: "Karan Malhotra", role: "Anesthesiologist", department: "OT", shift: "Morning", status: "On Duty", phone: "+91 98765-43216", joinDate: "2017-09-01" },
      { _id: "STF008", name: "Fatima Sheikh", role: "Staff Nurse", department: "Pediatrics", shift: "Night", status: "On Duty", phone: "+91 98765-43217", joinDate: "2020-12-25" },
      { _id: "STF009", name: "Gopal Krishnan", role: "Radiologist Tech", department: "Diagnostics", shift: "Morning", status: "On Leave", phone: "+91 98765-43218", joinDate: "2019-05-30" },
      { _id: "STF010", name: "Anjali Bhatt", role: "Staff Nurse", department: "Neurology", shift: "Evening", status: "On Duty", phone: "+91 98765-43219", joinDate: "2021-07-14" },
      { _id: "STF011", name: "Deepak Chauhan", role: "Security Officer", department: "Administration", shift: "Night", status: "On Duty", phone: "+91 98765-43220", joinDate: "2022-01-01" },
      { _id: "STF012", name: "Rekha Mishra", role: "Dietitian", department: "General Medicine", shift: "Morning", status: "On Duty", phone: "+91 98765-43221", joinDate: "2020-09-10" },
      { _id: "STF013", name: "Sanjay Gupta", role: "OT Technician", department: "OT", shift: "Morning", status: "On Duty", phone: "+91 98765-43222", joinDate: "2018-11-20" },
      { _id: "STF014", name: "Nandini Rao", role: "Billing Executive", department: "Finance", shift: "Morning", status: "On Duty", phone: "+91 98765-43223", joinDate: "2022-06-01" },
      { _id: "STF015", name: "Mohammad Irfan", role: "Ambulance Driver", department: "Emergency", shift: "Night", status: "On Duty", phone: "+91 98765-43224", joinDate: "2019-02-14" },
    ],

    // ── EXPANDED MEDICINE INVENTORY ──
    medicines: [
      { _id: "MED001", name: "Paracetamol 500mg (Dolo-650)", category: "Analgesics", stock: 1250, unit: "Tablets", status: "In Stock", batch: "B2026-001", expiry: "2027-06-30", supplier: "Micro Labs Ltd", price: 15 },
      { _id: "MED002", name: "Amoxicillin 250mg (Mox)", category: "Antibiotics", stock: 45, unit: "Capsules", status: "Low Stock", batch: "B2026-002", expiry: "2027-03-15", supplier: "Ranbaxy Labs", price: 85 },
      { _id: "MED003", name: "Insulin Glargine (Lantus)", category: "Antidiabetic", stock: 12, unit: "Vials", status: "Critical", batch: "B2026-003", expiry: "2026-12-31", supplier: "Sanofi India", price: 450 },
      { _id: "MED004", name: "Atorvastatin 10mg (Lipitor)", category: "Statins", stock: 800, unit: "Tablets", status: "In Stock", batch: "B2026-004", expiry: "2027-09-20", supplier: "Pfizer India", price: 120 },
      { _id: "MED005", name: "Amlodipine 5mg (Norvasc)", category: "Antihypertensives", stock: 600, unit: "Tablets", status: "In Stock", batch: "B2026-005", expiry: "2027-08-10", supplier: "Cipla Ltd", price: 45 },
      { _id: "MED006", name: "Metformin 500mg (Glucophage)", category: "Antidiabetic", stock: 900, unit: "Tablets", status: "In Stock", batch: "B2026-006", expiry: "2027-11-25", supplier: "USV Pvt Ltd", price: 35 },
      { _id: "MED007", name: "Omeprazole 20mg (Prilosec)", category: "Antacids", stock: 30, unit: "Capsules", status: "Low Stock", batch: "B2026-007", expiry: "2027-04-18", supplier: "Dr Reddy's", price: 65 },
      { _id: "MED008", name: "Ceftriaxone 1g (Monocef)", category: "Antibiotics", stock: 200, unit: "Injections", status: "In Stock", batch: "B2026-008", expiry: "2027-07-22", supplier: "Aristo Pharma", price: 180 },
      { _id: "MED009", name: "Azithromycin 500mg (Azithral)", category: "Antibiotics", stock: 350, unit: "Tablets", status: "In Stock", batch: "B2026-009", expiry: "2027-05-14", supplier: "Alembic Pharma", price: 95 },
      { _id: "MED010", name: "Pantoprazole 40mg (Pan-D)", category: "Antacids", stock: 8, unit: "Tablets", status: "Critical", batch: "B2026-010", expiry: "2026-10-30", supplier: "Sun Pharma", price: 110 },
      { _id: "MED011", name: "Diclofenac 50mg (Voveran)", category: "NSAIDs", stock: 500, unit: "Tablets", status: "In Stock", batch: "B2026-011", expiry: "2027-12-01", supplier: "Novartis India", price: 25 },
      { _id: "MED012", name: "Ciprofloxacin 500mg (Ciplox)", category: "Antibiotics", stock: 0, unit: "Tablets", status: "Out of Stock", batch: "B2025-012", expiry: "2026-09-15", supplier: "Cipla Ltd", price: 75 },
      { _id: "MED013", name: "Salbutamol Inhaler (Asthalin)", category: "Bronchodilators", stock: 75, unit: "Inhalers", status: "In Stock", batch: "B2026-013", expiry: "2027-10-08", supplier: "Cipla Ltd", price: 220 },
      { _id: "MED014", name: "Morphine 10mg (MST)", category: "Opioid Analgesics", stock: 20, unit: "Ampoules", status: "Low Stock", batch: "B2026-014", expiry: "2027-01-20", supplier: "Govt Medical Store", price: 40 },
      { _id: "MED015", name: "Heparin 5000IU (Clexane)", category: "Anticoagulants", stock: 150, unit: "Injections", status: "In Stock", batch: "B2026-015", expiry: "2027-06-05", supplier: "Sanofi India", price: 550 },
      { _id: "CON001", name: "Surgical Gloves (Size 7)", category: "Consumables", stock: 5000, unit: "Pairs", status: "In Stock", batch: "B2026-C01", expiry: "2029-12-31", supplier: "Kanam Latex", price: 25 },
      { _id: "CON002", name: "Disposable Syringe (5ml)", category: "Consumables", stock: 2000, unit: "Units", status: "In Stock", batch: "B2026-C02", expiry: "2028-06-30", supplier: "HMD Ltd", price: 10 },
      { _id: "CON003", name: "IV Cannula (20G)", category: "Consumables", stock: 300, unit: "Units", status: "In Stock", batch: "B2026-C03", expiry: "2028-01-15", supplier: "Becton Dickinson", price: 45 },
    ],
    masterDiagnostics: [
      { _id: "DIAG001", name: "Complete Blood Count (CBC)", category: "Hematology", price: 500 },
      { _id: "DIAG002", name: "Blood Glucose (Fasting)", category: "Biochemistry", price: 150 },
      { _id: "DIAG003", name: "Blood Glucose (Post-Prandial)", category: "Biochemistry", price: 150 },
      { _id: "DIAG004", name: "Liver Function Test (LFT)", category: "Biochemistry", price: 1200 },
      { _id: "DIAG005", name: "Kidney Function Test (KFT)", category: "Biochemistry", price: 1000 },
      { _id: "DIAG006", name: "Lipid Profile", category: "Biochemistry", price: 800 },
      { _id: "DIAG007", name: "HbA1c", category: "Biochemistry", price: 550 },
      { _id: "DIAG008", name: "Serum Electrolytes", category: "Biochemistry", price: 700 },
      { _id: "DIAG009", name: "HIV I & II", category: "Serology", price: 600 },
      { _id: "DIAG010", name: "HBsAg (Hepatitis B)", category: "Serology", price: 500 },
      { _id: "DIAG011", name: "HCV (Hepatitis C)", category: "Serology", price: 800 },
      { _id: "DIAG012", name: "Widal Test (Typhoid)", category: "Serology", price: 400 },
      { _id: "DIAG013", name: "Urine Routine & Microscopy", category: "Microbiology", price: 250 },
      { _id: "DIAG014", name: "X-Ray Chest PA View", category: "Radiology", price: 600 },
      { _id: "DIAG015", name: "USG Abdomen & Pelvis", category: "Radiology", price: 1500 },
      { _id: "DIAG016", name: "CT Scan Brain (Plain)", category: "Radiology", price: 3500 },
      { _id: "DIAG017", name: "MRI Brain (Plain)", category: "Radiology", price: 7500 },
      { _id: "DIAG018", name: "ECG (12-Lead)", category: "Cardiology", price: 300 },
      { _id: "DIAG019", name: "Echocardiogram", category: "Cardiology", price: 2500 },
      { _id: "DIAG020", name: "Thyroid Function Test (T3, T4, TSH)", category: "Endocrinology", price: 850 },
    ],
    purchaseOrders: [
      { _id: "PO-77881122", medicineName: "Amoxicillin 250mg", supplier: "Ranbaxy Labs", quantity: 500, status: "Delivered", createdAt: "2026-03-10T10:00:00Z" },
      { _id: "PO-77881123", medicineName: "Insulin Glargine", supplier: "Sanofi India", quantity: 100, status: "In Transit", createdAt: "2026-03-15T14:30:00Z" },
    ]
  }
}
const store = global._mongoStore

// Migration: ensure new collections exist in already-running stores
function migrateStore() {
  if (!store.prescriptions) store.prescriptions = []
  if (!store.labTests) store.labTests = []

  // Ensure master diagnostics exist for consultation tool
  if (!store.masterDiagnostics || !Array.isArray(store.masterDiagnostics) || store.masterDiagnostics.length === 0) {
    console.log("[AA] Populating masterDiagnostics registry...");
    store.masterDiagnostics = [
      { _id: "DIAG001", name: "Complete Blood Count (CBC)", category: "Hematology", price: 500 },
      { _id: "DIAG002", name: "Blood Glucose (Fasting)", category: "Biochemistry", price: 150 },
      { _id: "DIAG003", name: "Blood Glucose (Post-Prandial)", category: "Biochemistry", price: 150 },
      { _id: "DIAG004", name: "Liver Function Test (LFT)", category: "Biochemistry", price: 1200 },
      { _id: "DIAG005", name: "Kidney Function Test (KFT)", category: "Biochemistry", price: 1000 },
      { _id: "DIAG006", name: "Lipid Profile", category: "Biochemistry", price: 800 },
      { _id: "DIAG007", name: "HbA1c", category: "Biochemistry", price: 550 },
      { _id: "DIAG008", name: "Serum Electrolytes", category: "Biochemistry", price: 700 },
      { _id: "DIAG009", name: "HIV I & II", category: "Serology", price: 600 },
      { _id: "DIAG010", name: "HBsAg (Hepatitis B)", category: "Serology", price: 500 },
      { _id: "DIAG011", name: "HCV (Hepatitis C)", category: "Serology", price: 800 },
      { _id: "DIAG012", name: "Widal Test (Typhoid)", category: "Serology", price: 400 },
      { _id: "DIAG013", name: "Urine Routine & Microscopy", category: "Microbiology", price: 250 },
      { _id: "DIAG014", name: "X-Ray Chest PA View", category: "Radiology", price: 600 },
      { _id: "DIAG015", name: "USG Abdomen & Pelvis", category: "Radiology", price: 1500 },
      { _id: "DIAG016", name: "CT Scan Brain (Plain)", category: "Radiology", price: 3500 },
      { _id: "DIAG017", name: "MRI Brain (Plain)", category: "Radiology", price: 7500 },
      { _id: "DIAG018", name: "ECG (12-Lead)", category: "Cardiology", price: 300 },
      { _id: "DIAG019", name: "Echocardiogram", category: "Cardiology", price: 2500 },
      { _id: "DIAG020", name: "Thyroid Function Test (T3, T4, TSH)", category: "Endocrinology", price: 850 },
    ];
  }

  // Force update to 10 beds per dept and add rates
  if (store.departments) {
    const rates = { Cardiology: 3500, Neurology: 4000, Orthopedics: 3000, "General Medicine": 2000, ICU: 8500, Pediatrics: 2500 }
    store.departments.forEach(d => {
      if (d.totalBeds !== 10) d.totalBeds = 10
      if (!d.bedRate) d.bedRate = rates[d.name] || 2000
    })
  }

  // Ensure doctors exist
  if (!store.users) store.users = []
  const defaultDoctors = [
    { _id: "DOC001", name: "Dr. Rajesh Kumar", userType: "doctor", specialization: "Cardiology", email: "rajesh@arogya.com", password: "Doctor@123" },
    { _id: "DOC002", name: "Dr. Priya Sharma", userType: "doctor", specialization: "Neurology", email: "priya@arogya.com", password: "Doctor@123" },
    { _id: "DOC003", name: "Dr. Amit Patel", specialization: "Orthopedics", userType: "doctor", email: "amit@arogya.com", password: "Doctor@123" },
  ]
  const defaultStaff = [
    { _id: "STF005", name: "Ramesh Yadav", userType: "staff", role: "Ward Boy", email: "ramesh@arogya.com", password: "Staff@123", department: "General Medicine" },
    { _id: "STF006", name: "Sunita Kapoor", userType: "staff", role: "Nurse", email: "sunita@arogya.com", password: "Nurse@123", department: "Cardiology" },
    { _id: "STF010", name: "Anjali Bhatt", userType: "staff", role: "Nurse", email: "anjali@arogya.com", password: "Nurse@123", department: "Neurology" },
    { _id: "STF003", name: "Suresh Raina", userType: "staff", role: "Lab Technician", email: "suresh@arogya.com", password: "Lab@123", department: "Diagnostics" },
    { _id: "ADMIN001", name: "Hospital Admin", userType: "admin", email: "admin@arogya.com", password: "Admin@123", role: "Super Admin" },
  ]

  defaultDoctors.forEach(doc => {
    if (!store.users.find(u => u.email === doc.email)) {
      store.users.push(doc)
    }
  })

  defaultStaff.forEach(staff => {
    if (!store.users.find(u => u.email === staff.email)) {
      store.users.push(staff)
    }
  })

  // Ensure doctors have passwords (backup check)
  store.users.forEach(u => {
    if (u.userType === "doctor" && !u.password) {
      u.password = "Doctor@123"
    }
  })

  // Ensure doctors have passwords
  if (store.users) {
    store.users.forEach(u => {
      if (u.userType === "doctor" && !u.password) {
        u.password = "Doctor@123"
      }
    })
  }

  // Initialize medication log and daily plan for patients
  if (store.admittedPatients) {
    store.admittedPatients.forEach(p => {
      if (!p.medicationLog) p.medicationLog = []
      if (!p.dailyMedicationPlan) p.dailyMedicationPlan = []
    })
  }

  // Migrate medicine prices if missing
  if (store.medicines) {
    const defaultPrices = {
      "Paracetamol 500mg (Dolo-650)": 15,
      "Amoxicillin 250mg (Mox)": 85,
      "Insulin Glargine (Lantus)": 450,
      "Atorvastatin 10mg (Lipitor)": 120,
      "Amlodipine 5mg (Norvasc)": 45,
      "Metformin 500mg (Glucophage)": 35,
      "Omeprazole 20mg (Prilosec)": 65,
      "Ceftriaxone 1g (Monocef)": 180,
      "Azithromycin 500mg (Azithral)": 95,
      "Pantoprazole 40mg (Pan-D)": 110,
      "Diclofenac 50mg (Voveran)": 25,
      "Ciprofloxacin 500mg (Ciplox)": 75,
      "Salbutamol Inhaler (Asthalin)": 220,
      "Morphine 10mg (MST)": 40,
      "Heparin 5000IU (Clexane)": 550,
      "Surgical Gloves (Size 7)": 25,
      "Disposable Syringe (5ml)": 10,
      "IV Cannula (20G)": 45
    }
    store.medicines.forEach(m => {
      if (m.price === undefined || m.price === 0) {
        m.price = defaultPrices[m.name] || 50 // Default fallback
      }
    })

    // Also fix existing records in patient logs
    if (store.admittedPatients) {
      store.admittedPatients.forEach(p => {
        if (p.medicationLog) {
          p.medicationLog.forEach(log => {
            if (log.price === undefined || log.price === 0) {
              const med = store.medicines?.find(m => m._id === log.medicineId || m.name === log.name)
              log.price = med?.price || defaultPrices[log.name] || 50
            }
          })
        }
      })
    }
  }

  // Check if we need to add more beds (Force to 60 beds total)
  const currentBedCount = store.beds?.length || 0
  if (currentBedCount < 60) {
    const allNewBeds = [
      ...generateBeds("Cardiology", "C", 101, 10),
      ...generateBeds("Neurology", "N", 201, 10),
      ...generateBeds("Orthopedics", "O", 301, 10),
      ...generateBeds("General Medicine", "G", 401, 10),
      ...generateBeds("ICU", "I", 501, 10),
      ...generateBeds("Pediatrics", "P", 601, 10),
    ]

    // Merge: Keep occupied status for already known patients
    store.beds = allNewBeds.map(newBed => {
      const existing = store.beds.find(old => old.bedNumber === newBed.bedNumber)
      return existing ? existing : newBed
    })
  }
}

// Run migration immediately
migrateStore()

export async function connectDB() {
  migrateStore()
  return store
}

export function getDB() {
  migrateStore()
  return store
}

export async function disconnectDB() {
  console.log("[AA] Database disconnected")
}

export async function closeConnection() {
  console.log("[AA] Connection closed")
}

export { store }
