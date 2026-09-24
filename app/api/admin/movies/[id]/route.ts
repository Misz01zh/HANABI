import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const accessTypes = ["free", "subscription", "purchase", "subscription_or_purchase"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !url || !anonKey || !serviceRoleKey) return NextResponse.json({ error: "Administrator access is required" }, { status: 403 });
  const { data } = await createClient(url, anonKey).auth.getUser(token);
  if (data.user?.app_metadata.role !== "admin") return NextResponse.json({ error: "Administrator access is required" }, { status: 403 });

  const body = await request.json(); const { id } = await params; const update: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) update.title = body.title.trim();
  if (typeof body.description === "string") update.description = body.description;
  if (typeof body.access === "string" && accessTypes.includes(body.access)) update.access = body.access;
  if (Number.isInteger(body.priceCents) && body.priceCents >= 0) update.price_cents = body.priceCents;
  if (Number.isInteger(body.previewSeconds) && body.previewSeconds >= 0) update.preview_seconds = body.previewSeconds;
  if (typeof body.streamVideoUid === "string") update.stream_video_uid = body.streamVideoUid || null;
  if (!Object.keys(update).length) return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const { error } = await admin.from("movies").update(update).eq("id", id);
  return error ? NextResponse.json({ error: "Could not update movie" }, { status: 500 }) : NextResponse.json({ updated: true });
}
