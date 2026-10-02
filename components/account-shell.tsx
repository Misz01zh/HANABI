"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) { window.location.assign("/login"); return; }
      setEmail(data.user.email ?? null);
      setIsAdmin(data.user.app_metadata.role === "admin");
    });
  }, []);

  const linkClass = (href: string) => pathname === href ? "active" : undefined;

  return <main className="account-layout">
    <aside className="account-sidebar">
      <div><strong>个人中心</strong><span>{email ?? "加载中…"}</span></div>
      <nav aria-label="个人中心导航">
        <p>账户</p>
        <Link className={linkClass("/account")} href="/account" aria-current={pathname === "/account" ? "page" : undefined}>账户概览</Link>
        {isAdmin && <>
          <p>管理中心</p>
          <Link className={linkClass("/admin/movies")} href="/admin/movies" aria-current={pathname === "/admin/movies" ? "page" : undefined}>影片管理</Link>
          <Link className={linkClass("/admin/products")} href="/admin/products" aria-current={pathname === "/admin/products" ? "page" : undefined}>商品管理</Link>
        </>}
      </nav>
    </aside>
    <section className="account-content">{children}</section>
    <style jsx global>{`
      .account-layout{display:grid;grid-template-columns:240px minmax(0,1fr);gap:28px;align-items:start;max-width:1400px;margin:0 auto;padding:32px}
      .account-sidebar{position:sticky;top:92px;padding:20px;border:1px solid #303030;border-radius:16px;background:#181818}
      .account-sidebar>div{display:grid;gap:5px;padding:0 8px 18px;border-bottom:1px solid #303030}.account-sidebar>div strong{font-size:1.15rem}.account-sidebar>div span{overflow:hidden;color:#8f8f8f;font-size:.8rem;text-overflow:ellipsis}
      .account-sidebar nav{display:grid;gap:5px;padding-top:12px}.account-sidebar nav p{margin:14px 8px 3px;color:#777;font-size:.72rem;font-weight:800;letter-spacing:.1em}
      .account-sidebar nav a{display:flex;align-items:center;min-height:42px;padding:0 12px;border-radius:10px;color:#d4d4d4;text-decoration:none;font-weight:650}.account-sidebar nav a:hover{background:#242424;color:#fff}.account-sidebar nav a.active{background:#fff;color:#111}
      .account-content{min-width:0;min-height:420px;padding:30px;border:1px solid #303030;border-radius:18px;background:#181818}
      @media(max-width:760px){.account-layout{grid-template-columns:1fr;gap:16px;padding:20px}.account-sidebar{position:static}.account-sidebar nav{grid-template-columns:repeat(2,minmax(0,1fr))}.account-sidebar nav p{grid-column:1/-1}.account-content{padding:22px}}
    `}</style>
  </main>;
}
