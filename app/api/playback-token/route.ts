import { NextResponse } from "next/server";

export async function POST() {
  // TODO: authenticate the user, validate subscription or purchase entitlement, then issue a short-lived Stream token.
  return NextResponse.json({ error: "Playback authorization is not configured" }, { status: 501 });
}
