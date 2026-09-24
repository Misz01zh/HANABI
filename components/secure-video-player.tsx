"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type Props = { movieId: string; videoUid: string; previewSeconds: number };

export function SecureVideoPlayer({ movieId, videoUid, previewSeconds }: Props) {
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");

  async function startPlayback() {
    setMessage("正在验证观看权限…");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) { setMessage("请先登录后再播放。"); return; }

    const response = await fetch("/api/playback-token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ movieId }),
    });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "无法取得播放授权。"); return; }

    const customerCode = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE;
    if (!customerCode) { setMessage("播放器尚未配置 Cloudflare Stream。 "); return; }
    setSource(`https://customer-${customerCode}.cloudflarestream.com/${videoUid}/manifest/video.m3u8?token=${encodeURIComponent(result.token)}`);
    setMessage("");
  }

  return <section><button type="button" onClick={startPlayback}>开始播放</button>{previewSeconds > 0 && <p>可试看 {previewSeconds / 60} 分钟</p>}{message && <p aria-live="polite">{message}</p>}{source && <video controls src={source} style={{ width: "100%", marginTop: 16 }} />}</section>;
}
