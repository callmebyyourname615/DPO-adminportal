// Proposed data contracts. Confirm field names with the backend before connecting.
// All dates are ISO 8601 strings as returned by the API; format them in the UI only.

export type ID = string;
export type PublishStatus = "draft" | "published";

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type NewsCategory = "news" | "activity" | "announcement" | "international";

export interface News extends Timestamps {
  id: ID;
  title: string;
  slug: string;
  category: NewsCategory;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  gallery: string[];
  publishedAt: string | null;
  status: PublishStatus;
}

export type DocumentCategory =
  | "decree"
  | "agreement"
  | "notice"
  | "form"
  | "guideline"
  | "fsnp"
  | "general";

export type FileStatus = "available" | "missing" | "processing";

export interface Document extends Timestamps {
  id: ID;
  title: string;
  category: DocumentCategory;
  documentDate: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileType: "pdf" | "xlsx" | null;
  fileSize: number | null;
  fileStatus: FileStatus;
  status: PublishStatus;
}

export type InquiryStatus = "new" | "in_progress" | "resolved" | "archived";

export interface Inquiry extends Timestamps {
  id: ID;
  name: string;
  email: string;
  subject: string;
  message: string;
  source: "contact" | "faq";
  status: InquiryStatus;
}

export interface FAQ extends Timestamps {
  id: ID;
  question: string;
  answer: string;
  order: number;
  status: PublishStatus;
}

export interface Partner extends Timestamps {
  id: ID;
  name: string;
  logoUrl: string | null;
  address: string;
  phone: string;
  email: string;
  url: string;
  order: number;
  status: PublishStatus;
}

export interface Banner extends Timestamps {
  id: ID;
  title: string;
  imageUrl: string | null;
  linkUrl: string;
  order: number;
  status: PublishStatus;
}

export interface HomeIntro {
  title: string;
  content: string;
  imageUrl: string | null;
  updatedAt: string;
}

export type PageSlug = "about" | "history" | "mission" | "structure" | string;

export interface Page extends Timestamps {
  id: ID;
  title: string;
  slug: PageSlug;
  content: string;
  imageUrl: string | null;
  status: PublishStatus;
}

export interface SiteSettings {
  email: string;
  phone: string;
  address: string;
  facebookUrl: string;
  youtubeUrl: string;
  mapEmbedUrl: string;
  footerAudioUrl: string | null;
  updatedAt: string;
}

export interface Media extends Timestamps {
  id: ID;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface DashboardStats {
  newsTotal: number;
  newsPublished: number;
  documentsTotal: number;
  inquiriesNew: number;
  inquiriesTotal: number;
  faqsPublished: number;
  newsByMonth: { month: string; published: number; draft: number }[];
  documentsByCategory: { category: DocumentCategory; count: number }[];
}

export interface ListQuery {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  status?: string;
}
