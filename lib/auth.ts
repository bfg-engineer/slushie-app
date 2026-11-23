import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "slushie_session";

function expected() {
  const pw = process.env.APP_PASSWORD;
  if (!pw) return null;
  return createHmac("sha256", pw).update("slushie-owner-v1").digest("base64url");
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(attempt: string) {
  const pw = process.env.APP_PASSWORD;
  return !!pw && same(attempt, pw);
}

export function sessionValue() {
  return expected();
}

export async function isOwner() {
  const want = expected();
  if (!want) return false;
  const got = (await cookies()).get(COOKIE)?.value;
  return !!got && same(got, want);
}
