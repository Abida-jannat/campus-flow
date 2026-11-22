
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ApiError, badRequest, unauthorized, forbidden, normalizeError } from "@/lib/errors";

export { ApiError, badRequest, unauthorized, forbidden, notFound, conflict } from "@/lib/errors";

const DEFAULT_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS) || 20000;
const MAX_BODY_BYTES = 1_000_000; 
const ROLES = { public: null, user: null, student: ["student"], teacher: ["teacher", "admin"] };

class ApiResult {
  constructor(payload, { status = 200, message } = {}) {
    this.payload = payload;
    this.status = status;
    this.message = message;
  }
}


export const ok = (payload = {}, options) => new ApiResult(payload, options);
export const created = (payload = {}, options) => new ApiResult(payload, { status: 201, ...options });



export function objectId(value, label = "id") {
  if (typeof value !== "string" || !ObjectId.isValid(value) || value.length !== 24) {
    throw badRequest(`Invalid ${label}`);
  }
  return new ObjectId(value);
}

export function intParam(query, name, { def, min = 0, max = 100 } = {}) {
  const raw = query.get(name);
  if (raw === null || raw === "") return def;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < min || n > max) throw badRequest(`${name} must be between ${min} and ${max}`);
  return n;
}

async function readJson(request) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The data you sent is too large");

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The data you sent is too large");
  if (!text.trim()) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw badRequest("Request body must be valid JSON");
  }
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new ApiError(504, "TIMEOUT", "The server took too long to respond. Please try again.")),
      ms
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function makeRequestId(request) {
  const incoming = request.headers.get("x-request-id");
  return incoming && /^[\w-]{8,64}$/.test(incoming) ? incoming : crypto.randomUUID();
}

async function authenticate(request, roles) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.email) throw unauthorized();
  if (roles && !roles.includes(session.user.role)) throw forbidden();
  return session.user;
}

function jsonResponse(body, status, requestId) {
  return NextResponse.json(body, {
    status,
    headers: { "x-request-id": requestId, "Cache-Control": "no-store" },
  });
}

function successBody(result, requestId) {
  const payload = result.payload;
  const isPlainObject = payload && typeof payload === "object" && !Array.isArray(payload);
  const fields = isPlainObject ? { ...payload } : { data: payload };
  delete fields.success;
  delete fields.requestId;

  const body = { success: true, ...(result.message ? { message: result.message } : {}), requestId, ...fields };
  return body;
}

function errorBody(apiError, requestId) {
  const body = {
    success: false,
    message: apiError.message,
    error: { code: apiError.code, ...(apiError.details ? { details: apiError.details } : {}) },
    requestId,
  };
  if (process.env.NODE_ENV !== "production" && apiError.cause) {
    body.error.debug = String(apiError.cause?.message || apiError.cause);
  }
  return body;
}

function toResponse(result, requestId) {
  if (result instanceof Response) {
    try {
      result.headers.set("x-request-id", requestId);
    } catch {
   
    }
    return result;
  }
  if (result instanceof ApiResult) {
    return jsonResponse(successBody(result, requestId), result.status, requestId);
  }
  return jsonResponse(successBody(new ApiResult(result ?? {}), requestId), 200, requestId);
}

function writeLog(entry) {
  const line = JSON.stringify(entry);
  if (entry.level === "error") console.error(line);
  else console.log(line);
}

function finish({ requestId, request, started, userId, response, apiError }) {
  const url = new URL(request.url);
  const status = response.status;
  writeLog({
    level: status >= 500 ? "error" : status >= 400 ? "warn" : "info",
    ts: new Date().toISOString(),
    requestId,
    method: request.method,
    path: url.pathname,
    status,
    ms: Date.now() - started,
    ...(userId ? { userId } : {}),
    ...(apiError ? { code: apiError.code } : {}),
  });
  if (apiError && apiError.status >= 500) {
    console.error(`[${requestId}]`, apiError.cause || apiError);
  }
}



export function route(handler, options = {}) {
  const { access = "user", db: needsDb = true, timeout = DEFAULT_TIMEOUT_MS } = options;

  return async function wrapped(request, context) {
    const requestId = makeRequestId(request);
    const started = Date.now();
    let userId;
    let response;
    let apiError;

    try {
      const run = async () => {
        const user = access === "public" ? null : await authenticate(request, ROLES[access]);
        userId = user?.id;
        const params = context?.params ? await context.params : {};
        const db = needsDb ? await getDb() : null;

        return handler({
          request,
          params,
          query: new URL(request.url).searchParams,
          user,
          db,
          requestId,
          json: () => readJson(request),
        });
      };

      response = toResponse(await withTimeout(run(), timeout), requestId);
    } catch (err) {
      apiError = normalizeError(err);
      response = jsonResponse(errorBody(apiError, requestId), apiError.status, requestId);
    }

    finish({ requestId, request, started, userId, response, apiError });
    return response;
  };
}


export function traced(handler) {
  return async function wrapped(request, context) {
    const requestId = makeRequestId(request);
    const started = Date.now();
    let response;
    let apiError;

    try {
      response = await withTimeout(Promise.resolve(handler(request, context)), DEFAULT_TIMEOUT_MS);
      try {
        response.headers.set("x-request-id", requestId);
      } catch {

      }
    } catch (err) {
      apiError = normalizeError(err);
      response = jsonResponse(errorBody(apiError, requestId), apiError.status, requestId);
    }

    finish({ requestId, request, started, response, apiError });
    return response;
  };
}
