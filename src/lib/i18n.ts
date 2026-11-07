// Minimal translation layer. Add a "lo" dictionary with the same keys to switch to Lao.
const th = {
  appName: "DPO Admin",
  appSubtitle: "สำนักงานปกป้องเงินฝาก",
  dashboard: "แดชบอร์ด",
  news: "ข่าว",
  documents: "เอกสาร",
  inquiries: "ข้อความติดต่อ",
  faqs: "FAQ",
  partners: "หน่วยงานเชื่อมต่อ",
  home: "หน้าแรก",
  pages: "หน้าเนื้อหา",
  media: "สื่อ",
  settings: "ตั้งค่า",
  users: "ผู้ใช้และสิทธิ์",
  groupContent: "เนื้อหา",
  groupCommunication: "การติดต่อ",
  groupSite: "เว็บไซต์",
  groupAdmin: "ผู้ดูแลระบบ",
  search: "ค้นหา",
  add: "เพิ่มใหม่",
  edit: "แก้ไข",
  delete: "ลบ",
  save: "บันทึก",
  cancel: "ยกเลิก",
  back: "กลับ",
  preview: "ตัวอย่าง",
  loading: "กำลังโหลด…",
  empty: "ยังไม่มีข้อมูล",
  emptyHint: "เมื่อเชื่อมต่อ API แล้ว ข้อมูลจะแสดงที่นี่",
  notConnected: "ยังไม่ได้เชื่อมต่อ API",
  notConnectedHint:
    "ยังไม่ได้กำหนด VITE_DPO_API_BASE_URL หรือยังไม่ยืนยันสัญญา API กับ backend จึงยังอ่านหรือบันทึกข้อมูลไม่ได้",
  error: "โหลดข้อมูลไม่สำเร็จ",
  retry: "ลองอีกครั้ง",
  saved: "บันทึกสำเร็จ",
  deleted: "ลบสำเร็จ",
  saveDisabled: "บันทึกไม่ได้จนกว่าจะเชื่อมต่อ API",
  confirmDelete: "ยืนยันการลบ?",
  confirmDeleteBody: "การลบไม่สามารถย้อนกลับได้",
  confirmUnpublish: "ยืนยันยกเลิกการเผยแพร่?",
  confirmUnpublishBody: "เนื้อหานี้จะไม่แสดงบนเว็บไซต์สาธารณะอีก",
  confirm: "ยืนยัน",
  all: "ทั้งหมด",
  status: "สถานะ",
  actions: "จัดการ",
  page: "หน้า",
  of: "จาก",
  prev: "ก่อนหน้า",
  next: "ถัดไป",
  draft: "ฉบับร่าง",
  published: "เผยแพร่แล้ว",
  connected: "เชื่อมต่อแล้ว",
  admin: "ผู้ดูแล",
} as const;

export type I18nKey = keyof typeof th;
const dictionaries = { th } as const;
let locale: keyof typeof dictionaries = "th";

export function t(key: I18nKey): string {
  return dictionaries[locale][key] ?? key;
}

export const LOCALE_TAG = "th-TH";

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(LOCALE_TAG, { year: "numeric", month: "short", day: "numeric" });
}

export function formatBytes(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
