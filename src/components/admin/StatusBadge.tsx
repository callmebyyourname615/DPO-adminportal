import { cn } from "@/lib/utils";

const map: Record<string, { label: string; cls: string }> = {
  published: { label: "ເຜີຍແຜ່ແລ້ວ", cls: "bg-healthy-bg text-healthy" },
  draft: { label: "ຮ່າງ", cls: "bg-secondary text-secondary-foreground" },
  new: { label: "ໃໝ່", cls: "bg-info-bg text-info" },
  in_progress: { label: "ຢູ່ໃນຄວາມຄືບຫນ້າ", cls: "bg-warning-bg text-warning" },
  resolved: { label: "ປະມວນຜົນແລ້ວ", cls: "bg-healthy-bg text-healthy" },
  archived: { label: "ຮວບຮວມ", cls: "bg-muted text-muted-foreground" },
  available: { label: "ພ້ອມນຳໃຊ້", cls: "bg-healthy-bg text-healthy" },
  processing: { label: "ການປຸງແຕ່ງ", cls: "bg-warning-bg text-warning" },
  missing: { label: "ບໍ່ພົບໄຟລ໌", cls: "bg-expired-bg text-expired" },
  not_connected: { label: "ບໍ່ໄດ້ເຊື່ອມຕໍ່ເທື່ອ", cls: "bg-warning-bg text-warning" },
  connected: { label: "ເຊື່ອມຕໍ່", cls: "bg-healthy-bg text-healthy" },
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
