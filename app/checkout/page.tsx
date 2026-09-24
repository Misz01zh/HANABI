"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCny, getCart, type CartItem } from "@/lib/cart";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => setItems(getCart()), []);

  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  function continueToPayment() {
    setMessage("支付网关尚未接入；订单会在接入支付回调后创建。");
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 32, fontFamily: "system-ui" }}>
      <p><Link href="/cart">← 返回购物车</Link></p>
      <h1>确认订单</h1>
      {items.length === 0 ? (
        <p>没有待结算商品。</p>
      ) : (
        <>
          <ul>{items.map((item) => <li key={item.slug}>{item.title} · {formatCny(item.priceCents)}</li>)}</ul>
          <p><strong>应付金额：{formatCny(total)}</strong></p>
          <button type="button" onClick={continueToPayment}>选择支付方式</button>
          <p aria-live="polite">{message}</p>
        </>
      )}
    </main>
  );
}
