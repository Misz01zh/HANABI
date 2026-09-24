import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!token||!url||!anon||!service) return NextResponse.json({error:"Administrator access is required"},{status:403});
  const {data}=await createClient(url,anon).auth.getUser(token); if(data.user?.app_metadata.role!=="admin") return NextResponse.json({error:"Administrator access is required"},{status:403});
  const body=await request.json(); const {id}=await params;
  const update={ title:typeof body.title==="string"?body.title.trim():undefined, description:typeof body.description==="string"?body.description:undefined, access:typeof body.access==="string"?body.access:undefined, price_cents:Number.isInteger(body.priceCents)?body.priceCents:undefined, preview_seconds:Number.isInteger(body.previewSeconds)?body.previewSeconds:undefined, stream_video_uid:typeof body.streamVideoUid==="string"?body.streamVideoUid||null:undefined };
  Object.keys(update).forEach((key)=>update[key as keyof typeof update]===undefined&&delete update[key as keyof typeof update]);
  const {error}=await createClient(url,service,{auth:{persistSession:false}}).from("movies").update(update).eq("id",id); return error?NextResponse.json({error:"Could not update movie"},{status:500}):NextResponse.json({updated:true});
}
