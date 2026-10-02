import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const movieStatuses = ["draft", "published", "archived"];
const videoSources = ["cloudflare_stream", "supabase_storage"];

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

export async function GET(request: NextRequest) {
  const db = await adminClient(request);
  if (!db) return NextResponse.json({ error: "Administrator access is required" }, { status: 403 });
  const { data, error } = await db.from("movies").select("id, title, description, poster_url, access, price_cents, preview_seconds, video_source, stream_video_uid, storage_bucket, storage_path, status, deleted_at, created_at").order("created_at", { ascending: false });
  return error ? NextResponse.json({ error: "Could not load movies" }, { status: 500 }) : NextResponse.json({ movies: data });
}

export async function POST(request: NextRequest) {
  const db = await adminClient(request);
  if (!db) return NextResponse.json({ error: "Administrator access is required" }, { status: 403 });
  const body = await request.json();
  if (typeof body.title !== "string" || !body.title.trim() || typeof body.access !== "string") return NextResponse.json({ error: "title and access are required" }, { status: 400 });
  const status = typeof body.status === "string" && movieStatuses.includes(body.status) ? body.status : "draft";
  const videoSource = typeof body.videoSource === "string" && videoSources.includes(body.videoSource) ? body.videoSource : "cloudflare_stream";
  const { data, error } = await db.from("movies").insert({ title: body.title.trim(), description: typeof body.description === "string" ? body.description : "", poster_url: typeof body.posterUrl === "string" && body.posterUrl ? body.posterUrl : null, access: body.access, price_cents: Number.isInteger(body.priceCents) ? body.priceCents : null, preview_seconds: Number.isInteger(body.previewSeconds) ? body.previewSeconds : 0, video_source: videoSource, stream_video_uid: typeof body.streamVideoUid === "string" && body.streamVideoUid ? body.streamVideoUid : null, storage_bucket: typeof body.storageBucket === "string" && body.storageBucket ? body.storageBucket.trim() : null, storage_path: typeof body.storagePath === "string" && body.storagePath ? body.storagePath.trim() : null, status, deleted_at: status === "archived" ? new Date().toISOString() : null }).select("id").single();
  return error ? NextResponse.json({ error: "Could not create movie" }, { status: 500 }) : NextResponse.json({ movie: data }, { status: 201 });
}
