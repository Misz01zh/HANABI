"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  async function signIn(event: FormEvent) {
    event.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : "登录成功");
  }
  return <main><h1>登录 HANABI</h1><form onSubmit={signIn}><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱" required /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" required /><button type="submit">登录</button></form><p>{message}</p></main>;
}
