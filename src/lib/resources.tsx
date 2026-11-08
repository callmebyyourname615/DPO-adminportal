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
  required?: boolean | undefined;
  options?: { value: string | undefined; label: string }[];
  slugFrom?: string | undefined;
  accept?: string[] | undefined;
  maxMb?: number | undefined;
  help?: string | undefined;
  wide?: boolean | undefined;
  max?: number | undefined;
}

export interface ColumnDef {
  key: string;
  label: string;
  className?: string | undefined;
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
  preview?: "article" | "faq" | undefined;
  publicUrl?: (row: Record<string, any>) => string | null;
  canCreate?: boolean | undefined;
  readOnlyDetail?: boolean | undefined;
  slugResource?: "news" | "pages" | undefined;
  searchPlaceholder?: string | undefined;
}

const statusOpts = [
  { value: "draft", label: "ຮ່າງ" },
  { value: "published", label: "ເຜີຍແຜ່ແລ້ວ" },
];

export const newsCategories = [
  { value: "news", label: "ຂ່າວທົ່ວໄປ" },
  { value: "activity", label: "ກິດຈະກໍາ" },
  { value: "announcement", label: "ປະກາດ" },
  { value: "international", label: "ການ​ຮ່ວມ​ມື​ສາ​ກົນ​" },
];

export const documentCategories = [
  { value: "decree", label: "ດຳລັດ" },
  { value: "agreement", label: "ຂໍ້ຕົກລົງ" },
  { value: "notice", label: "ແຈ້ງການ" },
  { value: "form", label: "ແບບຟອມພິມ" },
  { value: "guideline", label: "ບົດແນະນຳ" },
  { value: "fsnp", label: "FSNP" },
  { value: "general", label: "ຂໍ້ມູນທົ່ວໄປ" },
];

const inquiryStatus = [
  { value: "new", label: "ໃໝ່" },
  { value: "in_progress", label: "ຢູ່ໃນຄວາມຄືບຫນ້າ" },
  { value: "resolved", label: "ປະມວນຜົນແລ້ວ" },
  { value: "archived", label: "ຮວບຮວມ" },
];

const label = (opts: { value: string; label: string }[], v: string) =>
  opts.find((o) => o.value === v)?.label ?? v ?? "—";

const publicSiteUrl = (import.meta.env["VITE_DPO_PUBLIC_SITE_URL"] as string | undefined)?.replace(
  /\/+$/,
  "",
);

const statusCol: ColumnDef = {
  key: "status",
  label: "ສະຖານະ",
  render: (r) => <StatusBadge status={r["status"]} />,
};

