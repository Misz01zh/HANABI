"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items=[{href:"/",label:"首页",icon:"⌂"},{href:"/favorites",label:"我的收藏",icon:"♥"},{href:"/shop",label:"商城",icon:"▦"},{href:"/account",label:"个人中心",icon:"●"}];
export function MediaSidebar(){const pathname=usePathname();return <aside className="media-sidebar" aria-label="内容导航">{items.map(item=>{const active=item.href==="/"?pathname==="/":pathname.startsWith(item.href);return <Link key={item.href} href={item.href} aria-current={active?"page":undefined}><span className="media-sidebar-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span></Link>})}<style jsx>{`
.media-sidebar{position:sticky;top:92px;align-self:start;display:grid;gap:8px;padding:20px 10px 0 0}.media-sidebar a{display:flex;align-items:center;gap:18px;min-height:48px;padding:0 18px;border-radius:12px;color:#f1f1f1;text-decoration:none;font-weight:650}.media-sidebar a:hover,.media-sidebar a[aria-current="page"]{background:#272727}.media-sidebar-icon{width:24px;text-align:center;font-size:1.35rem}@media(max-width:820px){.media-sidebar{position:static;display:flex;overflow-x:auto;padding:14px 0 0}.media-sidebar a{flex:0 0 auto;min-height:40px;padding:0 14px}.media-sidebar-icon{display:none}}
`}</style></aside>}
