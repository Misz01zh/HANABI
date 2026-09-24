import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { SecureVideoPlayer } from "@/components/secure-video-player";
import { formatCny } from "@/lib/cart";
import { getStorefrontMovie } from "@/lib/movies";

export default async function MovieDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movie = await getStorefrontMovie(slug);
  if (!movie) notFound();
  return <main style={{ maxWidth: 720, margin: "0 auto", padding: 32, fontFamily: "system-ui" }}><p><Link href="/">← 返回商城</Link></p><h1>{movie.title}</h1><p>{movie.description}</p><p>观看方式：{movie.access}</p><p>{movie.priceCents > 0 ? `单片购买：${formatCny(movie.priceCents)}` : movie.previewSeconds ? `免费试看：${movie.previewSeconds / 60} 分钟` : "会员可完整观看"}</p><AddToCartButton movie={movie} />{movie.streamVideoUid && <SecureVideoPlayer movieId={movie.id} videoUid={movie.streamVideoUid} previewSeconds={movie.previewSeconds} />}<p><Link href="/cart">前往购物车</Link></p></main>;
}
