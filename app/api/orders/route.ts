import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { PaymentProvider } from "@/lib/payments";

const paymentProviders: PaymentProvider[] = ["stripe", "wechat_pay", "alipay"];
type MovieForOrder = { id: string; title: string; price_cents: number | null };
type PurchasableMovie = MovieForOrder & { price_cents: number };

function isPurchasableMovie(movie: MovieForOrder): movie is PurchasableMovie {
  return typeof movie.price_cents === "number" && Number.isInteger(movie.price_cents) && movie.price_cents > 0;
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.replace(/^Bearer\s+/i, "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!accessToken) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) return NextResponse.json({ error: "Order service is not configured" }, { status: 500 });

  let movieIds: unknown; let provider: unknown;
  try { ({ movieIds, provider } = await request.json()); }
  catch { return NextResponse.json({ error: "A JSON body is required" }, { status: 400 }); }
  if (!Array.isArray(movieIds) || movieIds.length === 0 || !movieIds.every((id) => typeof id === "string")) return NextResponse.json({ error: "movieIds must be a non-empty string array" }, { status: 400 });
  if (typeof provider !== "string" || !paymentProviders.includes(provider as PaymentProvider)) return NextResponse.json({ error: "A supported payment provider is required" }, { status: 400 });

  const userClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: userData, error: userError } = await userClient.auth.getUser(accessToken);
  if (userError || !userData.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const uniqueMovieIds = [...new Set(movieIds as string[])];
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: movies, error: movieError } = await adminClient.from("movies").select("id, title, price_cents").in("id", uniqueMovieIds).returns<MovieForOrder[]>();
  if (movieError || !movies || movies.length !== uniqueMovieIds.length) return NextResponse.json({ error: "One or more movies are unavailable" }, { status: 400 });

  const purchasableMovies = movies.filter(isPurchasableMovie);
  if (purchasableMovies.length !== movies.length) return NextResponse.json({ error: "Only paid movies can be ordered" }, { status: 400 });
  const amountCents = purchasableMovies.reduce((sum, movie) => sum + movie.price_cents, 0);

  const { data: order, error: orderError } = await adminClient.from("orders").insert({ user_id: userData.user.id, provider, amount_cents: amountCents, currency: "CNY", status: "pending" }).select("id").single<{ id: string }>();
  if (orderError || !order) return NextResponse.json({ error: "Could not create order" }, { status: 500 });

  const { error: itemError } = await adminClient.from("order_items").insert(purchasableMovies.map((movie) => ({ order_id: order.id, movie_id: movie.id, title: movie.title, unit_price_cents: movie.price_cents, quantity: 1 })));
  if (itemError) { await adminClient.from("orders").delete().eq("id", order.id); return NextResponse.json({ error: "Could not create order items" }, { status: 500 }); }
  return NextResponse.json({ orderId: order.id, amountCents, currency: "CNY", provider, status: "pending" }, { status: 201 });
}
