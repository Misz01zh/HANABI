import Link from "next/link";
import { catalogMovies } from "@/lib/catalog";
import { formatCny } from "@/lib/cart";

export default function Home() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 32, fontFamily: "system-ui" }}>
      <header>
        <h1>HANABI</h1>
        <p>商城与正版影视点播平台</p>
        <nav><Link href="/cart">购物车</Link>　<Link href="/account">个人中心</Link></nav>
      </header>
      <h2>正在热播</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
        {catalogMovies.map((film) => (
          <article key={film.slug} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 18 }}>
            <h3>{film.title}</h3>
            <p>{film.access}</p>
            <strong>{film.priceCents > 0 ? formatCny(film.priceCents) : film.previewSeconds ? `免费试看 ${film.previewSeconds / 60} 分钟` : "会员可看"}</strong>
            <p><Link href={`/movies/${film.slug}`}>查看影片</Link></p>
          </article>
        ))}
      </div>
    </main>
  );
}
