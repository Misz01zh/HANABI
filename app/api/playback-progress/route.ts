import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token) return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  if (!url || !anonKey || !serviceRoleKey) return NextResponse.json({ error: "Playback service is not configured" }, { status: 500 });

  const { movieId, positionSeconds } = await request.json();
  if (typeof movieId !== "string" || !Number.isFinite(positionSeconds) || positionSeconds < 0) {
    return NextResponse.json({ error: "Invalid playback progress" }, { status: 400 });
  }

  const userClient = createClient(url, anonKey);
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const { error } = await admin.from("playback_progress").upsert({
    user_id: userData.user.id, movie_id: movieId, position_seconds: Math.floor(positionSeconds), updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,movie_id" });
  if (error) return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
  return NextResponse.json({ saved: true });
}
