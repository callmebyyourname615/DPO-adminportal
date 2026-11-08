/* Hallmark · pre-emit critique: P4 H5 E4 S5 R5 V4 */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ImageOff, Newspaper, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { services, statsService } from "@/lib/api/services";
import type { News } from "@/lib/api/types";
import { formatDate, t } from "@/lib/i18n";
import type { ListSearch } from "@/lib/list-search";
import { newsCategories } from "@/lib/resources";
import { QueryState } from "./StateBlock";
import { StatusBadge } from "./StatusBadge";

const LIMIT = 10;

function NewsImage({ item }: { item: News }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [item.coverImageUrl]);
  return <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted text-muted-foreground sm:size-20">{item.coverImageUrl && !failed ? <img src={item.coverImageUrl} alt="" loading="lazy" onError={() => setFailed(true)} className="size-full object-cover" /> : <ImageOff className="size-5" aria-hidden="true" />}</div>;
}

export function NewsList({ search }: { search: ListSearch }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState(search.q ?? "");
  const [selected, setSelected] = useState<News | null>(null);
  useEffect(() => setQ(search.q ?? ""), [search.q]);
  const setSearch = (patch: Partial<ListSearch>) => navigate({ to: ".", search: (prev: ListSearch) => ({ ...prev, ...patch }) } as never);
  const query = useQuery({ queryKey: ["news", "list", search], queryFn: () => services.news.list({ page: search.page ?? 1, limit: LIMIT, q: search.q, category: search.category, status: search.status }), retry: false });
  const stats = useQuery({ queryKey: ["stats"], queryFn: statsService.get, retry: false });
  const del = useMutation({
    mutationFn: (id: string) => services.news.remove(id),
    onSuccess: async () => {
      setSelected(null);
      await Promise.all([qc.invalidateQueries({ queryKey: ["news"] }), qc.invalidateQueries({ queryKey: ["stats"] })]);
      toast.success(t("deleted"));
    },
    onError: (error) => toast.error(`ລຶບບໍ່ສຳເລັດ: ${error.message}`),
  });
  const rows = query.data?.data ?? [];
  const page = query.data?.page ?? search.page ?? 1;
  const all = stats.data?.newsTotal;
  const published = stats.data?.newsPublished;
  const draft = all !== undefined && published !== undefined ? all - published : undefined;

  return <div className="min-w-0 space-y-5 pb-8">
    <header className="flex flex-wrap items-end justify-between gap-4"><div className="min-w-0"><p className="mb-1 text-xs font-medium text-primary">DPO / ເນື້ອຫາ</p><h1 className="text-2xl font-semibold tracking-tight text-foreground">ຈັດການຂ່າວ</h1><p className="mt-1 text-sm text-muted-foreground">ຄົ້ນຫາ ແກ້ໄຂ ແລະຈັດການຂ່າວຂອງເວັບໄຊ</p></div><Button asChild className="h-11"><Link to="/news/$id" params={{ id: "new" }}><Plus aria-hidden />ເພີ່ມຂ່າວ</Link></Button></header>
    <section aria-label="ພາບລວມຂ່າວ" className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[{label:"ຂ່າວທັງໝົດ",value:all},{label:"ເຜີຍແຜ່ແລ້ວ",value:published},{label:"ສະບັບຮ່າງ",value:draft}].map((stat,i)=><div key={stat.label} className="panel flex items-center gap-3 px-4 py-4"><span className={`grid size-10 shrink-0 place-items-center rounded-lg ${i===0 ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"}`}><Newspaper className="size-5" aria-hidden="true" /></span><div><p className="text-xs text-muted-foreground">{stat.label}</p><p className="num mt-1 text-2xl font-semibold leading-none">{stat.value?.toLocaleString("lo-LA") ?? "—"}</p></div></div>)}</section>
    <section className="panel overflow-hidden" aria-label="ລາຍການຂ່າວ"><div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-4 py-4 sm:px-5"><div><h2 className="font-semibold">ລາຍການຂ່າວ</h2><p className="mt-1 text-xs text-muted-foreground">{query.data ? `${query.data.total.toLocaleString("lo-LA")} ລາຍການ` : "ຈັດການຂ່າວທັງໝົດ"}</p></div></div>
      <form role="search" className="grid gap-3 border-b border-border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_160px_auto] sm:px-5" onSubmit={e => { e.preventDefault(); setSearch({ q: q.trim() || undefined, page: undefined }); }}>
        <label className="relative min-w-0 sm:col-span-2 lg:col-span-1"><span className="sr-only">ຄົ້ນຫາຂ່າວ</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="ຄົ້ນຫາຫົວຂໍ້ຂ່າວ" className="h-11 bg-surface pl-10" lang="lo" /></label>
        <label><span className="sr-only">ປະເພດຂ່າວ</span><select className="h-11 w-full rounded-md border border-input bg-surface px-3 text-sm" value={search.category ?? ""} onChange={e => setSearch({ category: e.target.value || undefined, page: undefined })}><option value="">ທຸກປະເພດ</option>{newsCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
        <label><span className="sr-only">ສະຖານະຂ່າວ</span><select className="h-11 w-full rounded-md border border-input bg-surface px-3 text-sm" value={search.status ?? ""} onChange={e => setSearch({ status: e.target.value || undefined, page: undefined })}><option value="">ທຸກສະຖານະ</option><option value="published">ເຜີຍແຜ່ແລ້ວ</option><option value="draft">ຮ່າງ</option></select></label><Button type="submit" variant="secondary" className="h-11">ຄົ້ນຫາ</Button>
      </form>
      {query.isLoading || query.error || !rows.length ? <QueryState isLoading={query.isLoading} error={query.error} isEmpty={!rows.length} onRetry={() => query.refetch()} /> : <><div aria-hidden="true" className="hidden grid-cols-[minmax(0,1fr)_120px_64px_108px_88px] gap-4 border-b border-border bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground lg:grid"><span>ຂ່າວ</span><span>ອັບເດດຫຼ້າສຸດ</span><span>ຮູບພາບ</span><span>ສະຖານະ</span><span className="text-right">ຈັດການ</span></div><ul className="divide-y divide-border">{rows.map(item => <li key={item.id} className="grid min-w-0 gap-3 px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5 lg:grid-cols-[minmax(0,1fr)_120px_64px_108px_88px] lg:items-center lg:gap-4"><div className="flex min-w-0 items-center gap-4"><NewsImage item={item} /><div className="min-w-0 flex-1"><div className="mb-1.5 flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-primary">{newsCategories.find(c => c.value === item.category)?.label ?? item.category}</span><span className="text-xs text-muted-foreground">· {formatDate(item.publishedAt ?? item.createdAt)}</span></div><Link to="/news/$id" params={{id:item.id}} className="block truncate text-sm font-semibold leading-relaxed text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">{item.title}</Link><p className="mt-1 truncate text-xs text-muted-foreground">{item.excerpt || item.slug}</p></div></div><div className="hidden text-sm text-foreground lg:block"><span className="sr-only">ອັບເດດຫຼ້າສຸດ: </span><span className="num">{formatDate(item.updatedAt)}</span></div><div className="hidden text-sm text-foreground lg:block"><span className="sr-only">ຮູບພາບ: </span><span className="num">{(item.gallery?.length ?? 0) + (item.coverImageUrl ? 1 : 0)}</span></div><div className="flex items-center justify-between gap-3 lg:contents"><div className="min-w-0"><StatusBadge status={item.status} /></div><div className="flex justify-end gap-2"><Button asChild variant="ghost" size="icon" className="size-10 text-muted-foreground hover:text-primary" aria-label={`ແກ້ໄຂ ${item.title}`}><Link to="/news/$id" params={{id:item.id}} hash="edit"><Pencil aria-hidden /></Link></Button><Button type="button" variant="ghost" size="icon" className="size-10 text-muted-foreground hover:bg-expired-bg hover:text-destructive" aria-label={`ລຶບ ${item.title}`} onClick={() => setSelected(item)}><Trash2 aria-hidden /></Button></div></div></li>)}</ul><div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:px-5"><span className="num">{t("page")} {page} {t("of")} {query.data?.totalPages ?? 1} · {query.data?.total.toLocaleString("lo-LA")} ລາຍການ</span><div className="flex gap-2"><Button type="button" variant="outline" className="h-10" disabled={page <= 1} onClick={() => setSearch({ page: page - 1 > 1 ? page - 1 : undefined })}><ChevronLeft aria-hidden />{t("prev")}</Button><Button type="button" variant="outline" className="h-10" disabled={page >= (query.data?.totalPages ?? 1)} onClick={() => setSearch({ page: page + 1 })}>{t("next")}<ChevronRight aria-hidden /></Button></div></div></>}
    </section>
    <AlertDialog open={selected !== null} onOpenChange={open => { if (!open && !del.isPending) setSelected(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>ຢືນຢັນການລຶບຂ່າວ?</AlertDialogTitle><AlertDialogDescription className="break-words">{selected?.title}<br />ການລຶບບໍ່ສາມາດຍ້ອນກັບໄດ້</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={del.isPending}>{t("cancel")}</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={del.isPending} onClick={e => { e.preventDefault(); if (selected) del.mutate(selected.id); }}>{del.isPending ? t("loading") : t("delete")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
