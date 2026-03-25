import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * 🚀 PaymentPoint Webhook Handler (TypeScript for Next.js)
 * Converts their Express example into a Next.js API route.
 */

export async function POST(request: Request) {
  try {
    // 🔹 1. Read the raw body text (PaymentPoint sends JSON)
    const rawBody = await request.text();

    // 🪵 Log the raw body for debugging (so you can see what PaymentPoint actually sent)
    console.log("📦 Raw webhook body received:", rawBody);

    // 🔹 2. Try parsing JSON safely
    let data: any;
    try {
      data = JSON.parse(rawBody);
    } catch (err: any) {
      console.error("❌ Invalid JSON received from PaymentPoint:", err.message);
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid JSON format. Ensure 'Content-Type: application/json' is set.",
          rawBody,
        },
        { status: 400 }
      );
    }

    // 🔹 3. Get signature from headers
    const signature = request.headers.get("paymentpoint-signature");
    if (!signature) {
      console.warn("⚠️ Missing PaymentPoint-Signature header");
      return NextResponse.json(
        { status: "error", message: "Missing signature" },
        { status: 400 }
      );
    }

    // 🔹 4. Your secret key from PaymentPoint dashboard
    const securityKey =
      process.env.PAYMENTPOINT_WEBHOOK_SECRET ||
      "b6c78bbe842c103548b6e93360def7a9fee8d89b847e7579ac648206898149e699abec0fc05518faefbc86ce43269dcb90a7e9665895993cfa930fe0"; // ⚠️ Replace with your real secret

    // 🔹 5. Recreate hash using raw body + secret key
    const calculatedSignature = crypto
      .createHmac("sha256", securityKey)
      .update(rawBody)
      .digest("hex");

    // 🔹 6. Validate signature
    if (calculatedSignature !== signature) {
      console.error("❌ Invalid PaymentPoint signature");
      console.log("Expected:", calculatedSignature);
      console.log("Received:", signature);
      return NextResponse.json(
        { status: "error", message: "Invalid signature" },
        { status: 403 }
      );
    }

    // ✅ 7. Signature valid — process the webhook data
    const {
      transaction_id,
      amount_paid,
      settlement_amount,
      transaction_status,
      settlement_fee,
      notification_status,
      sender,
      receiver,
      customer,
      description,
      timestamp,
    } = data;

    console.log("✅ PaymentPoint Webhook Verified Successfully!");
    console.log("Transaction ID:", transaction_id);
    console.log("Amount Paid:", amount_paid);
    console.log("Settlement Amount:", settlement_amount);
    console.log("Status:", transaction_status);
    console.log("Receiver Account:", receiver?.account_number);
    console.log("Timestamp:", timestamp);
    console.log("Customer:", customer?.email);
    console.log("Description:", description);

    // ✅ 8. Respond to PaymentPoint that webhook was processed
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error: any) {
    console.error("🔥 Webhook error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

// Optional GET route to verify webhook is reachable
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "PaymentPoint webhook active 🚀",
  });
}
