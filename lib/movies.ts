import { createClient } from "@supabase/supabase-js";

export type StorefrontMovie = {
  id: string;
  title: string;
  description: string;
  access: "free" | "subscription" | "purchase" | "subscription_or_purchase";
  priceCents: number;
  previewSeconds: number;
  streamVideoUid: string | null;
};

type MovieRow = {
  id: string;
  title: string;
  description: string;
  access: StorefrontMovie["access"];
  price_cents: number | null;
  preview_seconds: number;
  stream_video_uid: string | null;
};

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

function toStorefrontMovie(row: MovieRow): StorefrontMovie {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    access: row.access,
    priceCents: row.price_cents ?? 0,
    previewSeconds: row.preview_seconds,
    streamVideoUid: row.stream_video_uid,
  };
}

export async function getStorefrontMovies() {
  const client = getClient();
  if (!client) return [];

  const { data, error } = await client
    .from("movies")
    .select("id, title, description, access, price_cents, preview_seconds, stream_video_uid")
    .order("created_at", { ascending: false })
    .returns<MovieRow[]>();

  if (error) {
    console.error("Unable to load movie catalogue", error);
    return [];
  }

  return data.map(toStorefrontMovie);
}

export async function getStorefrontMovie(id: string) {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from("movies")
    .select("id, title, description, access, price_cents, preview_seconds, stream_video_uid")
    .eq("id", id)
    .maybeSingle<MovieRow>();

  if (error || !data) return null;
  return toStorefrontMovie(data);
}
