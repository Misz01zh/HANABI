import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const accessTypes = ["free", "subscription", "purchase", "subscription_or_purchase"];
const movieStatuses = ["draft", "published", "archived"];

function isHttpsUrl(value: string) {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

async function adminClient(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !url || !anonKey || !serviceRoleKey) return null;
  const { data } = await createClient(url, anonKey).auth.getUser(token);
  if (data.user?.app_metadata.role !== "admin") return null;
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await adminClient(request);
  if (!db) return NextResponse.json({ error: "Administrator access is required" }, { status: 403 });
  const body = await request.json();
  const { id } = await params;
  const update: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) update.title = body.title.trim();
  if (typeof body.description === "string") update.description = body.description;
  if (typeof body.posterUrl === "string" && (body.posterUrl === "" || isHttpsUrl(body.posterUrl))) update.poster_url = body.posterUrl || null;
  if (typeof body.access === "string" && accessTypes.includes(body.access)) update.access = body.access;
  if (Number.isInteger(body.priceCents) && body.priceCents >= 0) update.price_cents = body.priceCents;
  if (Number.isInteger(body.previewSeconds) && body.previewSeconds >= 0) update.preview_seconds = body.previewSeconds;
  if (typeof body.streamVideoUid === "string") update.stream_video_uid = body.streamVideoUid || null;
  if (typeof body.status === "string" && movieStatuses.includes(body.status)) {
    update.status = body.status;
    update.deleted_at = body.status === "archived" ? new Date().toISOString() : null;
  }
  if (!Object.keys(update).length) return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  const { error } = await db.from("movies").update(update).eq("id", id);
  return error ? NextResponse.json({ error: "Could not update movie" }, { status: 500 }) : NextResponse.json({ updated: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await adminClient(request);
  if (!db) return NextResponse.json({ error: "Administrator access is required" }, { status: 403 });
  const { id } = await params;
  const { error } = await db.from("movies").update({ status: "archived", deleted_at: new Date().toISOString() }).eq("id", id);
  return error ? NextResponse.json({ error: "Could not archive movie" }, { status: 500 }) : NextResponse.json({ deleted: true, hardDeleted: false });
}
