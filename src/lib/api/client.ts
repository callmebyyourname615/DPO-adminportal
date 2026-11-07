// Thin HTTP client. No credentials or secrets live in the frontend.
// The admin API contract is a proposal: until VITE_DPO_API_BASE_URL is set, every call
// throws ApiNotConnectedError and the UI shows the "not connected" state.

export class ApiNotConnectedError extends Error {
  constructor() {
    super("API_NOT_CONNECTED");
    this.name = "ApiNotConnectedError";
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiBaseUrl(): string | null {
  const raw = (import.meta.env["VITE_DPO_API_BASE_URL"] as string | undefined)?.trim();
  return raw ? raw.replace(/\/+$/, "") : null;
}

export type DataMode = "mock" | "api";

/** VITE_DATA_MODE=mock|api. Unset: "api" when a base URL exists (never hide real data), else "mock". */
export function getDataMode(): DataMode {
  const raw = (import.meta.env["VITE_DATA_MODE"] as string | undefined)?.trim().toLowerCase();
  if (raw === "mock" || raw === "api") return raw;
  return getApiBaseUrl() ? "api" : "mock";
}

export function isMockMode(): boolean {
  return getDataMode() === "mock";
}

/** True when reads/writes can run (mock store or configured API). */
export function canUseData(): boolean {
  return isMockMode() || isApiConfigured();
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl() !== null;
}

export function buildUrl(base: string, path: string, query?: Record<string, unknown>): string {
  const url = new URL(base + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/**
 * Auth headers are intentionally not guessed. Wire the real auth (session cookie,
 * bearer token, ...) here once the backend contract is confirmed.
 */
function getAuthHeaders(): Record<string, string> {
  return {};
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | undefined;
  query?: Record<string, unknown>;
  body?: unknown | undefined;
  signal?: AbortSignal | undefined;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) throw new ApiNotConnectedError();
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  const res = await fetch(buildUrl(base, path, opts.query), {
    method: opts.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(opts.body && !isForm ? { "Content-Type": "application/json" } : {}),
      ...getAuthHeaders(),
    },
    body: (opts.body ? (isForm ? (opts.body as FormData) : JSON.stringify(opts.body)) : null) as BodyInit | null,
    ...(opts.signal ? { signal: opts.signal } : {}),
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = j?.message ?? msg;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
