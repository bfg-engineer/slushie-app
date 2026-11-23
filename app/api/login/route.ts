import { NextResponse } from "next/server";
import { checkPassword, COOKIE, sessionValue } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "APP_PASSWORD isn't set on the server yet." }, { status: 500 });
  }
  if (typeof password !== "string" || !checkPassword(password)) {
    return NextResponse.json({ error: "Nope, wrong password. Brain freeze?" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, sessionValue()!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}
