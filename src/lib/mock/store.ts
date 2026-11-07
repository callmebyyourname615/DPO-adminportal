// In-memory mock backend. Mirrors the proposed API contract (PaginatedResponse, PATCH semantics).
// Data lives only in memory for this browser tab and resets on refresh.
import { ApiError } from "@/lib/api/client";
import type { DashboardStats, ListQuery, PaginatedResponse } from "@/lib/api/types";
import { buildSeed, type MockDb } from "./seed";

let db: MockDb | null = null;
function getDb(): MockDb {
  if (!db) db = buildSeed();
  return db;
}
export function resetMockDb() {
  db = buildSeed();
}

type CollectionKey = "news" | "documents" | "inquiries" | "faqs" | "partners" | "banners" | "pages" | "media";

/** Type "__error" in any search box to test the error state. */
export const MOCK_ERROR_QUERY = "__error";
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const searchFields = ["title", "question", "name", "subject", "email", "fileName", "slug", "answer"];

let counter = 0;
const newId = (k: string) => `${k}-mock-${Date.now().toString(36)}-${++counter}`;

export function mockCrud<T extends { id: string }>(key: CollectionKey) {
  const rows = () => getDb()[key] as unknown as T[];
  const assertSlugFree = (data: Partial<T>, excludeId?: string) => {
    const slug = (data as Record<string, unknown>)["slug"];
    if ((key === "news" || key === "pages") && slug) {
      if (rows().some((r) => (r as Record<string, unknown>)["slug"] === slug && r.id !== excludeId))
        throw new ApiError(409, `Slug "${String(slug)}" ถูกใช้แล้ว`);
    }
  };
  return {
    async list(q: ListQuery): Promise<PaginatedResponse<T>> {
      await delay();
      if (q.q === MOCK_ERROR_QUERY) throw new ApiError(500, "ข้อผิดพลาดจำลอง (mock) สำหรับทดสอบ error state");
      const needle = q.q?.toLocaleLowerCase();
      let list = [...rows()];
      if (needle)
        list = list.filter((r) =>
          searchFields.some((f) => String((r as Record<string, unknown>)[f] ?? "").toLocaleLowerCase().includes(needle)),
        );
      if (q.category) list = list.filter((r) => (r as Record<string, unknown>)["category"] === q.category);
      if (q.status) list = list.filter((r) => (r as Record<string, unknown>)["status"] === q.status);
      const hasOrder = list.length > 0 && "order" in (list[0] as object);
      list.sort((a, b) => {
        const A = a as Record<string, any>,
          B = b as Record<string, any>;
        return hasOrder ? A["order"] - B["order"] : String(B["createdAt"]).localeCompare(String(A["createdAt"]));
      });
      const limit = Math.min(Math.max(q.limit ?? 10, 1), 100);
      const totalPages = Math.max(1, Math.ceil(list.length / limit));
      const page = Math.min(Math.max(q.page ?? 1, 1), totalPages);
      return { data: list.slice((page - 1) * limit, page * limit), page, limit, total: list.length, totalPages };
    },
    async get(id: string): Promise<T> {
      await delay(200);
      const r = rows().find((x) => x.id === id);
      if (!r) throw new ApiError(404, "ไม่พบข้อมูล");
      return { ...r };
    },
    async create(data: Partial<T>): Promise<T> {
      await delay();
      assertSlugFree(data);
      const now = new Date().toISOString();
      const row = { ...data, id: newId(key), createdAt: now, updatedAt: now } as unknown as T;
      rows().unshift(row);
      return { ...row };
    },
    async update(id: string, data: Partial<T>): Promise<T> {
      await delay();
      const list = rows();
      const i = list.findIndex((x) => x.id === id);
      if (i < 0) throw new ApiError(404, "ไม่พบข้อมูล");
      assertSlugFree(data, id);
      const { id: _ignored, createdAt: _c, ...rest } = data as Record<string, unknown>;
      list[i] = { ...list[i]!, ...rest, updatedAt: new Date().toISOString() } as T;
      return { ...list[i]! };
    },
    async remove(id: string): Promise<void> {
      await delay();
      const list = rows();
      const i = list.findIndex((x) => x.id === id);
      if (i < 0) throw new ApiError(404, "ไม่พบข้อมูล");
      list.splice(i, 1);
    },
  };
}

export function mockSingleton<K extends "homeIntro" | "settings">(key: K) {
  return {
    async get(): Promise<MockDb[K]> {
      await delay(200);
      return { ...getDb()[key] };
    },
    async update(d: Partial<MockDb[K]>): Promise<MockDb[K]> {
      await delay();
      const cur = getDb();
      cur[key] = { ...cur[key], ...d, updatedAt: new Date().toISOString() };
      return { ...cur[key] };
    },
  };
}

/** KPIs and charts derived from the same in-memory rows the lists show. */
export function computeStats(d: MockDb = getDb()): DashboardStats {
  const months = new Map<string, { published: number; draft: number }>();
  for (const n of d.news) {
    const month = (n.publishedAt ?? n.createdAt).slice(0, 7);
    const m = months.get(month) ?? { published: 0, draft: 0 };
    m[n.status] += 1;
    months.set(month, m);
  }
  const cats = new Map<string, number>();
  for (const doc of d.documents) cats.set(doc.category, (cats.get(doc.category) ?? 0) + 1);
  return {
    newsTotal: d.news.length,
    newsPublished: d.news.filter((n) => n.status === "published").length,
    documentsTotal: d.documents.length,
    inquiriesNew: d.inquiries.filter((i) => i.status === "new").length,
    inquiriesTotal: d.inquiries.length,
    faqsPublished: d.faqs.filter((f) => f.status === "published").length,
    newsByMonth: [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({ month, ...v })),
    documentsByCategory: [...cats.entries()].map(([category, count]) => ({
      category: category as DashboardStats["documentsByCategory"][number]["category"],
      count,
    })),
  };
}

export const mockStats = {
  async get(): Promise<DashboardStats> {
    await delay();
    return computeStats();
  },
};

export const mockSlug = {
  async check(resource: "news" | "pages", slug: string, excludeId?: string) {
    await delay(150);
    return { available: !getDb()[resource].some((r) => r.slug === slug && r.id !== excludeId) };
  },
};
