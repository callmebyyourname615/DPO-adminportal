import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, clearSession, getSessionToken, saveSession, SESSION_KEY } from "@/lib/api/client";

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  });
});
afterEach(() => { sessionStorage.clear(); window.localStorage.clear(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("API authentication", () => {
  it("uses persistent or tab storage according to remember me and clears both", () => {
    saveSession("persistent", true);
    expect(window.localStorage.getItem(SESSION_KEY)).toBe("persistent");
    expect(getSessionToken()).toBe("persistent");
    saveSession("temporary", false);
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(sessionStorage.getItem(SESSION_KEY)).toBe("temporary");
    clearSession();
    expect(getSessionToken()).toBeNull();
  });
  it("sends the session bearer token to the configured API", async () => {
    vi.stubEnv("VITE_DPO_API_BASE_URL", "http://localhost:3000");
    sessionStorage.setItem(SESSION_KEY, "test-token");
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetch);
    await apiRequest("/api/admin/news");
    expect(fetch.mock.calls[0]![0].toString()).toBe("http://localhost:3000/api/admin/news");
    expect(fetch.mock.calls[0]![1].headers.Authorization).toBe("Bearer test-token");
  });
  it("clears an expired session on an unauthorized response", async () => {
    vi.stubEnv("VITE_DPO_API_BASE_URL", "http://localhost:3000");
    window.localStorage.setItem(SESSION_KEY, "expired");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    await expect(apiRequest("/api/admin/news")).rejects.toThrow();
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
