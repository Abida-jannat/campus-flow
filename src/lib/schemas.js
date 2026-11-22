import { validationError, badRequest } from "@/lib/errors";

export const WEEKDAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
export const ATTENDANCE_STATUSES = ["present", "absent", "late"];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const isTime = (v) => typeof v === "string" && TIME_RE.test(v);

export function isValidDate(v) {
  if (typeof v !== "string" || !DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}


export function timesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export function validate(input, schema) {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw badRequest("Request body must be a JSON object");
  }

  const out = {};
  const errors = {};

  for (const [key, rule] of Object.entries(schema)) {
    const label = rule.label || key;
    let value = input[key];

    if (typeof value === "string" && rule.trim !== false) value = value.trim();

    if (value === undefined || value === null || value === "") {
      if (rule.required) errors[key] = `${label} is required`;
      else if (rule.default !== undefined) out[key] = rule.default;
      continue;
    }

    switch (rule.type) {
      case "number": {
        const n = Number(value);
        if (!Number.isFinite(n)) errors[key] = `${label} must be a number`;
        else if (rule.min !== undefined && n < rule.min) errors[key] = `${label} must be at least ${rule.min}`;
        else if (rule.max !== undefined && n > rule.max) errors[key] = `${label} must be at most ${rule.max}`;
        else out[key] = n;
        break;
      }
      case "boolean":
        if (typeof value !== "boolean") errors[key] = `${label} must be true or false`;
        else out[key] = value;
        break;
      case "array":
        if (!Array.isArray(value)) errors[key] = `${label} must be a list`;
        else if (rule.min !== undefined && value.length < rule.min) errors[key] = `${label} needs at least ${rule.min} item(s)`;
        else if (rule.maxItems !== undefined && value.length > rule.maxItems) errors[key] = `${label} has too many items (max ${rule.maxItems})`;
        else out[key] = value;
        break;
      case "date":
        if (!isValidDate(value)) errors[key] = `${label} must be a valid date (YYYY-MM-DD)`;
        else out[key] = value;
        break;
      case "time":
        if (!isTime(value)) errors[key] = `${label} must be a time like 09:30`;
        else out[key] = value;
        break;
      default: {
     
        if (typeof value !== "string") errors[key] = `${label} must be text`;
        else if (rule.min !== undefined && value.length < rule.min) errors[key] = `${label} must be at least ${rule.min} characters`;
        else if (rule.max !== undefined && value.length > rule.max) errors[key] = `${label} must be at most ${rule.max} characters`;
        else if (rule.pattern && !rule.pattern.test(value)) errors[key] = rule.patternMessage || `${label} has an invalid format`;
        else if (rule.oneOf && !rule.oneOf.includes(value)) errors[key] = `${label} must be one of: ${rule.oneOf.join(", ")}`;
        else out[key] = value;
      }
    }
  }

  const keys = Object.keys(errors);
  if (keys.length) throw validationError(errors[keys[0]], errors);
  return out;
}


export const courseSchema = {
  courseCode: {
    type: "string",
    required: true,
    label: "Course code",
    max: 20,
    pattern: /^[A-Za-z0-9][A-Za-z0-9 ._-]*$/,
    patternMessage: "Course code can only contain letters, numbers, spaces, dots, dashes and underscores",
  },
  courseName: { type: "string", required: true, label: "Course name", max: 120 },
  department: { type: "string", required: true, label: "Department", max: 80 },
  semester: { type: "string", required: true, label: "Semester", max: 40 },
  credit: { type: "number", required: true, label: "Credit", min: 0.5, max: 12 },
};

export const scheduleSchema = {
  startTime: { type: "string", required: true, label: "Start time", max: 20 },
  endTime: { type: "string", required: true, label: "End time", max: 20 },
  building: { type: "string", required: true, label: "Building", max: 80 },
  floor: { type: "string", label: "Floor", max: 20, default: "" },
  room: { type: "string", required: true, label: "Room", max: 40 },
  type: { type: "string", label: "Type", max: 30, default: "Theory" },
};

export const announcementSchema = {
  courseCode: { type: "string", required: true, label: "Course", max: 20 },
  message: { type: "string", required: true, label: "Announcement message", max: 1000 },
};

export const listingSchema = {
  title: { type: "string", required: true, label: "Title", max: 120 },
  description: { type: "string", label: "Description", max: 1000, default: "" },
  contactInfo: { type: "string", required: true, label: "Contact info", max: 200 },
  image: {
    type: "string",
    label: "Image link",
    max: 500,
    pattern: /^https?:\/\//i,
    patternMessage: "Image must be a link starting with http:// or https://",
    default: "",
  },
};
