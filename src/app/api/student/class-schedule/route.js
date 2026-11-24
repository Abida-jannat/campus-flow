import { route, ok } from "@/lib/api";
import { scheduleFilter } from "@/lib/queries";

export const GET = route(async ({ db, user }) => {
  const schedule = await db
    .collection("classSchedule")
    .find(scheduleFilter(user))
    .sort({ startTime: 1 })
    .toArray();

  return ok({ department: user.department || "", schedule });
});
