"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type AdminMovie = { id: string; title: string; description: string; access: string; price_cents: number | null; preview_seconds: number; stream_video_uid: string | null };

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<AdminMovie[]>([]);
  const [message, setMessage] = useState("");

  const request = useCallback(async (path: string, options?: RequestInit) => {
    const { data } = await supabase.auth.getSession();
    return fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}`, ...options?.headers } });
  }, []);

  const load = useCallback(async () => {
    const response = await request("/api/admin/movies"); const result = await response.json();
    if (response.ok) setMovies(result.movies); else setMessage(result.error);
  }, [request]);
  useEffect(() => { void load(); }, [load]);

  async function createMovie(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const response = await request("/api/admin/movies", { method: "POST", body: JSON.stringify({ title: form.get("title"), description: form.get("description"), access: form.get("access"), priceCents: Number(form.get("priceCents")) || null, previewSeconds: Number(form.get("previewSeconds")) || 0, streamVideoUid: form.get("streamVideoUid") }) });
    const result = await response.json(); setMessage(response.ok ? `已创建影片 ${result.movie.id}` : result.error); if (response.ok) { event.currentTarget.reset(); await load(); }
  }

  async function updateMovie(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const response = await request(`/api/admin/movies/${id}`, { method: "PATCH", body: JSON.stringify({ title: form.get("title"), description: form.get("description"), access: form.get("access"), priceCents: Number(form.get("priceCents")) || 0, previewSeconds: Number(form.get("previewSeconds")) || 0, streamVideoUid: form.get("streamVideoUid") }) });
    const result = await response.json(); setMessage(response.ok ? "影片已更新" : result.error); if (response.ok) await load();
  }

  return <main><h1>影片管理</h1><h2>创建影片</h2><form onSubmit={createMovie}><input name="title" placeholder="影片标题" required/><input name="description" placeholder="简介"/><select name="access"><option value="purchase">单片购买</option><option value="subscription">会员专享</option><option value="subscription_or_purchase">会员或单片购买</option><option value="free">免费</option></select><input name="priceCents" type="number" min="0" placeholder="价格（分）"/><input name="previewSeconds" type="number" min="0" placeholder="试看秒数"/><input name="streamVideoUid" placeholder="Cloudflare Stream UID"/><button>创建影片</button></form><p aria-live="polite">{message}</p><h2>编辑影片</h2>{movies.map((movie)=><form key={movie.id} onSubmit={(event)=>updateMovie(event,movie.id)}><input name="title" defaultValue={movie.title} required/><input name="description" defaultValue={movie.description}/><select name="access" defaultValue={movie.access}><option value="purchase">单片购买</option><option value="subscription">会员专享</option><option value="subscription_or_purchase">会员或单片购买</option><option value="free">免费</option></select><input name="priceCents" type="number" min="0" defaultValue={movie.price_cents ?? 0}/><input name="previewSeconds" type="number" min="0" defaultValue={movie.preview_seconds}/><input name="streamVideoUid" defaultValue={movie.stream_video_uid ?? ""}/><button>保存修改</button></form>)}</main>;
}
