import { cn } from "@/lib/utils";

const map: Record<string, { label: string; cls: string }> = {
  published: { label: "เผยแพร่แล้ว", cls: "bg-healthy-bg text-healthy" },
  draft: { label: "ฉบับร่าง", cls: "bg-secondary text-secondary-foreground" },
  new: { label: "ใหม่", cls: "bg-info-bg text-info" },
  in_progress: { label: "กำลังดำเนินการ", cls: "bg-warning-bg text-warning" },
  resolved: { label: "ดำเนินการแล้ว", cls: "bg-healthy-bg text-healthy" },
  archived: { label: "เก็บถาวร", cls: "bg-muted text-muted-foreground" },
  available: { label: "พร้อมใช้งาน", cls: "bg-healthy-bg text-healthy" },
  processing: { label: "กำลังประมวลผล", cls: "bg-warning-bg text-warning" },
  missing: { label: "ไม่พบไฟล์", cls: "bg-expired-bg text-expired" },
  not_connected: { label: "ยังไม่เชื่อมต่อ", cls: "bg-warning-bg text-warning" },
  connected: { label: "เชื่อมต่อแล้ว", cls: "bg-healthy-bg text-healthy" },
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const m = (status && map[status]) || { label: status ?? "—", cls: "bg-muted text-muted-foreground" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        m.cls,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  );
}
