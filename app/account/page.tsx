"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { AccountShell } from "@/components/account-shell";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("正在验证登录状态…");

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) { window.location.assign("/login"); return; }
      setEmail(data.user.email ?? null);
      setIsAdmin(data.user.app_metadata.role === "admin");
      setMessage("");
    });
  }, []);

  async function signOut() {
    setMessage("正在退出…");
    const { error } = await supabase.auth.signOut();
    if (error) { setMessage(error.message); return; }
    window.location.assign("/login");
  }

  return <AccountShell>
    <span className="eyebrow">ACCOUNT</span>
    <h1>账户概览</h1>
    {email ? <><div className="account-card"><span>当前登录账号</span><strong>{email}</strong><small>{isAdmin ? "管理员账户" : "普通用户"}</small></div><button type="button" onClick={signOut}>退出登录</button></> : <p>{message}</p>}
    <style jsx>{`
      .eyebrow{color:#ff335c;font-size:.78rem;font-weight:900;letter-spacing:.16em}
      .account-card{display:grid;gap:8px;margin:28px 0;padding:22px;border:1px solid #303030;border-radius:14px;background:#121212}.account-card span,.account-card small{color:#8f8f8f}.account-card strong{overflow-wrap:anywhere;font-size:1.2rem}
    `}</style>
  </AccountShell>;
}
