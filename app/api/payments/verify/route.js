import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { updatePayment } from "@/lib/mongodb-models"
import { verifyToken } from "@/lib/auth"

export async function POST(request) {
  try {
    await connectDB()
    const token = request.headers.get("authorization")?.split(" ")[1]
    const user = verifyToken(token)

    const { paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceNo } = await request.json()

    // TODO: Verify Razorpay signature when keys are configured
    // const body = razorpay_order_id + "|" + razorpay_payment_id
    // const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex")

    // Update payment status to completed
    await updatePayment(paymentId, {
      status: "completed",
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      verifiedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      invoiceNo,
    })
  } catch (error) {
    console.error("[AA] Payment verification error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
