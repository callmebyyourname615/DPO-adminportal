import { describe, expect, it, vi } from "vitest";
import { isValidHttpUrl, isValidSlug } from "@/lib/validation";
import { apiRequest, ApiNotConnectedError } from "@/lib/api/client";

describe("rules", () => {
  it("partner URL must be http(s)", () => {
    expect(isValidHttpUrl("https://dpo.gov.la")).toBe(true);
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpUrl("dpo.gov.la")).toBe(false);
  });
  it("slug is lowercase a-z0-9 with dashes", () => {
    expect(isValidSlug("about-us")).toBe(true);
    expect(isValidSlug("About Us")).toBe(false);
  });
  it("API calls fail as not-connected when no base URL", async () => {
    vi.stubEnv("VITE_DPO_API_BASE_URL", "");
    await expect(apiRequest("/api/admin/news")).rejects.toBeInstanceOf(ApiNotConnectedError);
  });
});
