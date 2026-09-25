"use client";
import { useState } from "react";
import { addProductToCart } from "@/lib/cart";
import type { StorefrontProduct } from "@/lib/products";
export function AddToCartButton({product}:{product:StorefrontProduct}){const[message,setMessage]=useState("");function add(){const items=addProductToCart(product);setMessage(items.some(item=>item.id===product.id)?"已加入购物车":"商品暂时无法购买");}return <div><button type="button" disabled={product.stock<=0} onClick={add}>{product.stock>0?"加入购物车":"暂时缺货"}</button>{message&&<p aria-live="polite">{message}</p>}</div>;}
