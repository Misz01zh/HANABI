"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setMessage("正在登录…");
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.assign("/account");
  }

  return (
    <main>
      <h1>登录 HANABI</h1>
      <form onSubmit={signIn}>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="邮箱" required />
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="密码" required />
        <button type="submit">登录</button>
      </form>
      <p>{message}</p>
      <p><Link href="/register">没有账号？去注册</Link></p>
    </main>
  );
}
