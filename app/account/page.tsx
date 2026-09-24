"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("正在验证登录状态…");

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        window.location.assign("/login");
        return;
      }

      setEmail(data.user.email ?? null);
      setMessage("");
    });
  }, []);

  async function signOut() {
    setMessage("正在退出…");
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.assign("/login");
  }

  return (
    <main>
      <h1>个人中心</h1>
      {email ? <p>当前登录账号：{email}</p> : <p>{message}</p>}
      <button type="button" onClick={signOut} disabled={!email}>退出登录</button>
      <p><Link href="/">返回商城首页</Link></p>
    </main>
  );
}
