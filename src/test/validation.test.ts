import { describe, expect, it, vi } from "vitest";
import { isValidHttpUrl, isValidSlug, slugify } from "@/lib/validation";
import { apiRequest, ApiNotConnectedError } from "@/lib/api/client";

describe("rules", () => {
  it("partner URL must be http(s)", () => {
    expect(isValidHttpUrl("https://dpo.gov.la")).toBe(true);
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpUrl("dpo.gov.la")).toBe(false);
  });
  it("accepts the API's Unicode and legacy slugs and rejects URL separators", () => {
    expect(isValidSlug("about-us")).toBe(true);
    expect(isValidSlug("About Us")).toBe(false);
    expect(isValidSlug("ຂ່າວ-ສປງ")).toBe(true);
    expect(isValidSlug("dpo_international_news")).toBe(true);
    for (const value of ["", "news/path", "news?draft", "news#section"]) expect(isValidSlug(value)).toBe(false);
  });
  it("keeps Lao letters and vowel marks when generating a slug", () => {
    expect(slugify("ຂ່າວ ສປງ")).toBe("ຂ່າວ-ສປງ");
    expect(slugify(" DPO News 2026! ")).toBe("dpo-news-2026");
  });
  it("API calls fail as not-connected when no base URL", async () => {
    vi.stubEnv("VITE_DPO_API_BASE_URL", "");
    await expect(apiRequest("/api/admin/news")).rejects.toBeInstanceOf(ApiNotConnectedError);
  });
});
