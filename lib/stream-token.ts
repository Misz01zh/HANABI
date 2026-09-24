const encoder = new TextEncoder();

function base64url(input: Uint8Array | string) {
  const bytes = typeof input === "string" ? encoder.encode(input) : input;
  return Buffer.from(bytes).toString("base64url");
}

export async function createPlaybackToken(videoId: string, userId: string, expiresInSeconds = 900) {
  const keyId = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID;
  const privateKey = process.env.CLOUDFLARE_STREAM_SIGNING_KEY;
  if (!keyId || !privateKey) throw new Error("Cloudflare Stream signing key is not configured");
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT", kid: keyId }));
  const payload = base64url(JSON.stringify({ sub: videoId, exp: now + expiresInSeconds, nbf: now, aud: userId }));
  const pem = privateKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const key = await crypto.subtle.importKey("pkcs8", Buffer.from(pem, "base64"), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(`${header}.${payload}`));
  return `${header}.${payload}.${base64url(new Uint8Array(signature))}`;
}
