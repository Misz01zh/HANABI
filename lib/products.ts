import { createClient } from "@supabase/supabase-js";

export type StorefrontProduct = { id:string; name:string; description:string; imageUrl:string|null; priceCents:number; stock:number };
type ProductRow = { id:string; name:string; description:string; image_url:string|null; price_cents:number; stock:number };

function getClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return url&&key?createClient(url,key,{auth:{persistSession:false}}):null;}
function mapProduct(row:ProductRow):StorefrontProduct{return{id:row.id,name:row.name,description:row.description,imageUrl:row.image_url,priceCents:row.price_cents,stock:row.stock};}
const fields="id, name, description, image_url, price_cents, stock";
export async function getStorefrontProducts(){const client=getClient();if(!client)return[];const{data,error}=await client.from("products").select(fields).eq("status","published").is("deleted_at",null).gt("stock",0).order("created_at",{ascending:false}).returns<ProductRow[]>();if(error){console.error("Unable to load products",error);return[];}return data.map(mapProduct);}
export async function getStorefrontProduct(id:string){const client=getClient();if(!client)return null;const{data,error}=await client.from("products").select(fields).eq("status","published").is("deleted_at",null).eq("id",id).maybeSingle<ProductRow>();return error||!data?null:mapProduct(data);}
