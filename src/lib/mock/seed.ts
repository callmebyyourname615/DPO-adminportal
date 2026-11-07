// MOCK DATA / ข้อมูลตัวอย่าง — fictitious content for UI testing only.
// No real people, contacts or confidential data. Built lazily (no module-scope work).
import type {
  Banner,
  Document,
  DocumentCategory,
  FAQ,
  HomeIntro,
  Inquiry,
  InquiryStatus,
  Media,
  News,
  NewsCategory,
  Page,
  Partner,
  SiteSettings,
} from "@/lib/api/types";

export const MOCK_IMAGE = "/mock/sample-image.svg";
export const MOCK_PDF = "/mock/sample-document.pdf";

const iso = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d, 3)).toISOString();
const ts = (y: number, m: number, d: number) => ({ createdAt: iso(y, m, d), updatedAt: iso(y, m, d) });

export interface MockDb {
  news: News[];
  documents: Document[];
  inquiries: Inquiry[];
  faqs: FAQ[];
  partners: Partner[];
  banners: Banner[];
  pages: Page[];
  media: Media[];
  homeIntro: HomeIntro;
  settings: SiteSettings;
}

export function buildSeed(): MockDb {
  const newsTitles: [string, NewsCategory][] = [
    ["[ตัวอย่าง] สำนักงานปกป้องเงินฝากจัดสัมมนาความรู้ด้านการคุ้มครองเงินฝาก", "activity"],
    ["[ตัวอย่าง] ประกาศอัตราการคุ้มครองเงินฝากประจำปี", "announcement"],
    ["[ตัวอย่าง] ลงนามบันทึกความเข้าใจกับองค์กรประกันเงินฝากต่างประเทศ", "international"],
    ["[ตัวอย่าง] เข้าร่วมการประชุมสมาคมผู้ประกันเงินฝากระหว่างประเทศ", "international"],
    ["[ตัวอย่าง] เปิดตัวช่องทางสอบถามข้อมูลการคุ้มครองเงินฝากออนไลน์", "news"],
    ["[ตัวอย่าง] กิจกรรมเผยแพร่ความรู้ทางการเงินแก่นักศึกษา", "activity"],
    ["[ตัวอย่าง] แจ้งปรับปรุงระบบเว็บไซต์ชั่วคราว", "announcement"],
    ["[ตัวอย่าง] รายงานผลการดำเนินงานประจำไตรมาส", "news"],
    ["[ตัวอย่าง] อบรมเจ้าหน้าที่สถาบันการเงินสมาชิก", "activity"],
    ["[ตัวอย่าง] แลกเปลี่ยนประสบการณ์กับหน่วยงานประกันเงินฝากในภูมิภาค", "international"],
    ["[ตัวอย่าง] ประกาศรายชื่อสถาบันการเงินสมาชิก", "announcement"],
    ["[ตัวอย่าง] ทดสอบแผนจ่ายคืนเงินฝากประจำปี", "news"],
    ["[ตัวอย่าง] คู่มือประชาชน: เงินฝากแบบใดได้รับการคุ้มครอง", "news"],
    ["[ตัวอย่าง] การประชุมคณะกรรมการบริหารสามัญประจำปี", "activity"],
  ];
  const news: News[] = newsTitles.map(([title, category], i) => {
    const month = (i % 10) + 1;
    const published = i % 4 !== 3;
    return {
      id: `news-${i + 1}`,
      title,
      slug: `mock-news-${i + 1}`,
      category,
      excerpt: "ข้อความโปรยตัวอย่างสำหรับทดสอบการแสดงผล ไม่ใช่ข่าวจริง",
      content:
        "เนื้อหาตัวอย่าง (Mock Data) สำหรับทดสอบหน้าจัดการข่าว\n\nสำนักงานปกป้องเงินฝากมีหน้าที่คุ้มครองผู้ฝากเงินและส่งเสริมเสถียรภาพของระบบการเงิน ข้อความนี้ใช้เพื่อการทดสอบเท่านั้น",
      coverImageUrl: MOCK_IMAGE,
      gallery: i % 3 === 0 ? [MOCK_IMAGE, MOCK_IMAGE] : [],
      publishedAt: published ? iso(2026, month, 5 + (i % 20)) : null,
      status: published ? "published" : "draft",
      ...ts(2026, month, 3 + (i % 20)),
    };
  });

  const docs: [string, DocumentCategory, "pdf" | "xlsx"][] = [
    ["[ตัวอย่าง] ดำรัสว่าด้วยการคุ้มครองเงินฝาก", "decree", "pdf"],
    ["[ตัวอย่าง] ข้อตกลงว่าด้วยการจ่ายเงินสมทบ", "agreement", "pdf"],
    ["[ตัวอย่าง] ข้อตกลงว่าด้วยการรายงานข้อมูลผู้ฝาก", "agreement", "pdf"],
    ["[ตัวอย่าง] แจ้งการเรื่องกำหนดส่งรายงานประจำงวด", "notice", "pdf"],
    ["[ตัวอย่าง] แจ้งการเรื่องวันหยุดทำการ", "notice", "pdf"],
    ["[ตัวอย่าง] แบบพิมพ์ขอรับเงินคุ้มครอง", "form", "pdf"],
    ["[ตัวอย่าง] แบบพิมพ์รายงานยอดเงินฝาก", "form", "xlsx"],
    ["[ตัวอย่าง] บทแนะนำการกรอกรายงาน", "guideline", "pdf"],
    ["[ตัวอย่าง] FSNP แผนพัฒนาภาคการเงิน", "fsnp", "pdf"],
    ["[ตัวอย่าง] FSNP ตารางติดตามผล", "fsnp", "xlsx"],
    ["[ตัวอย่าง] ข้อมูลทั่วไปเกี่ยวกับสำนักงาน", "general", "pdf"],
    ["[ตัวอย่าง] สถิติเงินฝากที่ได้รับการคุ้มครอง", "general", "xlsx"],
  ];
  const documents: Document[] = docs.map(([title, category, type], i) => ({
    id: `doc-${i + 1}`,
    title,
    category,
    documentDate: iso(2025 + (i % 2), (i % 12) + 1, 10),
    fileUrl: type === "pdf" ? MOCK_PDF : null,
    fileName: `sample-${i + 1}.${type}`,
    fileType: type,
    fileSize: 120_000 + i * 45_000,
    fileStatus: type === "pdf" ? "available" : i === 6 ? "processing" : "missing",
    status: i === 4 ? "draft" : "published",
    ...ts(2026, (i % 10) + 1, 8),
  }));

  const statuses: InquiryStatus[] = ["new", "new", "in_progress", "resolved", "new", "archived", "resolved", "in_progress", "new"];
  const subjects = [
    "สอบถามวงเงินคุ้มครองเงินฝาก",
    "เงินฝากสกุลต่างประเทศได้รับความคุ้มครองหรือไม่",
    "ขอเอกสารแบบพิมพ์",
    "สอบถามขั้นตอนขอรับเงินคุ้มครอง",
    "แจ้งลิงก์เว็บไซต์เสีย",
    "สอบถามรายชื่อธนาคารสมาชิก",
    "ขอข้อมูลเพื่อทำรายงาน",
    "เสนอแนะการปรับปรุงหน้า FAQ",
    "สอบถามเวลาทำการ",
  ];
  const inquiries: Inquiry[] = subjects.map((subject, i) => ({
    id: `inq-${i + 1}`,
    name: `ผู้ติดต่อตัวอย่าง ${String(i + 1).padStart(2, "0")}`,
    email: `sample${i + 1}@example.com`,
    subject,
    message: `ข้อความตัวอย่าง (Mock Data): ${subject} — ข้อความนี้ไม่ใช่ข้อมูลจริงและไม่มีการส่งอีเมล`,
    source: i % 3 === 2 ? "faq" : "contact",
    status: statuses[i]!,
    ...ts(2026, 10 - (i % 3), 28 - i),
  }));

  const faqPairs = [
    ["เงินฝากประเภทใดได้รับการคุ้มครอง?", "คำตอบตัวอย่าง: เงินฝากออมทรัพย์ ประจำ และกระแสรายวันในสถาบันการเงินสมาชิก"],
    ["วงเงินคุ้มครองต่อรายเท่าไร?", "คำตอบตัวอย่าง: ตามอัตราที่ประกาศ (ข้อมูลทดสอบ)"],
    ["ต้องสมัครเพื่อรับความคุ้มครองหรือไม่?", "คำตอบตัวอย่าง: ไม่ต้องสมัคร ผู้ฝากได้รับความคุ้มครองโดยอัตโนมัติ"],
    ["จะได้รับเงินคืนภายในกี่วัน?", "คำตอบตัวอย่าง: ภายในระยะเวลาที่กฎหมายกำหนด"],
    ["ตรวจสอบรายชื่อสถาบันสมาชิกได้ที่ไหน?", "คำตอบตัวอย่าง: ที่หน้าหน่วยงานเชื่อมต่อของเว็บไซต์"],
    ["ติดต่อสำนักงานได้ช่องทางใด?", "คำตอบตัวอย่าง: ผ่านหน้าติดต่อ หรืออีเมลตัวอย่าง"],
  ];
  const faqs: FAQ[] = faqPairs.map(([question, answer], i) => ({
    id: `faq-${i + 1}`,
    question: question!,
    answer: answer!,
    order: i + 1,
    status: i === 5 ? "draft" : "published",
    ...ts(2026, 6, i + 1),
  }));

  const partners: Partner[] = [
    "ธนาคารตัวอย่าง ก",
    "ธนาคารตัวอย่าง ข",
    "ธนาคารตัวอย่าง ค",
    "สถาบันการเงินตัวอย่าง ง",
    "หน่วยงานกำกับตัวอย่าง",
  ].map((name, i) => ({
    id: `partner-${i + 1}`,
    name,
    logoUrl: MOCK_IMAGE,
    address: "ที่อยู่ตัวอย่าง นครหลวงเวียงจันทน์ (Mock)",
    phone: `+856 21 000 00${i}`,
    email: `partner${i + 1}@example.com`,
    url: `https://example.com/partner-${i + 1}`,
    order: i + 1,
    status: i === 4 ? "draft" : "published",
    ...ts(2026, 3, i + 1),
  }));

  const banners: Banner[] = ["แบนเนอร์ตัวอย่าง: รู้จักการคุ้มครองเงินฝาก", "แบนเนอร์ตัวอย่าง: ข่าวความร่วมมือสากล", "แบนเนอร์ตัวอย่าง: ช่องทางติดต่อ"].map(
    (title, i) => ({
      id: `banner-${i + 1}`,
      title,
      imageUrl: MOCK_IMAGE,
      linkUrl: "https://example.com",
      order: i + 1,
      status: i === 2 ? "draft" : "published",
      ...ts(2026, 9, i + 1),
    }),
  );

  const pages: Page[] = [
    ["เกี่ยวกับสำนักงาน", "about"],
    ["ประวัติความเป็นมา", "history"],
    ["พันธกิจและหน้าที่", "mission"],
    ["โครงสร้างองค์กร", "structure"],
  ].map(([title, slug], i) => ({
    id: `page-${i + 1}`,
    title: title!,
    slug: slug!,
    content: `เนื้อหาตัวอย่าง (Mock Data) สำหรับหน้า "${title}" ใช้เพื่อทดสอบการแก้ไขและแสดงผลเท่านั้น`,
    imageUrl: MOCK_IMAGE,
    status: "published",
    ...ts(2026, 2, i + 1),
  }));

  const media: Media[] = [
    ["sample-image.svg", "image/svg+xml", 1_400, MOCK_IMAGE],
    ["sample-document.pdf", "application/pdf", 600, MOCK_PDF],
  ].map(([fileName, mimeType, size, url], i) => ({
    id: `media-${i + 1}`,
    fileName: `[ตัวอย่าง] ${fileName}`,
    mimeType: mimeType as string,
    size: size as number,
    url: url as string,
    ...ts(2026, 10, i + 1),
  }));

  return {
    news,
    documents,
    inquiries,
    faqs,
    partners,
    banners,
    pages,
    media,
    homeIntro: {
      title: "ยินดีต้อนรับ (ข้อความตัวอย่าง)",
      content: "สำนักงานปกป้องเงินฝากคุ้มครองผู้ฝากเงิน — เนื้อหาตัวอย่างสำหรับทดสอบ",
      imageUrl: MOCK_IMAGE,
      updatedAt: iso(2026, 9, 1),
    },
    settings: {
      email: "contact@example.com",
      phone: "+856 21 000 000",
      address: "ที่อยู่ตัวอย่าง นครหลวงเวียงจันทน์ (Mock)",
      facebookUrl: "https://example.com/facebook",
      youtubeUrl: "https://example.com/youtube",
      mapEmbedUrl: "https://example.com/map",
      footerAudioUrl: null,
      updatedAt: iso(2026, 9, 1),
    },
  };
}
