"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const storefrontItems = [
  { href: "/", label: "影片" },
  { href: "/shop", label: "商城" },
  { href: "/cart", label: "购物车" },
  { href: "/account", label: "个人中心" },
];
const adminItems = [
  { href: "/admin/movies", label: "影片管理" },
  { href: "/admin/products", label: "商品管理" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  return <>
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-brand" href="/" aria-label="HANABI 首页"><span className="site-brand-mark">H</span><strong>HANABI</strong></Link>
        <nav className="site-nav" aria-label="全站导航">
          <div className="site-nav-group" aria-label="前台">
            {storefrontItems.map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}>{item.label}</Link>)}
          </div>
          <span className="site-nav-divider" aria-hidden="true" />
          <div className="site-nav-group" aria-label="后台">
            <span className="site-nav-label">管理</span>
            {adminItems.map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}>{item.label}</Link>)}
          </div>
        </nav>
      </div>
    </header>
    <style jsx>{`
      .site-header{position:sticky;top:0;z-index:100;border-bottom:1px solid #303030;background:rgb(15 15 15 / 92%);backdrop-filter:blur(14px)}
      .site-header-inner{width:min(100% - 32px,1180px);min-height:68px;margin:0 auto;display:flex;align-items:center;gap:28px}
      .site-brand{display:inline-flex;align-items:center;gap:10px;color:#fff;text-decoration:none;white-space:nowrap;letter-spacing:.04em}
      .site-brand-mark{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#ff0033;color:#fff;font-weight:900}
      .site-nav{display:flex;align-items:center;gap:14px;min-width:0;overflow-x:auto;scrollbar-width:none}
      .site-nav::-webkit-scrollbar{display:none}.site-nav-group{display:flex;align-items:center;gap:6px;white-space:nowrap}
      .site-nav a{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border-radius:999px;color:#d4d4d4;text-decoration:none;font-weight:650}
      .site-nav a:hover{background:#242424;color:#fff}.site-nav a[aria-current="page"]{background:#fff;color:#0f0f0f}
      .site-nav-divider{width:1px;height:26px;background:#3a3a3a;flex:0 0 auto}.site-nav-label{color:#858585;font-size:.78rem;font-weight:700}
      @media(max-width:700px){.site-header-inner{width:100%;min-height:60px;padding:0 12px;gap:14px}.site-brand strong{display:none}.site-nav-divider,.site-nav-label{display:none}.site-nav{gap:4px}.site-nav a{min-height:36px;padding:0 11px;font-size:.9rem}}
    `}</style>
  </>;
}
