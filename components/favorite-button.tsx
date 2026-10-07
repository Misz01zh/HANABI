"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Props = { movieId: string; compact?: boolean; onRemoved?: () => void };

export function FavoriteButton({ movieId, compact = false, onRemoved }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const client = createSupabaseBrowserClient();
    if (!client) { setLoading(false); return; }
    void (async () => {
      const { data: { user } } = await client.auth.getUser();
      setUserId(user?.id ?? null);
      if (user) {
        const { data } = await client.from("favorites").select("movie_id").eq("user_id", user.id).eq("movie_id", movieId).maybeSingle();
        setFavorited(Boolean(data));
      }
      setLoading(false);
    })();
  }, [movieId]);
  async function toggleFavorite() {
    const client = createSupabaseBrowserClient();
    if (!client || !userId) { router.push("/login"); return; }
    setLoading(true);
    if (favorited) {
      const { error } = await client.from("favorites").delete().eq("user_id", userId).eq("movie_id", movieId);
      if (!error) { setFavorited(false); onRemoved?.(); }
    } else {
      const { error } = await client.from("favorites").insert({ user_id: userId, movie_id: movieId });
      if (!error) setFavorited(true);
    }
    setLoading(false);
  }
  const label = favorited ? "取消收藏" : "收藏影片";
  return <button type="button" className={`favorite-button ${compact ? "is-compact" : ""}`} aria-label={label} title={label} aria-pressed={favorited} disabled={loading} onClick={toggleFavorite}>{favorited ? "♥" : "♡"}<span>{compact ? "" : label}</span></button>;
}
