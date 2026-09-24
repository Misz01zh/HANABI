import type { StorefrontMovie } from "@/lib/movies";

export type CartItem = Pick<StorefrontMovie, "id" | "title" | "priceCents"> & {
  quantity: number;
};

const CART_STORAGE_KEY = "hanabi-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(CART_STORAGE_KEY);
    const cart = value ? JSON.parse(value) : [];
    return Array.isArray(cart) ? cart.filter((item) => typeof item?.id === "string") : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function addMovieToCart(movie: StorefrontMovie) {
  if (movie.priceCents <= 0) return getCart();

  const cart = getCart();
  const existing = cart.find((item) => item.id === movie.id);
  const next = existing
    ? cart.map((item) => item.id === movie.id ? { ...item, quantity: 1 } : item)
    : [...cart, { id: movie.id, title: movie.title, priceCents: movie.priceCents, quantity: 1 }];

  saveCart(next);
  return next;
}

export function removeFromCart(id: string) {
  const next = getCart().filter((item) => item.id !== id);
  saveCart(next);
  return next;
}

export function formatCny(cents: number) {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(cents / 100);
}
