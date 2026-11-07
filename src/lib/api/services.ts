import { apiRequest } from "./client";
import type {
  Banner,
  DashboardStats,
  Document,
  FAQ,
  HomeIntro,
  Inquiry,
  ListQuery,
  Media,
  News,
  Page,
  PaginatedResponse,
  Partner,
  SiteSettings,
} from "./types";

// Proposed admin endpoints — confirm with backend before going live.
export interface CrudService<T> {
  endpoint: string;
  list: (q: ListQuery) => Promise<PaginatedResponse<T>>;
  get: (id: string) => Promise<T>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

function crud<T>(endpoint: string): CrudService<T> {
  return {
    endpoint,
    list: (q) => apiRequest(endpoint, { query: { ...q } }),
    get: (id) => apiRequest(`${endpoint}/${encodeURIComponent(id)}`),
    create: (data) => apiRequest(endpoint, { method: "POST", body: data }),
    update: (id, data) =>
      apiRequest(`${endpoint}/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),
    remove: (id) => apiRequest(`${endpoint}/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}

export const services = {
  news: crud<News>("/api/admin/news"),
  documents: crud<Document>("/api/admin/documents"),
  inquiries: crud<Inquiry>("/api/admin/inquiries"),
  faqs: crud<FAQ>("/api/admin/faqs"),
  partners: crud<Partner>("/api/admin/partners"),
  banners: crud<Banner>("/api/admin/home/banners"),
  pages: crud<Page>("/api/admin/pages"),
  media: crud<Media>("/api/admin/media"),
};

export type ServiceKey = keyof typeof services;

export const homeIntroService = {
  get: () => apiRequest<HomeIntro>("/api/admin/home/intro"),
  update: (d: Partial<HomeIntro>) =>
    apiRequest<HomeIntro>("/api/admin/home/intro", { method: "PATCH", body: d }),
};

export const settingsService = {
  get: () => apiRequest<SiteSettings>("/api/admin/site-settings"),
  update: (d: Partial<SiteSettings>) =>
    apiRequest<SiteSettings>("/api/admin/site-settings", { method: "PATCH", body: d }),
};

export const statsService = {
  get: () => apiRequest<DashboardStats>("/api/admin/stats"),
};

export const slugService = {
  /** Proposed: returns { available: boolean }. */
  check: (resource: "news" | "pages", slug: string, excludeId?: string) =>
    apiRequest<{ available: boolean }>(`/api/admin/${resource}/slug-check`, {
      query: { slug, excludeId },
    }),
};
