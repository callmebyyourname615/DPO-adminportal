const lo = {
  appName: "ລະບົບບໍລິຫານ DPO",
  appSubtitle: "ຫ້ອງການປົກປ້ອງເງິນຝາກ",
  dashboard: "ພາບລວມ",
  visitors: "ຜູ້ເຂົ້າຊົມ",
  news: "ຂ່າວ",
  documents: "ເອກະສານ",
  inquiries: "ຂໍ້ຄວາມຕິດຕໍ່",
  faqs: "FAQ",
  partners: "ອົງ​ການ​ເຊື່ອມ​ຕໍ່​",
  home: "ໜ້າທຳອິດ",
  pages: "ຫນ້າເນື້ອຫາ",
  media: "ສື່",
  settings: "ຕັ້ງຄ່າ",
  users: "ຜູ້ໃຊ້ແລະການອະນຸຍາດ",
  groupContent: "ເນື້ອໃນ",
  groupCommunication: "ຕິດຕໍ່",
  groupSite: "ເວັບໄຊທ໌",
  groupAdmin: "ຜູ້ບໍລິຫານ",
  search: "ຄົ້ນຫາ",
  add: "ເພີ່ມໃໝ່",
  edit: "ແກ້ໄຂ",
  delete: "ລຶບ",
  save: "ບັນທຶກ",
  cancel: "ຍົກເລີກ",
  back: "ກັບຄືນ",
  preview: "ຕົວຢ່າງ",
  loading: "ກຳລັງໂຫຼດ…",
  empty: "ຍັງບໍ່ມີຂໍ້ມູນເທື່ອ.",
  emptyHint: "ເມື່ອເຊື່ອມຕໍ່ API ຫຼັງຈາກນັ້ນ, ຂໍ້ມູນຈະຖືກສະແດງຢູ່ທີ່ນີ້.",
  notConnected: "ບໍ່ໄດ້ເຊື່ອມຕໍ່ເທື່ອ API",
  notConnectedHint:
    "ຍັງບໍ່ທັນໄດ້ກໍານົດ VITE_DPO_API_BASE_URL ຫຼືສັນຍາຍັງບໍ່ທັນໄດ້ຮັບການຢືນຢັນເທື່ອ API ກັບ backend ສະນັ້ນຍັງບໍ່ສາມາດອ່ານ ຫຼືບັນທຶກຂໍ້ມູນໄດ້.",
  error: "ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ.",
  retry: "ລອງອີກຄັ້ງ",
  saved: "ບັນທຶກສຳເລັດແລ້ວ",
  deleted: "ລຶບສຳເລັດແລ້ວ",
  saveDisabled: "ບໍ່ສາມາດບັນທຶກໄດ້ຈົນກວ່າຈະເຊື່ອມຕໍ່ API",
  confirmDelete: "ຢືນຢັນການລຶບ?",
  confirmDeleteBody: "ການລຶບບໍ່ສາມາດຍົກເລີກໄດ້.",
  confirmUnpublish: "ຢືນຢັນການຍົກເລີກການເຜີຍແຜ່?",
  confirmUnpublishBody: "ເນື້ອຫານີ້ຈະບໍ່ຖືກສະແດງຢູ່ໃນເວັບໄຊທ໌ສາທາລະນະອີກຕໍ່ໄປ.",
  confirm: "ຢືນຢັນ",
  all: "ທັງໝົດ",
  status: "ສະຖານະ",
  actions: "ຈັດການ",
  page: "ໜ້າ",
  of: "ຈາກ",
  prev: "ທີ່ຜ່ານມາ",
  next: "ຕໍ່ໄປ",
  draft: "ຮ່າງ",
  published: "ເຜີຍແຜ່ແລ້ວ",
  connected: "ເຊື່ອມຕໍ່",
  admin: "ຜູ້ດູແລ",
} as const;

export type I18nKey = keyof typeof lo;

export function t(key: I18nKey): string {
  return lo[key];
}

export const LOCALE_TAG = "lo-LA";

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
