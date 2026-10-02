import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { canWatch, type ViewerAccess } from "@/lib/entitlements";
import { createPlaybackToken } from "@/lib/stream-token";

const TOKEN_TTL_SECONDS = 15 * 60;
type Movie = { id:string; access:"free"|"subscription"|"purchase"|"subscription_or_purchase"; video_source:"cloudflare_stream"|"supabase_storage"; stream_video_uid:string|null; storage_bucket:string|null; storage_path:string|null };

export async function POST(request: NextRequest) {
  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!accessToken) return NextResponse.json({ error:"Authentication is required" }, { status:401 });
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) return NextResponse.json({ error:"Supabase is not configured" }, { status:500 });

  let movieId:string;
  try { ({ movieId } = await request.json()); } catch { return NextResponse.json({ error:"A JSON body is required" }, { status:400 }); }
  if (!movieId) return NextResponse.json({ error:"movieId is required" }, { status:400 });

  const auth = createClient(supabaseUrl, supabaseAnonKey, { auth:{ persistSession:false } });
  const { data:userData, error:userError } = await auth.auth.getUser(accessToken);
  if (userError || !userData.user) return NextResponse.json({ error:"Invalid session" }, { status:401 });
  const db = createClient(supabaseUrl, serviceRoleKey, { auth:{ persistSession:false } });

  const { data:movie, error:movieError } = await db.from("movies").select("id, access, video_source, stream_video_uid, storage_bucket, storage_path").eq("id", movieId).eq("status", "published").is("deleted_at", null).single<Movie>();
  if (movieError || !movie) return NextResponse.json({ error:"Movie is unavailable" }, { status:404 });

  const now = new Date().toISOString();
  const { data:entitlements, error:entitlementError } = await db.from("entitlements").select("movie_id, source").eq("user_id", userData.user.id).or(`expires_at.is.null,expires_at.gt.${now}`);
  if (entitlementError) return NextResponse.json({ error:"Could not verify viewing access" }, { status:500 });
  const viewer:ViewerAccess = { subscriptionActive:entitlements?.some(item=>item.source==="subscription"&&item.movie_id===null)??false, purchasedMovieIds:entitlements?.filter(item=>item.source==="purchase"&&item.movie_id).map(item=>item.movie_id)??[] };
  if (!canWatch(movie.id, movie.access, viewer)) return NextResponse.json({ error:"Viewing access is required" }, { status:403 });

  if (movie.video_source === "supabase_storage") {
    if (!movie.storage_bucket || !movie.storage_path) return NextResponse.json({ error:"Supabase video is not configured" }, { status:404 });
    const { data, error } = await db.storage.from(movie.storage_bucket).createSignedUrl(movie.storage_path, TOKEN_TTL_SECONDS);
    if (error || !data?.signedUrl) { console.error("Unable to sign Supabase video", error); return NextResponse.json({ error:"Could not issue storage playback URL" }, { status:503 }); }
    return NextResponse.json({ source:"supabase_storage", playbackUrl:data.signedUrl, expiresInSeconds:TOKEN_TTL_SECONDS });
  }

  if (!movie.stream_video_uid) return NextResponse.json({ error:"Cloudflare Stream video is not configured" }, { status:404 });
  const customerCode = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE;
  if (!customerCode) return NextResponse.json({ error:"Cloudflare Stream is not configured" }, { status:503 });
  try {
    const token = await createPlaybackToken(movie.stream_video_uid, userData.user.id, TOKEN_TTL_SECONDS);
    const playbackUrl = `https://customer-${customerCode}.cloudflarestream.com/${movie.stream_video_uid}/manifest/video.m3u8?token=${encodeURIComponent(token)}`;
    return NextResponse.json({ source:"cloudflare_stream", playbackUrl, expiresInSeconds:TOKEN_TTL_SECONDS });
  } catch (error) {
    console.error("Unable to issue playback token", error);
    return NextResponse.json({ error:"Playback authorization is not configured" }, { status:503 });
  }
}
