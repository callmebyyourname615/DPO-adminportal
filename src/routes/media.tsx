import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { QueryState } from "@/components/admin/StateBlock";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { services } from "@/lib/api/services";
import { formatBytes, formatDate } from "@/lib/i18n";
import { validateFile } from "@/lib/validation";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "จัดการไฟล์สื่อ — DPO Admin" },
      { name: "description", content: "รูปภาพ PDF และ XLSX สำหรับเนื้อหาเว็บไซต์ DPO" },
      { property: "og:title", content: "จัดการไฟล์สื่อ — DPO Admin" },
      { property: "og:description", content: "คลังไฟล์สื่อของเว็บไซต์ DPO" },
    ],
  }),
  component: MediaPage,
});

const ACCEPT = ["jpg", "jpeg", "png", "webp", "pdf", "xlsx"];

function MediaPage() {
  const q = useQuery({ queryKey: ["media", "list"], queryFn: () => services.media.list({ limit: 50 }), retry: false });
  const [picked, setPicked] = useState<{ name: string; size: number; error: string | null }[]>([]);
  const rows = q.data?.data ?? [];
  return (
    <div>
      <PageHeader title="จัดการไฟล์สื่อ" crumbs={[{ label: "สื่อ" }]} />
      <section className="panel mb-4 p-4" aria-label="อัปโหลดไฟล์">
        <label htmlFor="media-up" className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-input p-6 text-center hover:bg-muted">
          <Upload className="size-6 text-primary" aria-hidden />
          <span className="font-medium">เลือกไฟล์ (รูป / PDF / XLSX ไม่เกิน 20 MB)</span>
          <span className="text-xs text-muted-foreground">ระบบจะอัปโหลดผ่าน backend หรือ signed upload เมื่อมี API รองรับ</span>
        </label>
        <input id="media-up" type="file" multiple className="sr-only" accept={ACCEPT.map((a) => `.${a}`).join(",")}
          onChange={(e) => setPicked(Array.from(e.target.files ?? []).map((f) => ({ name: f.name, size: f.size, error: validateFile(f, ACCEPT, 20) })))} />
        {picked.map((p) => (
          <div key={p.name} className="mt-3 text-sm">
            <div className="flex justify-between"><span className="truncate">{p.name}</span><span className="num text-muted-foreground">{formatBytes(p.size)}</span></div>
            {p.error ? <p className="text-xs text-destructive">{p.error}</p> : (
              <><Progress value={0} className="mt-1 h-1.5" aria-label="ความคืบหน้า" /><p className="mt-1 text-xs text-warning">ยังอัปโหลดไม่ได้: รอ API อัปโหลดไฟล์</p></>
            )}
          </div>
        ))}
        {picked.length > 0 && <Button className="mt-3" disabled>อัปโหลด</Button>}
      </section>
      <section className="panel" aria-label="รายการไฟล์">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs text-muted-foreground"><tr><th className="px-3 py-2 text-left">ชื่อไฟล์</th><th className="px-3 text-left">ชนิด</th><th className="px-3 text-left">ขนาด</th><th className="px-3 text-left">วันที่</th></tr></thead>
              <tbody>{rows.map((m) => (
                <tr key={m.id} className="border-t border-border"><td className="px-3 py-2"><a href={m.url} target="_blank" rel="noreferrer" className="hover:text-primary">{m.fileName}</a></td><td className="px-3">{m.mimeType}</td><td className="num px-3">{formatBytes(m.size)}</td><td className="px-3">{formatDate(m.createdAt)}</td></tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <QueryState isLoading={q.isLoading} error={q.error} isEmpty onRetry={() => q.refetch()} />
        )}
      </section>
    </div>
  );
}
