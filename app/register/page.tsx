"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signUp(event: FormEvent) {
    event.preventDefault();
    setMessage("正在创建账号…");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/account` },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.session) {
      window.location.assign("/account");
      return;
    }

    setMessage("账号已创建，请查收确认邮件后再登录。");
  }

  return (
    <main>
      <h1>注册 HANABI</h1>
      <form onSubmit={signUp}>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="邮箱" required />
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="至少 6 位密码" minLength={6} required />
        <button type="submit">注册</button>
      </form>
      <p>{message}</p>
      <Link href="/login">已有账号？去登录</Link>
    </main>
  );
}
