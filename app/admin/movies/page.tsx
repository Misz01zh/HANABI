"use client";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<{id:string;title:string;access:string}[]>([]); const [message, setMessage] = useState("");
  async function request(path:string, options?:RequestInit) { const {data}=await supabase.auth.getSession(); return fetch(path,{...options,headers:{"Content-Type":"application/json",Authorization:`Bearer ${data.session?.access_token ?? ""}`,...options?.headers}}); }
  async function load() { const res=await request("/api/admin/movies"); const data=await res.json(); if(res.ok)setMovies(data.movies); else setMessage(data.error); }
  useEffect(()=>{load();},[]);
  async function submit(event:FormEvent<HTMLFormElement>) { event.preventDefault(); const form=new FormData(event.currentTarget); const res=await request("/api/admin/movies",{method:"POST",body:JSON.stringify({title:form.get("title"),description:form.get("description"),access:form.get("access"),priceCents:Number(form.get("priceCents"))||null,streamVideoUid:form.get("streamVideoUid")})}); const data=await res.json(); setMessage(res.ok?`已创建影片 ${data.movie.id}`:data.error); if(res.ok){event.currentTarget.reset();load();} }
  return <main><h1>影片管理</h1><form onSubmit={submit}><input name="title" placeholder="影片标题" required/><input name="description" placeholder="简介"/><select name="access"><option value="purchase">单片购买</option><option value="subscription">会员专享</option><option value="free">免费</option></select><input name="priceCents" type="number" placeholder="价格（分）"/><input name="streamVideoUid" placeholder="Cloudflare Stream UID"/><button>创建影片</button></form><p>{message}</p><ul>{movies.map(movie=><li key={movie.id}>{movie.title} · {movie.access}</li>)}</ul></main>;
}
