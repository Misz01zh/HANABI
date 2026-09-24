import type { CatalogMovie } from "@/lib/catalog";

export type CartItem = Pick<CatalogMovie, "slug" | "title" | "priceCents"> & {
  quantity: number;
};

const CART_STORAGE_KEY = "hanabi-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(CART_STORAGE_KEY);
    const cart = value ? JSON.parse(value) : [];
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function addMovieToCart(movie: CatalogMovie) {
  if (movie.priceCents <= 0) return getCart();

  const cart = getCart();
  const existing = cart.find((item) => item.slug === movie.slug);
  const next = existing
    ? cart.map((item) => item.slug === movie.slug ? { ...item, quantity: 1 } : item)
    : [...cart, { slug: movie.slug, title: movie.title, priceCents: movie.priceCents, quantity: 1 }];

  saveCart(next);
  return next;
}

export function removeFromCart(slug: string) {
  const next = getCart().filter((item) => item.slug !== slug);
  saveCart(next);
  return next;
}

export function formatCny(cents: number) {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(cents / 100);
}
