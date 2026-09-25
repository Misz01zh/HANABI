import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatCny } from "@/lib/cart";
import { getStorefrontProduct } from "@/lib/products";
export default async function ProductPage({params}:{params:Promise<{id:string}>}){const{id}=await params;const product=await getStorefrontProduct(id);if(!product)notFound();return <main style={{maxWidth:820}}><p><Link href="/shop">← 返回商城</Link></p>{product.imageUrl&&<img src={product.imageUrl} alt={product.name} style={{width:360,maxWidth:"100%",borderRadius:14}}/>}<h1>{product.name}</h1><p>{product.description}</p><h2>{formatCny(product.priceCents)}</h2><p>库存：{product.stock}</p><AddToCartButton product={product}/><p><Link href="/cart">查看购物车</Link></p></main>;}
