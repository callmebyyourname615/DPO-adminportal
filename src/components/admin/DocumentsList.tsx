import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ExternalLink, File, FileSpreadsheet, FileText, Pencil, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { services } from "@/lib/api/services";
import { formatBytes, formatDate, t } from "@/lib/i18n";
import type { ListSearch } from "@/lib/list-search";
import { documentCategories } from "@/lib/resources";
import { QueryState } from "./StateBlock";
import { StatusBadge } from "./StatusBadge";

const LIMIT = 10;

export function DocumentsList({ search }: { search: ListSearch }) {
  const navigate = useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  useEffect(() => setQ(search.q ?? ""), [search.q]);
  const setSearch = (patch: Partial<ListSearch>) => navigate({ to: ".", search: (prev: ListSearch) => ({ ...prev, ...patch }) } as never);
  const query = useQuery({ queryKey: ["documents", "list", search], queryFn: () => services.documents.list({ page: search.page ?? 1, limit: LIMIT, q: search.q, category: search.category, status: search.status }), retry: false });
  const rows = query.data?.data ?? [];
  const page = query.data?.page ?? search.page ?? 1;
  return <div className="min-w-0 space-y-5 pb-8">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight text-foreground">ຈັດການເອກະສານ</h1><p className="mt-1 text-sm text-muted-foreground">ຄົ້ນຫາ ແລະຈັດການເອກະສານຂອງເວັບໄຊ</p></div><Button asChild className="h-11"><Link to="/documents/$id" params={{id:"new"}}><Plus aria-hidden />ເພີ່ມເອກະສານ</Link></Button></header>
    <section className="panel overflow-hidden" aria-label="ລາຍການເອກະສານ"><div className="border-b border-border px-4 py-4 sm:px-5"><h2 className="font-semibold">ລາຍການເອກະສານ</h2><p className="mt-1 text-xs text-muted-foreground">{query.data ? `${query.data.total.toLocaleString("lo-LA")} ລາຍການ` : "ເອກະສານທັງໝົດ"}</p></div>
      <form role="search" className="grid gap-3 border-b border-border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_200px_160px_auto] sm:px-5" onSubmit={e => { e.preventDefault(); setSearch({q:q.trim() || undefined,page:undefined}); }}>
        <label className="relative min-w-0 sm:col-span-2 lg:col-span-1"><span className="sr-only">ຄົ້ນຫາເອກະສານ</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="ຄົ້ນຫາຊື່ເອກະສານ" className="h-11 bg-surface pl-10" lang="lo" /></label>
        <label><span className="sr-only">ປະເພດເອກະສານ</span><select className="h-11 w-full rounded-md border border-input bg-surface px-3 text-sm" value={search.category ?? ""} onChange={e => setSearch({category:e.target.value || undefined,page:undefined})}><option value="">ທຸກປະເພດ</option>{documentCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
        <label><span className="sr-only">ສະຖານະ</span><select className="h-11 w-full rounded-md border border-input bg-surface px-3 text-sm" value={search.status ?? ""} onChange={e => setSearch({status:e.target.value || undefined,page:undefined})}><option value="">ທຸກສະຖານະ</option><option value="published">ເຜີຍແຜ່ແລ້ວ</option><option value="draft">ຮ່າງ</option></select></label><Button type="submit" variant="secondary" className="h-11">ຄົ້ນຫາ</Button>
      </form>
      {query.isLoading || query.error || !rows.length ? <QueryState isLoading={query.isLoading} error={query.error} isEmpty={!rows.length} onRetry={() => query.refetch()} /> : <>
        <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1fr)_150px_120px_110px_100px] gap-4 border-b border-border bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground lg:grid"><span>ເອກະສານ</span><span>ປະເພດ</span><span>ວັນທີ</span><span>ສະຖານະໄຟລ໌</span><span className="text-right">ຈັດການ</span></div>
        <ul className="divide-y divide-border">{rows.map(item => { const extension = item.fileType || item.fileName?.split(".").pop()?.toLowerCase(); const Icon = extension === "pdf" || extension === "doc" || extension === "docx" ? FileText : extension === "xlsx" ? FileSpreadsheet : File; const tone = extension === "pdf" ? "bg-expired-bg text-expired" : extension === "xlsx" ? "bg-healthy-bg text-healthy" : extension === "doc" || extension === "docx" ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"; const category = documentCategories.find(c => c.value === item.category)?.label ?? item.category; const canOpen = item.fileStatus === "available" && !!item.fileUrl; return <li key={item.id} className="grid min-w-0 gap-3 px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5 lg:grid-cols-[minmax(0,1fr)_150px_120px_110px_100px] lg:items-center lg:gap-4"><div className="flex min-w-0 items-center gap-4"><span className={`grid size-12 shrink-0 place-items-center rounded-lg ${extension === "pdf" || extension === "xlsx" ? "bg-muted/40" : tone}`}>{extension === "pdf" ? <picture><source srcSet="/icons/pdf.svg" type="image/svg+xml" /><img src="/icons/pdf.png" className="size-8 object-contain" alt="" /></picture> : extension === "xlsx" ? <img src="/icons/excel.png" className="size-8 object-contain" alt="" /> : <Icon className="size-5" aria-hidden />}</span><div className="min-w-0"><Link to="/documents/$id" params={{id:item.id}} className="block truncate text-sm font-semibold text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">{item.title}</Link><p className="mt-1 truncate text-xs text-muted-foreground">{extension?.toUpperCase() ?? "ໄຟລ໌"} · {formatBytes(item.fileSize)} <span className="lg:hidden">· {category}</span></p></div></div><div className="hidden truncate text-sm text-foreground lg:block">{category}</div><div className="num hidden text-sm text-foreground lg:block">{formatDate(item.documentDate)}</div><div className="flex items-center justify-between gap-3 lg:contents"><div><StatusBadge status={item.fileStatus} /></div><div className="flex justify-end gap-1">{canOpen && <Button asChild variant="ghost" size="icon" className="size-10 text-muted-foreground hover:text-primary" aria-label={`ເປີດ ${item.title}`}><a href={item.fileUrl!} target="_blank" rel="noreferrer"><ExternalLink aria-hidden /></a></Button>}<Button asChild variant="ghost" size="icon" className="size-10 text-muted-foreground hover:text-primary" aria-label={`ແກ້ໄຂ ${item.title}`}><Link to="/documents/$id" params={{id:item.id}}><Pencil aria-hidden /></Link></Button></div></div></li>; })}</ul>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:px-5"><span className="num">{t("page")} {page} {t("of")} {query.data?.totalPages ?? 1} · {query.data?.total.toLocaleString("lo-LA")} ລາຍການ</span><div className="flex gap-2"><Button type="button" variant="outline" className="h-10" disabled={page <= 1} onClick={() => setSearch({page:page-1 > 1 ? page-1 : undefined})}><ChevronLeft aria-hidden />{t("prev")}</Button><Button type="button" variant="outline" className="h-10" disabled={page >= (query.data?.totalPages ?? 1)} onClick={() => setSearch({page:page+1})}>{t("next")}<ChevronRight aria-hidden /></Button></div></div>
      </>}
    </section>
  </div>;
}
