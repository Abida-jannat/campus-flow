
export async function apiFetch(
  url,
  { method = "GET", body, timeout = 15000, redirectOn401 = true, headers } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method,
      credentials: "include",
      cache: "no-store",
      headers: body !== undefined ? { "Content-Type": "application/json", ...headers } : headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    const headerId = res.headers.get("x-request-id");

    if (!json || typeof json !== "object") {
      return {
        ok: false,
        status: res.status,
        data: null,
        message: `The server sent an unexpected response (${res.status}). Please try again.`,
        code: "BAD_RESPONSE",
        requestId: headerId,
      };
    }

    const ok = res.ok && json.success !== false;

    if (
      !ok &&
      res.status === 401 &&
      redirectOn401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/auth")
    ) {
      window.location.assign("/auth/login");
    }

    return {
      ok,
      status: res.status,
      data: json,
      message: json.message || (ok ? "" : `Request failed (${res.status})`),
      code: json.error?.code,
      requestId: json.requestId || headerId,
    };
  } catch (err) {
    const timedOut = err?.name === "AbortError";
    return {
      ok: false,
      status: 0,
      data: null,
      message: timedOut
        ? "The request timed out. Please check your connection and try again."
        : "Cannot reach the server. Please check your internet connection.",
      code: timedOut ? "TIMEOUT" : "NETWORK",
      requestId: null,
    };
  } finally {
    clearTimeout(timer);
  }
}
