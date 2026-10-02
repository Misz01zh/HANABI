"use client";

import { useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type Props = { movieId:string; previewSeconds:number };

export function SecureVideoPlayer({ movieId, previewSeconds }:Props) {
  const [source,setSource]=useState(""); const [sourceType,setSourceType]=useState<"cloudflare_stream"|"supabase_storage"|"">(""); const [message,setMessage]=useState(""); const [resumeAt,setResumeAt]=useState(0); const lastReported=useRef(0);
  async function startPlayback(){
    setMessage("正在验证观看权限…"); const{data}=await supabase.auth.getSession(); const token=data.session?.access_token;
    if(!token){setMessage("请先登录后再播放。");return;}
    const response=await fetch("/api/playback-token",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({movieId})}); const result=await response.json();
    if(!response.ok||!result.playbackUrl){setMessage(result.error??"无法取得播放授权。");return;}
    const progress=await fetch(`/api/playback-progress?movieId=${encodeURIComponent(movieId)}`,{headers:{Authorization:`Bearer ${token}`}}); const progressData=await progress.json(); setResumeAt(progress.ok?progressData.positionSeconds??0:0);
    setSourceType(result.source); setSource(result.playbackUrl); setMessage("");
  }
  async function saveProgress(positionSeconds:number){if(positionSeconds-lastReported.current<15)return;lastReported.current=positionSeconds;const{data}=await supabase.auth.getSession();if(!data.session?.access_token)return;await fetch("/api/playback-progress",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({movieId,positionSeconds})});}
  return <section><button type="button" onClick={startPlayback}>开始播放</button>{previewSeconds>0&&<p>可试看 {previewSeconds/60} 分钟</p>}{sourceType&&<p>播放来源：{sourceType==="supabase_storage"?"Supabase Storage":"Cloudflare Stream"}</p>}{message&&<p aria-live="polite">{message}</p>}{source&&<video controls src={source} onLoadedMetadata={event=>{if(resumeAt>0)event.currentTarget.currentTime=resumeAt;}} onTimeUpdate={event=>saveProgress(event.currentTarget.currentTime)} style={{width:"100%",marginTop:16}}/>}</section>;
}
