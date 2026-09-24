import Link from "next/link";
import { formatCny } from "@/lib/cart";
import { getStorefrontMovies } from "@/lib/movies";

export default async function Home() {
  const movies = await getStorefrontMovies();

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 32, fontFamily: "system-ui" }}>
      <header>
        <h1>HANABI</h1>
        <p>商城与正版影视点播平台</p>
        <nav><Link href="/cart">购物车</Link>　<Link href="/account">个人中心</Link></nav>
      </header>
      <h2>正在热播</h2>
      {movies.length === 0 ? (
        <p>暂时没有可展示影片。请在 Supabase 的 movies 表中添加影片。</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {movies.map((movie) => (
            <article key={movie.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 18 }}>
              <h3>{movie.title}</h3>
              <p>{movie.access}</p>
              <strong>{movie.priceCents > 0 ? formatCny(movie.priceCents) : movie.previewSeconds ? `免费试看 ${movie.previewSeconds / 60} 分钟` : "会员可看"}</strong>
              <p><Link href={`/movies/${movie.id}`}>查看影片</Link></p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
