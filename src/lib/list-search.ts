export interface ListSearch {
  q?: string;
  category?: string;
  status?: string;
  page?: number;
}

/** Validates list-page URL query params (?q=&category=&status=&page=). */
export function parseListSearch(s: Record<string, unknown>): ListSearch {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.slice(0, 200) : undefined);
  const page = Number(s.page);
  return {
    q: str(s.q),
    category: str(s.category),
    status: str(s.status),
    page: Number.isInteger(page) && page > 1 ? page : undefined,
  };
}
