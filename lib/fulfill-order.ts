import { createClient } from "@supabase/supabase-js";

export async function fulfillPaidOrder(orderId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Order service is not configured");

  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, status")
    .eq("id", orderId)
    .single<{ id: string; user_id: string; status: "pending" | "paid" | "refunded" | "failed" }>();

  if (orderError || !order) throw new Error("Order not found");
  if (order.status === "paid") return { fulfilled: false, reason: "already_paid" };
  if (order.status !== "pending") throw new Error("Order cannot be fulfilled");

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("movie_id")
    .eq("order_id", order.id)
    .returns<{ movie_id: string }[]>();
  if (itemsError || !items?.length) throw new Error("Order has no items");

  const { error: entitlementError } = await supabase.from("entitlements").insert(
    items.map((item) => ({ user_id: order.user_id, movie_id: item.movie_id, source: "purchase" })),
  );
  if (entitlementError) throw new Error("Could not grant viewing access");

  const { error: updateError } = await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);
  if (updateError) throw new Error("Could not finalize order");

  return { fulfilled: true, orderId: order.id, movieIds: items.map((item) => item.movie_id) };
}
