import type { ReactNode } from "react";
import type { ServiceKey } from "./api/services";
import { formatBytes, formatDate } from "./i18n";
import { StatusBadge } from "@/components/admin/StatusBadge";

export type FieldType =
  | "text"
  | "slug"
  | "textarea"
  | "richtext"
  | "select"
  | "date"
  | "url"
  | "email"
  | "tel"
  | "number"
  | "image"
  | "file"
  | "gallery"
  | "status";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  slugFrom?: string;
  accept?: string[];
  maxMb?: number;
  help?: string;
  wide?: boolean;
  max?: number;
}

export interface ColumnDef {
  key: string;
  label: string;
  className?: string;
  render?: (row: Record<string, any>) => ReactNode;
}

export interface FilterDef {
  param: "category" | "status";
  label: string;
  options: { value: string; label: string }[];
}

export interface ResourceDef {
  key: ServiceKey;
  title: string;
  singular: string;
  basePath: string;
  columns: ColumnDef[];
  filters: FilterDef[];
  fields: FieldDef[];
  preview?: "article" | "faq";
  publicUrl?: (row: Record<string, any>) => string | null;
  canCreate?: boolean;
  readOnlyDetail?: boolean;
  slugResource?: "news" | "pages";
  searchPlaceholder?: string;
}

const statusOpts = [
  { value: "draft", label: "ฉบับร่าง" },
  { value: "published", label: "เผยแพร่แล้ว" },
];

export const newsCategories = [
  { value: "news", label: "ข่าวทั่วไป" },
  { value: "activity", label: "กิจกรรม" },
  { value: "announcement", label: "ประกาศ" },
  { value: "international", label: "ความร่วมมือสากล" },
];

export const documentCategories = [
  { value: "decree", label: "ดำรัส" },
  { value: "agreement", label: "ข้อตกลง" },
  { value: "notice", label: "แจ้งการ" },
  { value: "form", label: "แบบพิมพ์" },
  { value: "guideline", label: "บทแนะนำ" },
  { value: "fsnp", label: "FSNP" },
  { value: "general", label: "ข้อมูลทั่วไป" },
];

const inquiryStatus = [
  { value: "new", label: "ใหม่" },
  { value: "in_progress", label: "กำลังดำเนินการ" },
  { value: "resolved", label: "ดำเนินการแล้ว" },
  { value: "archived", label: "เก็บถาวร" },
];

const label = (opts: { value: string; label: string }[], v: string) =>
  opts.find((o) => o.value === v)?.label ?? v ?? "—";

const publicSiteUrl = (import.meta.env.VITE_DPO_PUBLIC_SITE_URL as string | undefined)?.replace(
  /\/+$/,
  "",
);

const statusCol: ColumnDef = {
  key: "status",
  label: "สถานะ",
  render: (r) => <StatusBadge status={r.status} />,
};

