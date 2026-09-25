import type { StorefrontProduct } from "@/lib/products";
export type CartItem = Pick<StorefrontProduct, "id" | "name" | "priceCents" | "stock"> & { quantity:number; imageUrl:string|null };
const CART_STORAGE_KEY = "hanabi-product-cart-v1";
export function getCart():CartItem[]{if(typeof window==="undefined")return[];try{const value=window.localStorage.getItem(CART_STORAGE_KEY);const cart=value?JSON.parse(value):[];return Array.isArray(cart)?cart.filter(item=>typeof item?.id==="string"&&typeof item?.name==="string"):[];}catch{return[];}}
export function saveCart(items:CartItem[]){window.localStorage.setItem(CART_STORAGE_KEY,JSON.stringify(items));}
export function addProductToCart(product:StorefrontProduct){if(product.priceCents<=0||product.stock<=0)return getCart();const cart=getCart();const existing=cart.find(item=>item.id===product.id);const next=existing?cart.map(item=>item.id===product.id?{...item,quantity:Math.min(item.quantity+1,product.stock)}:item):[...cart,{id:product.id,name:product.name,priceCents:product.priceCents,stock:product.stock,imageUrl:product.imageUrl,quantity:1}];saveCart(next);return next;}
export function setCartQuantity(id:string,quantity:number){const next=getCart().map(item=>item.id===id?{...item,quantity:Math.max(1,Math.min(Math.floor(quantity),item.stock))}:item);saveCart(next);return next;}
export function removeFromCart(id:string){const next=getCart().filter(item=>item.id!==id);saveCart(next);return next;}
export function clearCart(){saveCart([]);}
export function formatCny(cents:number){return new Intl.NumberFormat("zh-CN",{style:"currency",currency:"CNY"}).format(cents/100);}
