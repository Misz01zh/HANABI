"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type Movie = { id:string; title:string; description:string; poster_url:string|null; access:string; price_cents:number|null; preview_seconds:number; stream_video_uid:string|null; status:"draft"|"published"|"archived"; deleted_at:string|null };

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [message, setMessage] = useState("");
  const request = useCallback(async (path:string, options?:RequestInit) => {
    const { data } = await supabase.auth.getSession();
    return fetch(path, { ...options, headers: { "Content-Type":"application/json", Authorization:`Bearer ${data.session?.access_token ?? ""}`, ...options?.headers } });
  }, []);
  const load = useCallback(async () => {
    const response = await request("/api/admin/movies");
    const result = await response.json();
    response.ok ? setMovies(result.movies) : setMessage(result.error);
  }, [request]);
  useEffect(() => { void load(); }, [load]);

  function values(form:FormData) {
    return { title:form.get("title"), description:form.get("description"), posterUrl:form.get("posterUrl"), access:form.get("access"), priceCents:Number(form.get("priceCents")) || 0, previewSeconds:Number(form.get("previewSeconds")) || 0, streamVideoUid:form.get("streamVideoUid"), status:form.get("status") };
  }
  async function create(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await request("/api/admin/movies", { method:"POST", body:JSON.stringify(values(new FormData(event.currentTarget))) });
    const result = await response.json();
    setMessage(response.ok ? `已创建影片 ${result.movie.id}` : result.error);
    if (response.ok) { event.currentTarget.reset(); await load(); }
  }
  async function update(event:FormEvent<HTMLFormElement>, id:string) {
    event.preventDefault();
    const response = await request(`/api/admin/movies/${id}`, { method:"PATCH", body:JSON.stringify(values(new FormData(event.currentTarget))) });
    const result = await response.json();
    setMessage(response.ok ? "影片已更新" : result.error);
    if (response.ok) await load();
  }
  async function archive(id:string) {
    if (!window.confirm("确认下架并软删除这部影片？订单、权益和 Cloudflare 原视频都会保留。")) return;
    const response = await request(`/api/admin/movies/${id}`, { method:"DELETE" });
    const result = await response.json();
    setMessage(response.ok ? "影片已归档，可通过修改状态恢复" : result.error);
    if (response.ok) await load();
  }
  const fields = (movie?:Movie) => <>
    <input name="title" defaultValue={movie?.title} placeholder="影片标题" required />
    <input name="description" defaultValue={movie?.description} placeholder="简介" />
    <input name="posterUrl" type="url" defaultValue={movie?.poster_url ?? ""} placeholder="HTTPS 海报 URL" />
    <select name="access" defaultValue={movie?.access ?? "purchase"}><option value="purchase">单片购买</option><option value="subscription">会员专享</option><option value="subscription_or_purchase">会员或单片购买</option><option value="free">免费</option></select>
    <select name="status" defaultValue={movie?.status ?? "draft"}><option value="draft">草稿</option><option value="published">已发布</option><option value="archived">已归档</option></select>
    <input name="priceCents" type="number" min="0" defaultValue={movie?.price_cents ?? 0} />
    <input name="previewSeconds" type="number" min="0" defaultValue={movie?.preview_seconds ?? 0} />
    <input name="streamVideoUid" defaultValue={movie?.stream_video_uid ?? ""} placeholder="Stream UID" />
  </>;

  return <main><h1>影片管理</h1><h2>创建影片</h2><form onSubmit={create}>{fields()}<button>创建影片</button></form><p aria-live="polite">{message}</p><h2>编辑影片</h2>{movies.map(movie => <form key={movie.id} onSubmit={event => update(event, movie.id)}>{fields(movie)}<span>{movie.deleted_at ? "已软删除" : movie.status}</span><button>保存修改</button><button type="button" disabled={movie.status === "archived"} onClick={() => void archive(movie.id)}>下架并删除</button></form>)}</main>;
}
