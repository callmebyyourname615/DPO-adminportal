import { getApiBaseUrl } from "./client";

/** Resolve stored asset URLs at display time so editing preserves the stored value. */
export function mediaUrl(value?: string | null): string {
  if (!value) return "";
  const path = value.startsWith("/assets/") ? `/api${value}` : value;
  return path.startsWith("/api/") ? `${getApiBaseUrl() ?? ""}${path}` : path;
}
