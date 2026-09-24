import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { canWatch, type ViewerAccess } from "@/lib/entitlements";
import { createPlaybackToken } from "@/lib/stream-token";

const TOKEN_TTL_SECONDS = 15 * 60;

type Movie = {
  id: string;
  access: "free" | "subscription" | "purchase" | "subscription_or_purchase";
  stream_video_uid: string | null;
};

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.replace(/^Bearer\s+/i, "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!accessToken) {
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  let movieId: string;
  try {
    ({ movieId } = await request.json());
  } catch {
    return NextResponse.json({ error: "A JSON body is required" }, { status: 400 });
  }

  if (!movieId) {
    return NextResponse.json({ error: "movieId is required" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { data: movie, error: movieError } = await supabase
    .from("movies")
    .select("id, access, stream_video_uid")
    .eq("id", movieId)
    .single<Movie>();

  if (movieError || !movie?.stream_video_uid) {
    return NextResponse.json({ error: "Movie is unavailable" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const { data: entitlements, error: entitlementError } = await supabase
    .from("entitlements")
    .select("movie_id, source")
    .eq("user_id", userData.user.id)
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  if (entitlementError) {
    return NextResponse.json({ error: "Could not verify viewing access" }, { status: 500 });
  }

  const viewer: ViewerAccess = {
    subscriptionActive: entitlements?.some((item) => item.source === "subscription" && item.movie_id === null) ?? false,
    purchasedMovieIds: entitlements
      ?.filter((item) => item.source === "purchase" && item.movie_id)
      .map((item) => item.movie_id) ?? [],
  };

  if (!canWatch(movie.id, movie.access, viewer)) {
    return NextResponse.json({ error: "Viewing access is required" }, { status: 403 });
  }

  try {
    const token = await createPlaybackToken(movie.stream_video_uid, userData.user.id, TOKEN_TTL_SECONDS);
    return NextResponse.json({ token, expiresInSeconds: TOKEN_TTL_SECONDS });
  } catch (error) {
    console.error("Unable to issue playback token", error);
    return NextResponse.json({ error: "Playback authorization is not configured" }, { status: 503 });
  }
}
