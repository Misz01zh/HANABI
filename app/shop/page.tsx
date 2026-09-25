import Link from "next/link";
import { formatCny } from "@/lib/cart";
import { getStorefrontProducts } from "@/lib/products";
export default async function ShopPage(){const products=await getStorefrontProducts();return <main><h1>商城</h1><p>选购 HANABI 商品，影片请在首页直接购买观看权限。</p>{products.length===0?<p>暂时没有已上架商品。</p>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:18}}>{products.map(product=><article key={product.id}>{product.imageUrl&&<img src={product.imageUrl} alt={product.name}/>}<h2>{product.name}</h2><p>{product.description}</p><strong>{formatCny(product.priceCents)}</strong><p>库存：{product.stock}</p><Link href={`/products/${product.id}`}>查看商品</Link></article>)}</div>}</main>;}
