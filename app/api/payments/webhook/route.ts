import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { fulfillPaidOrder } from "@/lib/fulfill-order";

export async function POST(request: NextRequest) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  const signature = request.headers.get("x-hanabi-signature");
  const body = await request.text();

  if (!secret || !signature) return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(body) as { orderId?: string; paid?: boolean };
    if (!payload.orderId || payload.paid !== true) return NextResponse.json({ received: true });
    const result = await fulfillPaidOrder(payload.orderId);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    console.error("Payment webhook failed", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
