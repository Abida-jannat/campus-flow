export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message = "Bad request", details) =>
  new ApiError(400, "BAD_REQUEST", message, details);
export const unauthorized = (message = "Please log in to continue") =>
  new ApiError(401, "UNAUTHENTICATED", message);
export const forbidden = (message = "You do not have permission to do this") =>
  new ApiError(403, "FORBIDDEN", message);
export const notFound = (message = "Not found") => new ApiError(404, "NOT_FOUND", message);
export const conflict = (message, details) => new ApiError(409, "CONFLICT", message, details);
export const validationError = (message, details) =>
  new ApiError(422, "VALIDATION_ERROR", message, details);

const DB_DOWN_NAMES = [
  "MongoServerSelectionError",
  "MongoNetworkError",
  "MongoNetworkTimeoutError",
  "MongoNotConnectedError",
  "MongoTopologyClosedError",
  "MongoPoolClearedError",
];


export function normalizeError(err) {
  if (err instanceof ApiError) return err;

  let result;

  if (err?.code === 11000) {
    result = new ApiError(409, "DUPLICATE", "That record already exists");
  } else if (err?.name === "BSONError" || /ObjectId|24 hex characters|12 bytes/i.test(err?.message || "")) {
    result = new ApiError(400, "INVALID_ID", "Invalid id");
  } else if (
    DB_DOWN_NAMES.includes(err?.name) ||
    err?.code === 8000 || 
    err?.code === "ECONNREFUSED" ||
    /querySrv|ENOTFOUND|ETIMEDOUT/i.test(err?.message || "")
  ) {
    result = new ApiError(
      503,
      "DB_UNAVAILABLE",
      "The database is temporarily unavailable. Please try again in a moment."
    );
  } else {
    result = new ApiError(500, "INTERNAL_ERROR", "Something went wrong on our side. Please try again.");
  }

  result.cause = err;
  return result;
}
