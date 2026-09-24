"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { formatCny, getCart, type CartItem } from "@/lib/cart";
import type { PaymentProvider } from "@/lib/payments";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [provider, setProvider] = useState<PaymentProvider>("stripe");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setItems(getCart()), []);
  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  async function createOrder() {
    setSubmitting(true);
    setMessage("");
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setMessage("请先登录后再创建订单。");
      setSubmitting(false);
      return;
    }

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ movieIds: items.map((item) => item.id), provider }),
    });
    const result = await response.json();
    setMessage(response.ok ? `订单 ${result.orderId} 已创建，等待支付。` : result.error ?? "创建订单失败。");
    setSubmitting(false);
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 32, fontFamily: "system-ui" }}>
      <p><Link href="/cart">← 返回购物车</Link></p>
      <h1>确认订单</h1>
      {items.length === 0 ? <p>没有待结算商品。</p> : <>
        <ul>{items.map((item) => <li key={item.id}>{item.title} · {formatCny(item.priceCents)}</li>)}</ul>
        <p><strong>应付金额：{formatCny(total)}</strong></p>
        <label>支付方式 <select value={provider} onChange={(event) => setProvider(event.target.value as PaymentProvider)}><option value="stripe">Stripe</option><option value="wechat_pay">微信支付</option><option value="alipay">支付宝</option></select></label>
        <p><button type="button" onClick={createOrder} disabled={submitting}>{submitting ? "创建中…" : "创建待支付订单"}</button></p>
        <p aria-live="polite">{message}</p>
      </>}
    </main>
  );
}
