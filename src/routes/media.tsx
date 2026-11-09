import { mediaUrl } from "@/lib/api/media";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ExternalLink, File, Image, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { QueryState } from "@/components/admin/StateBlock";
import { services, uploadMedia } from "@/lib/api/services";
import { formatBytes, formatDate } from "@/lib/i18n";
import { validateFile } from "@/lib/validation";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "ຈັດການໄຟລ໌ມີເດຍ — DPO Admin" },
      { name: "description", content: "ຮູບ PDF ແລະ XLSX ສໍາລັບເນື້ອຫາເວັບໄຊທ໌ DPO" },
      { property: "og:title", content: "ຈັດການໄຟລ໌ມີເດຍ — DPO Admin" },
      { property: "og:description", content: "ຫໍສະຫມຸດສື່ເວັບໄຊທ໌ DPO" },
    ],
  }),
  component: MediaPage,
});

const ACCEPT = ["jpg", "jpeg", "png", "webp", "pdf", "xlsx"];

function MediaPage() {
  const [page, setPage] = useState(1);
  const q = useQuery({ queryKey: ["media", "list", page], queryFn: () => services.media.list({ page, limit: 20 }), retry: false });
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();
  async function upload(files: File[]) {
    if (!files.length) return;
    const error = files.map(file => validateFile(file, ACCEPT, 20)).find(Boolean);
    if (error) { setMessage(error); return; }
    setUploading(true); setMessage("");
    try {
      for (const file of files) await uploadMedia(file);
      setMessage("ອັບໂຫຼດສຳເລັດ");
      setPage(1);
    } catch (e) { setMessage(`ອັບໂຫຼດບໍ່ສຳເລັດ: ${e instanceof Error ? e.message : ""}`); }
    finally { await qc.invalidateQueries({ queryKey: ["media"] }); setUploading(false); }
  }
  const rows = q.data?.data ?? [];
  return <div>
    <PageHeader title="ຈັດການໄຟລ໌ມີເດຍ" crumbs={[{ label: "ຄັງສື່" }]} />
    <section className="panel mb-4 p-5 sm:p-6" aria-label="ອັບໂຫຼດໄຟລ໌">
      <div className="mb-4"><h2 className="font-semibold">ອັບໂຫຼດໄຟລ໌</h2><p className="mt-1 text-sm text-muted-foreground">ເພີ່ມຮູບພາບ ແລະ ເອກະສານເຂົ້າຄັງສື່</p></div>
      <label htmlFor="media-up" className={`relative flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 p-6 text-center transition-colors focus-within:outline-2 focus-within:outline-ring ${uploading ? "opacity-60" : "cursor-pointer hover:bg-primary-soft"}`}>
        <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"><Upload className="size-5" aria-hidden /></span><span className="text-sm font-medium">{uploading ? "ກຳລັງອັບໂຫຼດ..." : "ເລືອກໄຟລ໌"}</span><span className="text-xs text-muted-foreground">JPG, PNG, WEBP, PDF, XLSX · ສູງສຸດ 20 MB</span>
        <input id="media-up" type="file" multiple disabled={uploading} className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-wait" accept={ACCEPT.map(a => `.${a}`).join(",")} onChange={e => { void upload(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
      </label><p role="status" className="mt-2 text-sm text-muted-foreground">{message}</p>
    </section>
    <section className="panel" aria-label="ບັນຊີລາຍຊື່ໄຟລ໌"><div className="flex items-center gap-3 border-b border-border px-5 py-4"><span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"><Image className="size-5" aria-hidden /></span><div><h2 className="font-semibold">ຄັງສື່</h2><p className="mt-1 text-xs text-muted-foreground">{q.data ? `${q.data.total} ໄຟລ໌` : "ຮູບພາບ ແລະ ເອກະສານ"}</p></div></div>
      {q.isLoading || q.error || !rows.length ? <QueryState isLoading={q.isLoading} error={q.error} isEmpty={!rows.length} onRetry={() => q.refetch()} /> : <><ul className="divide-y divide-border">{rows.map(m => <li key={m.id} className="flex items-center gap-4 px-5 py-4"><span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted">{m.mimeType.startsWith("image/") ? <img src={mediaUrl(m.url)} alt="" loading="lazy" className="size-full object-cover" /> : m.mimeType.includes("pdf") ? <img src={mediaUrl("/api/assets/icons/pdf.svg")} alt="" className="size-9 object-contain" /> : m.fileName.toLowerCase().endsWith(".xlsx") ? <img src={mediaUrl("/api/assets/icons/excel.png")} alt="" className="size-9 object-contain" /> : <File className="size-6 text-muted-foreground" aria-hidden />}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{m.fileName}</p><p className="mt-1 text-xs text-muted-foreground">{formatBytes(m.size)} · {formatDate(m.createdAt)}</p></div><a href={mediaUrl(m.url)} target="_blank" rel="noreferrer" aria-label={`ເປີດ ${m.fileName}`} className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"><ExternalLink className="size-4" aria-hidden /></a></li>)}</ul><div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm text-muted-foreground"><span>ໜ້າ {q.data?.page} / {Math.max(1, q.data?.totalPages ?? 1)}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="size-4" /> ກ່ອນໜ້າ</Button><Button variant="outline" size="sm" disabled={page >= (q.data?.totalPages ?? 1)} onClick={() => setPage(page + 1)}>ຖັດໄປ <ChevronRight className="size-4" /></Button></div></div></>}
    </section>
  </div>;
}
