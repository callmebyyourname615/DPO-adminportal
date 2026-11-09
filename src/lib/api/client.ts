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

export function canUseData(): boolean {
  return isApiConfigured();
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

export const SESSION_KEY = "dpo_admin_token";

export function getSessionToken(): string | null {
  return typeof window === "undefined" ? null : sessionStorage.getItem(SESSION_KEY) || window.localStorage.getItem(SESSION_KEY);
}
export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}
export function saveSession(token: string, remember: boolean): void {
  clearSession();
  (remember ? window.localStorage : sessionStorage).setItem(SESSION_KEY, token);
}

function getAuthHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface RequestOptions {
  responseType?: "json" | "blob";
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
      Accept: opts.responseType === "blob" ? "*/*" : "application/json",
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
    if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/api/auth/login")) {
      clearSession();
      window.dispatchEvent(new Event("dpo-session-expired"));
    }
    throw new ApiError(res.status, Array.isArray(msg) ? msg.join(", ") : msg);
  }
  if (res.status === 204) return undefined as T;
  if (opts.responseType === "blob") return (await res.blob()) as T;
  return (await res.json()) as T;
}
