import { route, ok, objectId, notFound, conflict, badRequest } from "@/lib/api";
import { validate, scheduleSchema, WEEKDAYS, isTime, timesOverlap } from "@/lib/schemas";
import { teacherFilter, ci } from "@/lib/queries";

function canonicalDay(day) {
  const match = WEEKDAYS.find((d) => d.toLowerCase() === String(day || "").trim().toLowerCase());
  if (!match) throw badRequest(`"${day}" is not a valid day`);
  return match;
}

function checkTimes(data) {
  if (isTime(data.startTime) && isTime(data.endTime) && data.startTime >= data.endTime) {
    throw badRequest("End time must be after start time");
  }
}

// Same teacher or same room already busy at that time on that day?
async function assertNoConflict(db, teacher, entry, ignoreId) {
  if (!isTime(entry.startTime) || !isTime(entry.endTime)) return;

  const sameDay = await db
    .collection("classSchedule")
    .find({
      day: ci(entry.day),
      ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
      $or: [
        teacherFilter(teacher),
        { building: entry.building, room: entry.room },
      ],
    })
    .toArray();

  for (const other of sameDay) {
    if (!isTime(other.startTime) || !isTime(other.endTime)) continue;
    if (!timesOverlap(entry.startTime, entry.endTime, other.startTime, other.endTime)) continue;

    const sameRoom = other.building === entry.building && other.room === entry.room;
    throw conflict(
      sameRoom
        ? `Room ${entry.room} (${entry.building}) is already booked on ${entry.day} ${other.startTime}-${other.endTime} for ${other.courseCode}`
        : `You already teach ${other.courseCode} on ${entry.day} ${other.startTime}-${other.endTime}`,
      { with: other.courseCode, day: entry.day }
    );
  }
}

export const GET = route(
  async ({ db, user }) => {
    const schedule = await db
      .collection("classSchedule")
      .find(teacherFilter(user))
      .sort({ day: 1, startTime: 1 })
      .toArray();
    return ok({ schedule });
  },
  { access: "teacher" }
);

export const POST = route(
  async ({ db, user, json }) => {
    const body = await json();
    const data = validate(body, scheduleSchema);
    const { courseCode } = validate(body, { courseCode: { type: "string", required: true, label: "Course", max: 20 } });
    const { days } = validate(body, {
      days: { type: "array", required: true, label: "Days", min: 1, maxItems: 7 },
    });
    checkTimes(data);

    const course = await db.collection("courses").findOne({ courseCode, ...teacherFilter(user) });
    if (!course) throw notFound("Course not found in your course list");

    const uniqueDays = [...new Set(days.map(canonicalDay))];
    const base = {
      courseCode: course.courseCode,
      courseName: course.courseName,
      department: course.department,
      semester: course.semester,
      teacher: user.name,
      teacherEmail: user.email,
      ...data,
    };

    for (const day of uniqueDays) await assertNoConflict(db, user, { ...base, day });

    const now = new Date();
    const result = await db
      .collection("classSchedule")
      .insertMany(uniqueDays.map((day) => ({ ...base, day, createdAt: now, updatedAt: now })));

    return ok(
      { insertedCount: result.insertedCount },
      {
        status: 201,
        message:
          uniqueDays.length > 1
            ? `Class added to schedule for ${uniqueDays.length} days`
            : "Class added to schedule",
      }
    );
  },
  { access: "teacher" }
);

export const PUT = route(
  async ({ db, user, json }) => {
    const body = await json();
    const _id = objectId(body?.id, "schedule id");
    const data = validate(body, scheduleSchema);
    const { day } = validate(body, { day: { type: "string", required: true, label: "Day", max: 12 } });
    checkTimes(data);

    const current = await db.collection("classSchedule").findOne({ _id, ...teacherFilter(user) });
    if (!current) throw notFound("Schedule entry not found");

    const entry = { ...current, ...data, day: canonicalDay(day) };
    await assertNoConflict(db, user, entry, _id);

    await db
      .collection("classSchedule")
      .updateOne({ _id }, { $set: { ...data, day: entry.day, updatedAt: new Date() } });

    return ok({}, { message: "Schedule updated successfully" });
  },
  { access: "teacher" }
);

export const DELETE = route(
  async ({ db, user, query }) => {
    const _id = objectId(query.get("id"), "schedule id");
    const result = await db.collection("classSchedule").deleteOne({ _id, ...teacherFilter(user) });
    if (result.deletedCount === 0) throw notFound("Schedule entry not found");
    return ok({}, { message: "Schedule entry deleted" });
  },
  { access: "teacher" }
);
