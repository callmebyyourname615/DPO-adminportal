// Shared input rules used by forms. Server must re-validate everything.
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(v: string): boolean {
  return SLUG_RE.test(v);
}

export function isValidHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export function slugify(v: string): string {
  return v
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

export const MAX_UPLOAD_MB = { image: 5, document: 20, audio: 10 } as const;

export function validateFile(
  file: File,
  accept: string[],
  maxMb: number,
): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!accept.includes(ext)) return `ປະເພດໄຟລ໌ທີ່ບໍ່ຮອງຮັບ (ສະຫນັບສະຫນູນ: ${accept.join(", ")})`;
  if (file.size > maxMb * 1024 * 1024) return `ໄຟລ໌ໃຫຍ່ເກີນໄປ. ${maxMb} MB`;
  return null;
}
