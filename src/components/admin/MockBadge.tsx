import { FlaskConical } from "lucide-react";

export function MockBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-warning/40 bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning">
      <FlaskConical className="size-3.5" aria-hidden />
      Mock Data / ข้อมูลตัวอย่าง
    </span>
  );
}
