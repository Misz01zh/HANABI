import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getToken(request: NextRequest) { return request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); }

async function getUser(token: string, url: string, anonKey: string) {
  const client = createClient(url, anonKey);
  return client.auth.getUser(token);
}

export async function GET(request: NextRequest) {
  const token = getToken(request); const movieId = request.nextUrl.searchParams.get("movieId");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !movieId) return NextResponse.json({ error: "Authentication and movieId are required" }, { status: 400 });
  if (!url || !anonKey || !serviceRoleKey) return NextResponse.json({ error: "Playback service is not configured" }, { status: 500 });
  const { data, error } = await getUser(token, url, anonKey); if (error || !data.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const { data: progress } = await admin.from("playback_progress").select("position_seconds").eq("user_id", data.user.id).eq("movie_id", movieId).maybeSingle<{ position_seconds: number }>();
  return NextResponse.json({ positionSeconds: progress?.position_seconds ?? 0 });
}

export async function POST(request: NextRequest) {
  const token = getToken(request); const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  if (!url || !anonKey || !serviceRoleKey) return NextResponse.json({ error: "Playback service is not configured" }, { status: 500 });
  const { movieId, positionSeconds } = await request.json();
  if (typeof movieId !== "string" || !Number.isFinite(positionSeconds) || positionSeconds < 0) return NextResponse.json({ error: "Invalid playback progress" }, { status: 400 });
  const { data, error } = await getUser(token, url, anonKey); if (error || !data.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const { error: saveError } = await admin.from("playback_progress").upsert({ user_id: data.user.id, movie_id: movieId, position_seconds: Math.floor(positionSeconds), updated_at: new Date().toISOString() }, { onConflict: "user_id,movie_id" });
  if (saveError) return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
  return NextResponse.json({ saved: true });
}
