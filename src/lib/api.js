// Small shared helpers for API routes: auth, role checks, safe regex, dates.
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "./auth";

// Vercel runs in UTC. Without this, "today" is wrong for ~6 hours a day in Bangladesh.
export const TZ = process.env.APP_TIMEZONE || "Asia/Dhaka";

export const json = (body, status = 200, init = {}) =>
  NextResponse.json(body, { status, ...init });

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Case-insensitive exact match that is safe against regex injection. */
export const ci = (s) => new RegExp(`^${escapeRegex(String(s).trim())}$`, "i");

export const todayName = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: TZ });

/** YYYY-MM-DD in the app timezone (toISOString() would give the UTC date). */
export const todayISO = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: TZ });

/**
 * Returns { user } or { error: NextResponse }.
 * session.user already contains name/email/role/department/semester/studentId/image,
 * so routes do NOT need a second DB lookup for the user.
 */
export async function requireUser({ role } = {}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user?.email) {
    return { error: json({ success: false, message: "Unauthorized" }, 401) };
  }
  if (role && user.role !== role) {
    return { error: json({ success: false, message: "Forbidden" }, 403) };
  }
  return { user };
}

/**
 * Shared by the /api/teacher/* routes. Returns { db, teacher } or null.
 * `teacher` is the session user (name, email, department, image, role) -
 * no extra DB lookup, and non-teachers are rejected.
 */
export async function getTeacherContext() {
  const { user, error } = await requireUser({ role: "teacher" });
  if (error) return null;
  const { getDb } = await import("./mongodb");
  return { db: await getDb(), teacher: user };
}
