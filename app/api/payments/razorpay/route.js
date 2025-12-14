import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { createPayment } from "@/lib/mongodb-models"
import { verifyToken } from "@/lib/auth"

export async function POST(request) {
  try {
    await connectDB()
    const token = request.headers.get("authorization")?.split(" ")[1]
    const user = verifyToken(token)

    const { amount, invoiceNo, description, appointmentId } = await request.json()

    if (!amount || !invoiceNo) {
      return NextResponse.json({ error: "Amount and invoice number are required" }, { status: 400 })
    }

    // Create payment record in MongoDB
    const paymentData = {
      patientId: user.userId,
      amount,
      invoiceNo,
      description,
      appointmentId,
      status: "pending",
      paymentMethod: "razorpay",
      createdAt: new Date(),
    }

    const result = await createPayment(paymentData)

    // TODO: Integrate with Razorpay API for actual payment processing
    // Razorpay options would go here when you add credentials

    return NextResponse.json({
      success: true,
      paymentId: result.insertedId,
      invoiceNo,
      amount,
      currency: "INR",
      message: "Payment initiated. Configure Razorpay keys for live payments.",
    })
  } catch (error) {
    console.error("[AA] Razorpay error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
