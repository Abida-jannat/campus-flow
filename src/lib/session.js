import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";


export async function requireUser({ roles } = {}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.email) {
    return {
      error: NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      ),
    };
  }

  if (roles && !roles.includes(session.user.role)) {
    return {
      error: NextResponse.json(
        { success: false, message: "You do not have permission to do this" },
        { status: 403 }
      ),
    };
  }

  return { user: session.user, db: await getDb() };
}


export function requireTeacher() {
  return requireUser({ roles: ["teacher", "admin"] });
}
