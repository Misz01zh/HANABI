import Link from "next/link";
import { MediaSidebar } from "@/components/media-sidebar";
import { MovieCard } from "@/components/movie-card";
import { getStorefrontMovies } from "@/lib/movies";

type Props = { searchParams: Promise<{ q?: string; access?: string }> };
const categories = [
  { value: "all", label: "全部" },
  { value: "free", label: "免费" },
  { value: "subscription", label: "会员" },
  { value: "purchase", label: "单片购买" },
  { value: "subscription_or_purchase", label: "会员或购买" },
];

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const access = params.access ?? "all";
  const movies = (await getStorefrontMovies()).filter((movie) =>
    (access === "all" || movie.access === access) &&
    (!q || movie.title.toLowerCase().includes(q) || movie.description.toLowerCase().includes(q)),
  );

  return <main className="home-main"><div className="home-layout"><MediaSidebar/><section className="home-feed"><div className="category-strip">{categories.map((category) => {
    const href = `/?access=${category.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
    return <Link key={category.value} href={href} aria-current={access === category.value ? "page" : undefined}>{category.label}</Link>;
  })}</div><div className="feed-heading"><div><p>HANABI PICKS</p><h1>{q ? `“${q}” 的搜索结果` : "正在热播"}</h1></div><span>{movies.length} 部影片</span></div>{movies.length === 0 ? <div className="empty-feed"><h2>没有找到影片</h2><p>尝试其他关键词或分类，或在管理后台发布影片。</p></div> : <div className="video-grid">{movies.map((movie) => <MovieCard key={movie.id} movie={movie}/>)}</div>}</section></div></main>;
}
