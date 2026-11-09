import { mediaUrl } from "@/lib/api/media";
/* Hallmark · pre-emit critique: P4 H5 E4 S5 R5 V4 */
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Image as ImageIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/i18n";
import { newsCategories } from "@/lib/resources";
import type { News } from "@/lib/api/types";

export function NewsDetail({ news, onEdit }: { news: News; onEdit: () => void }) {
  const gallery = (news.gallery ?? []).filter(url => url && url !== news.coverImageUrl);
  const category = newsCategories.find(item => item.value === news.category)?.label ?? news.category;
  return <div className="mx-auto min-w-0 max-w-7xl space-y-5 pb-10">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/news" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"><ArrowLeft className="size-4" aria-hidden />ກັບໄປລາຍການຂ່າວ</Link><Button type="button" className="h-11" onClick={onEdit}><Pencil aria-hidden />ແກ້ໄຂຂ່າວ</Button></div>
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <article className="panel min-w-0 overflow-hidden"><div className="px-5 pb-5 pt-6 sm:px-8 sm:pt-8"><div className="flex flex-wrap items-center gap-3"><span className="text-sm font-medium text-primary">{category}</span><StatusBadge status={news.status} /></div><h1 className="mt-4 max-w-4xl break-words text-xl font-semibold leading-relaxed tracking-tight text-foreground sm:text-2xl">{news.title}</h1><div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-4" aria-hidden />{formatDate(news.publishedAt ?? news.createdAt)}</div></div>
        {news.coverImageUrl && <div className="border-y border-border bg-muted"><img src={mediaUrl(news.coverImageUrl)} alt="ຮູບໜ້າປົກຂ່າວ" className="max-h-[480px] w-full object-contain" /></div>}
        <div className="px-5 py-6 sm:px-8 sm:py-8">{news.excerpt && <p className="mb-6 max-w-3xl whitespace-pre-wrap break-words text-base font-medium leading-8 text-foreground">{news.excerpt}</p>}{news.content ? <div className="max-w-3xl whitespace-pre-wrap break-words text-base leading-8 text-foreground">{news.content}</div> : <p className="text-sm text-muted-foreground">ຂ່າວນີ້ບໍ່ມີເນື້ອຫາເປັນຂໍ້ຄວາມ</p>}
          {gallery.length > 0 && <section className="mt-8 border-t border-border pt-6" aria-labelledby="news-gallery"><div className="mb-4 flex items-center gap-2"><ImageIcon className="size-4 text-primary" aria-hidden /><h2 id="news-gallery" className="font-semibold">ຮູບພາບປະກອບ <span className="ml-1 text-sm font-normal text-muted-foreground">{gallery.length}</span></h2></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{gallery.map((url,i) => <a key={`${url}-${i}`} href={mediaUrl(url)} target="_blank" rel="noreferrer" aria-label={`ເປີດຮູບພາບ ${i + 1}`} className="overflow-hidden rounded-md bg-muted focus-visible:outline-2 focus-visible:outline-ring"><img src={mediaUrl(url)} alt={`ຮູບປະກອບຂ່າວ ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" /></a>)}</div></section>}
        </div>
      </article>
      <aside className="panel min-w-0 self-start p-5"><h2 className="font-semibold">ຂໍ້ມູນຂ່າວ</h2><dl className="mt-4 divide-y divide-border text-sm"><div className="py-3 first:pt-0"><dt className="text-xs text-muted-foreground">ສະຖານະ</dt><dd className="mt-2"><StatusBadge status={news.status} /></dd></div><div className="py-3"><dt className="text-xs text-muted-foreground">ໝວດໝູ່</dt><dd className="mt-1 break-words text-foreground">{category}</dd></div><div className="py-3"><dt className="text-xs text-muted-foreground">ວັນທີເຜີຍແຜ່</dt><dd className="num mt-1 text-foreground">{formatDate(news.publishedAt)}</dd></div><div className="py-3"><dt className="text-xs text-muted-foreground">ອັບເດດຫຼ້າສຸດ</dt><dd className="num mt-1 text-foreground">{formatDate(news.updatedAt)}</dd></div><div className="pb-0 pt-3"><dt className="text-xs text-muted-foreground">Slug</dt><dd className="mt-1 break-all text-foreground">{news.slug}</dd></div></dl></aside>
    </div>
  </div>;
}
