import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

async function adminClient(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !url || !anonKey || !serviceRoleKey) return null;
  const { data } = await createClient(url, anonKey).auth.getUser(token);
  if (data.user?.app_metadata.role !== "admin") return null;
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

export async function GET(request: NextRequest) {
  const supabase = await adminClient(request); if (!supabase) return NextResponse.json({ error: "Administrator access is required" }, { status: 403 });
  const { data, error } = await supabase.from("movies").select("id, title, description, access, price_cents, preview_seconds, stream_video_uid, created_at").order("created_at", { ascending: false });
  return error ? NextResponse.json({ error: "Could not load movies" }, { status: 500 }) : NextResponse.json({ movies: data });
}

export async function POST(request: NextRequest) {
  const supabase = await adminClient(request); if (!supabase) return NextResponse.json({ error: "Administrator access is required" }, { status: 403 });
  const body = await request.json();
  if (typeof body.title !== "string" || !body.title.trim() || typeof body.access !== "string") return NextResponse.json({ error: "title and access are required" }, { status: 400 });
  const { data, error } = await supabase.from("movies").insert({ title: body.title.trim(), description: typeof body.description === "string" ? body.description : "", access: body.access, price_cents: Number.isInteger(body.priceCents) ? body.priceCents : null, preview_seconds: Number.isInteger(body.previewSeconds) ? body.previewSeconds : 0, stream_video_uid: typeof body.streamVideoUid === "string" && body.streamVideoUid ? body.streamVideoUid : null }).select("id").single();
  return error ? NextResponse.json({ error: "Could not create movie" }, { status: 500 }) : NextResponse.json({ movie: data }, { status: 201 });
}
