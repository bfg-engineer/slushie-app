import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isOwner } from "./auth";

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Wraps owner-only API handlers: checks the login cookie and turns errors into JSON.
export function ownerOnly<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    if (!(await isOwner())) return fail("Please log in first", 401);
    try {
      return await handler(...args);
    } catch (e) {
      if (e instanceof ZodError) return fail(e.issues[0]?.message ?? "Invalid data");
      console.error(e);
      return fail(e instanceof Error ? e.message : "Something went wrong", 500);
    }
  };
}
