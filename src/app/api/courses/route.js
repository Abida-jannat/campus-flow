import { route, ok } from "@/lib/api";
import { ci } from "@/lib/queries";


export const GET = route(async ({ db, user, query }) => {
  const department = query.get("department") ?? user.department;
  const semester = query.get("semester") ?? user.semester;

  const filter = {};
  if (department) filter.department = ci(department);
  if (semester) filter.semester = semester;

  const courses = await db.collection("courses").find(filter).sort({ courseCode: 1 }).toArray();
  return ok({ courses });
});