export const resources: Record<string, ResourceDef> = {
  news: {
    key: "news",
    title: "จัดการข่าว",
    singular: "ข่าว",
    basePath: "/news",
    slugResource: "news",
    preview: "article",
    searchPlaceholder: "ค้นหาหัวข้อข่าว",
    publicUrl: (r) => (publicSiteUrl && r.slug ? `${publicSiteUrl}/news/${r.slug}` : null),
    columns: [
      { key: "title", label: "หัวข้อ", className: "min-w-64 font-medium" },
      { key: "category", label: "หมวดหมู่", render: (r) => label(newsCategories, r.category) },
      { key: "publishedAt", label: "วันที่", render: (r) => formatDate(r.publishedAt) },
      statusCol,
    ],
    filters: [
      { param: "category", label: "หมวดหมู่", options: newsCategories },
      { param: "status", label: "สถานะ", options: statusOpts },
    ],
    fields: [
      { name: "title", label: "หัวข้อ", type: "text", required: true, wide: true, max: 200 },
      { name: "slug", label: "Slug", type: "slug", required: true, slugFrom: "title" },
      { name: "category", label: "หมวดหมู่", type: "select", required: true, options: newsCategories },
      { name: "excerpt", label: "คำโปรย", type: "textarea", wide: true, max: 500 },
      { name: "content", label: "เนื้อหา", type: "richtext", required: true, wide: true },
      { name: "coverImageUrl", label: "ภาพปก", type: "image", accept: ["jpg", "jpeg", "png", "webp"], maxMb: 5 },
      { name: "gallery", label: "แกลเลอรี", type: "gallery", accept: ["jpg", "jpeg", "png", "webp"], maxMb: 5 },
      { name: "publishedAt", label: "วันที่เผยแพร่", type: "date" },
      { name: "status", label: "สถานะ", type: "status", required: true },
    ],
  },
  documents: {
    key: "documents",
    title: "จัดการเอกสาร",
    singular: "เอกสาร",
    basePath: "/documents",
    searchPlaceholder: "ค้นหาชื่อเอกสาร",
    columns: [
      { key: "title", label: "ชื่อเอกสาร", className: "min-w-64 font-medium" },
      { key: "category", label: "หมวด", render: (r) => label(documentCategories, r.category) },
      { key: "fileType", label: "ชนิด", render: (r) => (r.fileType ? String(r.fileType).toUpperCase() : "—") },
      { key: "fileSize", label: "ขนาด", className: "num", render: (r) => formatBytes(r.fileSize) },
      { key: "documentDate", label: "วันที่", render: (r) => formatDate(r.documentDate) },
      { key: "fileStatus", label: "ไฟล์", render: (r) => <StatusBadge status={r.fileStatus} /> },
    ],
    filters: [{ param: "category", label: "ประเภท", options: documentCategories }],
    fields: [
      { name: "title", label: "ชื่อเอกสาร", type: "text", required: true, wide: true, max: 250 },
      { name: "category", label: "หมวด", type: "select", required: true, options: documentCategories },
      { name: "documentDate", label: "วันที่", type: "date" },
      { name: "fileUrl", label: "ไฟล์ (PDF/XLSX)", type: "file", accept: ["pdf", "xlsx"], maxMb: 20, wide: true },
      { name: "status", label: "สถานะ", type: "status", required: true },
    ],
  },
  inquiries: {
    key: "inquiries",
    title: "กล่องข้อความติดต่อ",
    singular: "ข้อความ",
    basePath: "/inquiries",
    canCreate: false,
    readOnlyDetail: true,
    searchPlaceholder: "ค้นหาชื่อ อีเมล หรือหัวข้อ",
    columns: [
      { key: "name", label: "ชื่อ", className: "font-medium" },
      { key: "email", label: "อีเมล" },
      { key: "subject", label: "หัวข้อ", className: "min-w-56" },
      { key: "source", label: "ที่มา", render: (r) => (r.source === "faq" ? "FAQ" : "หน้าติดต่อ") },
      { key: "createdAt", label: "วันที่", render: (r) => formatDate(r.createdAt) },
      { key: "status", label: "สถานะ", render: (r) => <StatusBadge status={r.status} /> },
    ],
    filters: [{ param: "status", label: "สถานะ", options: inquiryStatus }],
    fields: [{ name: "status", label: "สถานะ", type: "select", required: true, options: inquiryStatus }],
  },
  faqs: {
    key: "faqs",
    title: "จัดการ FAQ",
    singular: "คำถาม",
    basePath: "/faqs",
    preview: "faq",
    searchPlaceholder: "ค้นหาคำถาม",
    columns: [
      { key: "order", label: "ลำดับ", className: "num w-16" },
      { key: "question", label: "คำถาม", className: "min-w-72 font-medium" },
      statusCol,
    ],
    filters: [{ param: "status", label: "สถานะ", options: statusOpts }],
    fields: [
      { name: "question", label: "คำถาม", type: "text", required: true, wide: true, max: 300 },
      { name: "answer", label: "คำตอบ", type: "richtext", required: true, wide: true },
      { name: "order", label: "ลำดับ", type: "number", required: true },
      { name: "status", label: "การเผยแพร่", type: "status", required: true },
    ],
  },
  partners: {
    key: "partners",
    title: "จัดการหน่วยงานเชื่อมต่อ",
    singular: "หน่วยงาน",
    basePath: "/partners",
    searchPlaceholder: "ค้นหาชื่อหน่วยงาน",
    columns: [
      { key: "order", label: "ลำดับ", className: "num w-16" },
      { key: "name", label: "ชื่อหน่วยงาน", className: "min-w-56 font-medium" },
      { key: "url", label: "เว็บไซต์" },
      statusCol,
    ],
    filters: [],
    fields: [
      { name: "name", label: "ชื่อหน่วยงาน", type: "text", required: true, wide: true, max: 200 },
      { name: "logoUrl", label: "โลโก้", type: "image", accept: ["png", "jpg", "jpeg", "svg", "webp"], maxMb: 2 },
      { name: "url", label: "URL เว็บไซต์", type: "url", required: true },
      { name: "address", label: "ที่อยู่", type: "textarea", wide: true },
      { name: "phone", label: "เบอร์โทร", type: "tel" },
      { name: "email", label: "อีเมล", type: "email" },
      { name: "order", label: "ลำดับการแสดง", type: "number", required: true },
      { name: "status", label: "สถานะ", type: "status", required: true },
    ],
  },
  banners: {
    key: "banners",
    title: "จัดการหน้าแรก",
    singular: "แบนเนอร์",
    basePath: "/home",
    preview: "article",
    searchPlaceholder: "ค้นหาแบนเนอร์",
    columns: [
      { key: "order", label: "ลำดับ", className: "num w-16" },
      { key: "title", label: "ชื่อแบนเนอร์", className: "min-w-56 font-medium" },
      { key: "linkUrl", label: "ลิงก์" },
      statusCol,
    ],
    filters: [{ param: "status", label: "สถานะ", options: statusOpts }],
    fields: [
      { name: "title", label: "ชื่อแบนเนอร์", type: "text", required: true, wide: true },
      { name: "imageUrl", label: "ภาพ", type: "image", accept: ["jpg", "jpeg", "png", "webp"], maxMb: 5, required: true },
      { name: "linkUrl", label: "ลิงก์", type: "url" },
      { name: "order", label: "ลำดับ", type: "number", required: true },
      { name: "status", label: "สถานะ", type: "status", required: true },
    ],
  },
  pages: {
    key: "pages",
    title: "จัดการหน้าเนื้อหา",
    singular: "หน้าเนื้อหา",
    basePath: "/pages",
    slugResource: "pages",
    preview: "article",
    searchPlaceholder: "ค้นหาหน้า",
    publicUrl: (r) => (publicSiteUrl && r.slug ? `${publicSiteUrl}/${r.slug}` : null),
    columns: [
      { key: "title", label: "ชื่อหน้า", className: "min-w-56 font-medium" },
      { key: "slug", label: "Slug" },
      { key: "updatedAt", label: "แก้ไขล่าสุด", render: (r) => formatDate(r.updatedAt) },
      statusCol,
    ],
    filters: [{ param: "status", label: "สถานะ", options: statusOpts }],
    fields: [
      { name: "title", label: "ชื่อหน้า", type: "text", required: true, wide: true },
      {
        name: "slug",
        label: "Slug",
        type: "slug",
        required: true,
        slugFrom: "title",
        help: "เช่น about, history, mission, structure",
      },
      { name: "content", label: "เนื้อหา", type: "richtext", required: true, wide: true },
      { name: "imageUrl", label: "รูปภาพ", type: "image", accept: ["jpg", "jpeg", "png", "webp"], maxMb: 5 },
      { name: "status", label: "สถานะ", type: "status", required: true },
    ],
  },
};
