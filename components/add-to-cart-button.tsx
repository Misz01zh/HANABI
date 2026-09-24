"use client";

import { useState } from "react";
import { addMovieToCart } from "@/lib/cart";
import type { StorefrontMovie } from "@/lib/movies";

export function AddToCartButton({ movie }: { movie: StorefrontMovie }) {
  const [message, setMessage] = useState("");
  const canPurchase = movie.priceCents > 0;

  function addToCart() {
    addMovieToCart(movie);
    setMessage("已加入购物车");
  }

  if (!canPurchase) {
    return <p>{movie.access === "subscription" ? "此片仅对会员开放" : "此片可免费试看"}</p>;
  }

  return (
    <div>
      <button type="button" onClick={addToCart}>加入购物车</button>
      <p aria-live="polite">{message}</p>
    </div>
  );
}
