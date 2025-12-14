const mongoose = require("mongoose")

// Hospital Schema
const hospitalSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  contact: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

// Department Schema
const departmentSchema = new mongoose.Schema({
  deptId: { type: String, required: true, unique: true },
  deptName: { type: String, required: true },
  specialization: { type: String, required: true },
  hospitalId: { type: String, required: true, ref: "Hospital" },
  createdAt: { type: Date, default: Date.now },
})

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  doctorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  designation: { type: String, required: true },
  specialization: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  deptId: { type: String, required: true, ref: "Department" },
  hospitalId: { type: String, required: true, ref: "Hospital" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

// Patient Schema
const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
  dob: { type: Date, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  allergies: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

// Staff Schema
const staffSchema = new mongoose.Schema({
  staffId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: [
      "Nurse",
      "Receptionist",
      "Admin",
      "Lab Technician",
      "Pharmacist",
      "Ambulance Driver",
      "Ward Boy",
      "Cleaner",
      "Security",
    ],
  },
  shift: { type: String, required: true, enum: ["Morning", "Evening", "Night"] },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hospitalId: { type: String, required: true, ref: "Hospital" },
  deptId: { type: String, ref: "Department" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, ref: "Patient" },
  doctorId: { type: String, required: true, ref: "Doctor" },
  hospitalId: { type: String, required: true, ref: "Hospital" },
  dateTime: { type: Date, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Scheduled", "Completed", "Cancelled", "No Show"],
    default: "Scheduled",
  },
  reason: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
})

// Treatment Schema
const treatmentSchema = new mongoose.Schema({
  treatmentId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, ref: "Patient" },
  doctorId: { type: String, required: true, ref: "Doctor" },
  diagnosis: { type: String, required: true },
  procedure: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Completed", "Discontinued"],
    default: "Active",
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
})

// Medicine Schema
const medicineSchema = new mongoose.Schema({
  medicineId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  stock: { type: Number, required: true, default: 0 },
  manufacturer: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

// Prescription Schema
const prescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, required: true, unique: true },
  treatmentId: { type: String, required: true, ref: "Treatment" },
  patientId: { type: String, required: true, ref: "Patient" },
  doctorId: { type: String, required: true, ref: "Doctor" },
  medicines: [
    {
      medicineId: { type: String, required: true, ref: "Medicine" },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      duration: { type: String, required: true },
    },
  ],
  instructions: { type: String },
  createdAt: { type: Date, default: Date.now },
})

// Lab Test Schema
const labTestSchema = new mongoose.Schema({
  testId: { type: String, required: true, unique: true },
  testName: { type: String, required: true },
  category: { type: String, required: true },
  normalRange: { type: String, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
})

// Lab Report Schema
const labReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  testId: { type: String, required: true, ref: "LabTest" },
  patientId: { type: String, required: true, ref: "Patient" },
  doctorId: { type: String, required: true, ref: "Doctor" },
  result: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Completed", "Reviewed"],
    default: "Pending",
  },
  testDate: { type: Date, required: true },
  reportDate: { type: Date },
  technician: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
})

// Room Schema
const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  roomType: {
    type: String,
    required: true,
    enum: ["ICU", "Private", "General", "Emergency", "Operation Theater"],
  },
  floor: { type: Number, required: true },
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  pricePerDay: { type: Number, required: true },
  facilities: [{ type: String }],
  hospitalId: { type: String, required: true, ref: "Hospital" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

// Bed Schema
const bedSchema = new mongoose.Schema({
  bedId: { type: String, required: true, unique: true },
  bedNo: { type: String, required: true },
  roomId: { type: String, required: true, ref: "Room" },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Occupied", "Maintenance"],
    default: "Available",
  },
  createdAt: { type: Date, default: Date.now },
})

// Admission Schema
const admissionSchema = new mongoose.Schema({
  admissionId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, ref: "Patient" },
  roomId: { type: String, required: true, ref: "Room" },
  bedId: { type: String, required: true, ref: "Bed" },
  doctorId: { type: String, required: true, ref: "Doctor" },
  admissionDate: { type: Date, required: true },
  dischargeDate: { type: Date },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Discharged"],
    default: "Active",
  },
  reason: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
})

// Payment Schema
const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, ref: "Patient" },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["Cash", "Card", "UPI", "Net Banking", "Insurance"],
  },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending",
  },
  transactionId: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
})

// Export all models
module.exports = {
  Hospital: mongoose.model("Hospital", hospitalSchema),
  Department: mongoose.model("Department", departmentSchema),
  Doctor: mongoose.model("Doctor", doctorSchema),
  Patient: mongoose.model("Patient", patientSchema),
  Staff: mongoose.model("Staff", staffSchema),
  Appointment: mongoose.model("Appointment", appointmentSchema),
  Treatment: mongoose.model("Treatment", treatmentSchema),
  Medicine: mongoose.model("Medicine", medicineSchema),
  Prescription: mongoose.model("Prescription", prescriptionSchema),
  LabTest: mongoose.model("LabTest", labTestSchema),
  LabReport: mongoose.model("LabReport", labReportSchema),
  Room: mongoose.model("Room", roomSchema),
  Bed: mongoose.model("Bed", bedSchema),
  Admission: mongoose.model("Admission", admissionSchema),
  Payment: mongoose.model("Payment", paymentSchema),
}
