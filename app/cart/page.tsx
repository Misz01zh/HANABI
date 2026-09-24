"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCny, getCart, removeFromCart, type CartItem } from "@/lib/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => setItems(getCart()), []);

  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  function removeItem(id: string) {
    setItems(removeFromCart(id));
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 32, fontFamily: "system-ui" }}>
      <p><Link href="/">← 继续购物</Link></p>
      <h1>购物车</h1>
      {items.length === 0 ? (
        <p>购物车为空。</p>
      ) : (
        <>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                {item.title} · {formatCny(item.priceCents)}
                <button type="button" onClick={() => removeItem(item.id)}>移除</button>
              </li>
            ))}
          </ul>
          <p><strong>合计：{formatCny(total)}</strong></p>
          <Link href="/checkout">去结算</Link>
        </>
      )}
    </main>
  );
}
