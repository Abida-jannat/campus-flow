import { validationError } from "@/lib/errors";
import { isValidDate } from "@/lib/schemas";

const TZ = process.env.APP_TIMEZONE || "Asia/Dhaka";

export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


export function ci(value) {
  return { $regex: `^${escapeRegExp(value)}$`, $options: "i" };
}

export function todayName() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: TZ });
}

export function todayDate() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

export function teacherFilter(teacher) {
  return { $or: [{ teacherEmail: teacher.email }, { teacher: teacher.name }] };
}
export async function getStudentCourses(db, user, projection = {}) {
  const query = {};
  if (user.department) query.department = ci(user.department);
  if (user.semester) query.semester = user.semester;
  return db.collection("courses").find(query).project(projection).toArray();
}

export function announcementFilter(user, courseCodes) {
  const general = ["All", "all", "ALL", "General", "general"];
  const or = [
    { courseCode: { $exists: false }, department: { $in: general } },
  ];
  if (courseCodes.length) or.push({ courseCode: { $in: courseCodes } });
  if (user.department) {
    or.push({ courseCode: { $exists: false }, department: ci(user.department) });
  }
  return { $or: or };
}

export function scheduleFilter(user, extra = []) {
  const and = [...extra];
  if (user.department) {
    and.push({ $or: [{ department: ci(user.department) }, { department: { $exists: false } }] });
  }
  if (user.semester) {
    and.push({ $or: [{ semester: user.semester }, { semester: { $exists: false } }] });
  }
  return and.length ? { $and: and } : {};
}

const MAX_BACKDATE_DAYS = 60;

export function assertAttendanceDate(date) {
  if (!isValidDate(date)) throw validationError("Date must be a valid date (YYYY-MM-DD)");
  const today = todayDate();
  if (date > today) throw validationError("You cannot take attendance for a future date");
  const oldest = new Date(`${today}T00:00:00Z`);
  oldest.setUTCDate(oldest.getUTCDate() - MAX_BACKDATE_DAYS);
  if (date < oldest.toISOString().slice(0, 10)) {
    throw validationError(`Attendance can only be edited for the last ${MAX_BACKDATE_DAYS} days`);
  }
  return date;
}

export const pct = (attended, total) => (total > 0 ? Math.round((attended / total) * 100) : 0);

export const sameText = (a, b) =>
  String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