export const resources: Record<string, ResourceDef> = {
  news: {
    key: "news",
    title: "ຈັດການຂ່າວ",
    singular: "ຂ່າວ",
    basePath: "/news",
    slugResource: "news",
    preview: "article",
    searchPlaceholder: "ຊອກຫາຫົວຂໍ້ຂ່າວ",
    publicUrl: (r) => (publicSiteUrl && r["slug"] ? `${publicSiteUrl}/news/${r["slug"]}` : null),
    columns: [
      { key: "title", label: "ຫົວຂໍ້", className: "min-w-64 font-medium" },
      { key: "category", label: "ປະເພດ", render: (r) => label(newsCategories, r["category"]) },
      { key: "publishedAt", label: "ວັນທີ", render: (r) => formatDate(r["publishedAt"]) },
      statusCol,
    ],
    filters: [
      { param: "category", label: "ປະເພດ", options: newsCategories },
      { param: "status", label: "ສະຖານະ", options: statusOpts },
    ],
    fields: [
      { name: "title", label: "ຫົວຂໍ້", type: "text", required: true, wide: true, max: 200 },
      { name: "slug", label: "Slug", type: "slug", required: true, slugFrom: "title" },
      { name: "category", label: "ປະເພດ", type: "select", required: true, options: newsCategories },
      { name: "excerpt", label: "ປ້າຍກຳກັບ", type: "textarea", wide: true, max: 500 },
      { name: "content", label: "ເນື້ອໃນ", type: "richtext", required: true, wide: true },
      { name: "coverImageUrl", label: "ຮູບໜ້າປົກ", type: "image", accept: ["jpg", "jpeg", "png", "webp"], maxMb: 5 },
      { name: "gallery", label: "ຄັງຮູບ", type: "gallery", accept: ["jpg", "jpeg", "png", "webp"], maxMb: 5 },
      { name: "publishedAt", label: "ວັນທີເຜີຍແຜ່", type: "date" },
      { name: "status", label: "ສະຖານະ", type: "status", required: true },
    ],
  },
  documents: {
    key: "documents",
    title: "ຈັດການເອກະສານ",
    singular: "ເອກະສານ",
    basePath: "/documents",
    searchPlaceholder: "ຊອກຫາຊື່ເອກະສານ",
    columns: [
      { key: "title", label: "ຊື່ເອກະສານ", className: "min-w-64 font-medium" },
      { key: "category", label: "ປະເພດ", render: (r) => label(documentCategories, r["category"]) },
      { key: "fileType", label: "ປະເພດ", render: (r) => (r["fileType"] ? String(r["fileType"]).toUpperCase() : "—") },
      { key: "fileSize", label: "ຂະໜາດ", className: "num", render: (r) => formatBytes(r["fileSize"]) },
      { key: "documentDate", label: "ວັນທີ", render: (r) => formatDate(r["documentDate"]) },
      { key: "fileStatus", label: "ໄຟລ໌", render: (r) => <StatusBadge status={r["fileStatus"]} /> },
    ],
    filters: [{ param: "category", label: "ປະເພດ", options: documentCategories }],
    fields: [
      { name: "title", label: "ຊື່ເອກະສານ", type: "text", required: true, wide: true, max: 250 },
      { name: "category", label: "ປະເພດ", type: "select", required: true, options: documentCategories },
      { name: "documentDate", label: "ວັນທີ", type: "date" },
      { name: "fileUrl", label: "ໄຟລ໌ (PDF/XLSX)", type: "file", accept: ["pdf", "xlsx"], maxMb: 20, wide: true },
      { name: "status", label: "ສະຖານະ", type: "status", required: true },
    ],
  },
  inquiries: {
    key: "inquiries",
    title: "ຕິດຕໍ່ກ່ອງຂໍ້ຄວາມ",
    singular: "ຂໍ້ຄວາມ",
    basePath: "/inquiries",
    canCreate: false,
    readOnlyDetail: true,
    searchPlaceholder: "ຊອກຫາຊື່, ອີເມວ, ຫຼືຫົວຂໍ້.",
    columns: [
      { key: "name", label: "ຊື່", className: "font-medium" },
      { key: "email", label: "ອີເມວ" },
      { key: "subject", label: "ຫົວຂໍ້", className: "min-w-56" },
      { key: "source", label: "ຕົ້ນກໍາເນີດ", render: (r) => (r["source"] === "faq" ? "FAQ" : "ຫນ້າຕິດຕໍ່") },
      { key: "createdAt", label: "ວັນທີ", render: (r) => formatDate(r["createdAt"]) },
      { key: "status", label: "ສະຖານະ", render: (r) => <StatusBadge status={r["status"]} /> },
    ],
    filters: [{ param: "status", label: "ສະຖານະ", options: inquiryStatus }],
    fields: [{ name: "status", label: "ສະຖານະ", type: "select", required: true, options: inquiryStatus }],
  },
  faqs: {
    key: "faqs",
    title: "ຈັດການ FAQ",
    singular: "ຄຳຖາມ",
    basePath: "/faqs",
    preview: "faq",
    searchPlaceholder: "ຊອກຫາຄໍາຖາມ",
    columns: [
      { key: "order", label: "ລຳດັບ", className: "num w-16" },
      { key: "question", label: "ຄຳຖາມ", className: "min-w-72 font-medium" },
      statusCol,
    ],
    filters: [{ param: "status", label: "ສະຖານະ", options: statusOpts }],
    fields: [
      { name: "question", label: "ຄຳຖາມ", type: "text", required: true, wide: true, max: 300 },
      { name: "answer", label: "ຄໍາຕອບ", type: "richtext", required: true, wide: true },
      { name: "order", label: "ລຳດັບ", type: "number", required: true },
      { name: "status", label: "ສິ່ງພິມ", type: "status", required: true },
    ],
  },
  partners: {
    key: "partners",
    title: "ຈັດການອົງການທີ່ເຊື່ອມຕໍ່",
    singular: "ອົງການ",
    basePath: "/partners",
    searchPlaceholder: "ຊອກຫາຊື່ອົງກອນ",
    columns: [
      { key: "order", label: "ລຳດັບ", className: "num w-16" },
      { key: "name", label: "ຊື່ອົງການ", className: "min-w-56 font-medium" },
      { key: "url", label: "ເວັບໄຊທ໌" },
      statusCol,
    ],
    filters: [],
    fields: [
      { name: "name", label: "ຊື່ອົງການ", type: "text", required: true, wide: true, max: 200 },
      { name: "logoUrl", label: "ໂລໂກ້", type: "image", accept: ["png", "jpg", "jpeg", "webp"], maxMb: 2 },
      { name: "url", label: "URL ເວັບໄຊທ໌", type: "url", required: true },
      { name: "address", label: "ທີ່ຢູ່", type: "textarea", wide: true },
      { name: "phone", label: "ເບີໂທລະສັບ", type: "tel" },
      { name: "email", label: "ອີເມວ", type: "email" },
      { name: "order", label: "ລໍາດັບການສະແດງ", type: "number", required: true },
      { name: "status", label: "ສະຖານະ", type: "status", required: true },
    ],
  },
  banners: {
    key: "banners",
    title: "ຈັດການຫນ້າທໍາອິດ",
    singular: "ປ້າຍໂຄສະນາ",
    basePath: "/home",
    preview: "article",
    searchPlaceholder: "ປ້າຍໂຄສະນາຄົ້ນຫາ",
    columns: [
      { key: "order", label: "ລຳດັບ", className: "num w-16" },
      { key: "title", label: "ຊື່ປ້າຍໂຄສະນາ", className: "min-w-56 font-medium" },
      { key: "linkUrl", label: "ເຊື່ອມຕໍ່" },
      statusCol,
    ],
    filters: [{ param: "status", label: "ສະຖານະ", options: statusOpts }],
    fields: [
      { name: "title", label: "ຊື່ປ້າຍໂຄສະນາ", type: "text", required: true, wide: true },
      { name: "imageUrl", label: "ຮູບ", type: "image", accept: ["jpg", "jpeg", "png", "webp"], maxMb: 5, required: true },
      { name: "linkUrl", label: "ເຊື່ອມຕໍ່", type: "url" },
      { name: "order", label: "ລຳດັບ", type: "number", required: true },
      { name: "status", label: "ສະຖານະ", type: "status", required: true },
    ],
  },
  pages: {
    key: "pages",
    title: "ຈັດການຫນ້າເນື້ອຫາ",
    singular: "ຫນ້າເນື້ອຫາ",
    basePath: "/pages",
    slugResource: "pages",
    preview: "article",
    searchPlaceholder: "ໜ້າຊອກຫາ",
    publicUrl: (r) => (publicSiteUrl && r["slug"] ? `${publicSiteUrl}/${r["slug"]}` : null),
    columns: [
      { key: "title", label: "ຊື່ໜ້າ", className: "min-w-56 font-medium" },
      { key: "slug", label: "Slug" },
      { key: "updatedAt", label: "ດັດແກ້ຫຼ້າສຸດ", render: (r) => formatDate(r["updatedAt"]) },
      statusCol,
    ],
    filters: [{ param: "status", label: "ສະຖານະ", options: statusOpts }],
    fields: [
      { name: "title", label: "ຊື່ໜ້າ", type: "text", required: true, wide: true },
      {
        name: "slug",
        label: "Slug",
        type: "slug",
        required: true,
        slugFrom: "title",
        help: "ເຊັ່ນ about, history, mission, structure",
      },
      { name: "content", label: "ເນື້ອໃນ", type: "richtext", required: true, wide: true },
      { name: "imageUrl", label: "ຮູບ", type: "image", accept: ["jpg", "jpeg", "png", "webp"], maxMb: 5 },
      { name: "status", label: "ສະຖານະ", type: "status", required: true },
    ],
  },
};
