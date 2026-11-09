import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, FileText, Inbox, Newspaper, HelpCircle } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { QueryState } from "@/components/admin/StateBlock";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DocumentChart, InquiryChart, NewsStatusChart, NewsTimeline } from "@/components/admin/DashboardCharts";
import { services, statsService } from "@/lib/api/services";
import { formatDate } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "ພາບລວມ — ລະບົບບໍລິຫານ DPO" }, { name: "description", content: "ພາບລວມຂ່າວ ເອກະສານ ແລະຂໍ້ຄວາມຕິດຕໍ່" }] }),
  component: Dashboard,
});

function Panel({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel min-w-0 p-4 sm:p-5 ${className}`}><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 className="text-base font-semibold text-foreground">{title}</h2></div>{action}</div>{children}</section>;
}

function Dashboard() {
  const stats = useQuery({ queryKey: ["stats"], queryFn: statsService.get, retry: false });
  const news = useQuery({ queryKey: ["news", "recent"], queryFn: () => services.news.list({ limit: 5 }), retry: false });
  const inquiries = useQuery({ queryKey: ["inquiries", "recent"], queryFn: () => services.inquiries.list({ limit: 5 }), retry: false });
  const s = stats.data;
  const statsState = <QueryState compact isLoading={stats.isLoading} error={stats.error} isEmpty onRetry={() => stats.refetch()} />;
  const metrics = [
    { label: "ຂ່າວທັງໝົດ", value: s?.newsTotal, icon: Newspaper, to: "/news" as const },
    { label: "ເອກະສານທັງໝົດ", value: s?.documentsTotal, icon: FileText, to: "/documents" as const },
    { label: "ຂໍ້ຄວາມໃໝ່", value: s?.inquiriesNew, icon: Inbox, to: "/inquiries" as const },
    { label: "ຄຳຖາມທີ່ເຜີຍແຜ່", value: s?.faqsPublished, icon: HelpCircle, to: "/faqs" as const },
  ];
  return <div className="min-w-0 space-y-5 pb-8">
    <PageHeader title="ພາບລວມ" />
    {stats.error && <div className="panel"><QueryState compact isLoading={false} error={stats.error} isEmpty={false} onRetry={() => stats.refetch()} /></div>}
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({label,value,icon: Icon,to}) => <Link key={label} to={to} className="panel group min-w-0 p-4 transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-ring sm:p-5"><div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"><Icon className="size-5" aria-hidden /></span><ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></div><p className="mt-4 text-sm text-muted-foreground">{label}</p>{stats.isLoading ? <LoadingSkeleton compact className="!px-0 !py-3" /> : <><p className="num mt-1 text-3xl font-semibold tracking-tight text-foreground">{value == null ? "—" : value.toLocaleString("lo-LA")}</p></>}</Link>)}</div>
    <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-12">
      <Panel title="ຂ່າວຕາມເດືອນ" className="xl:col-span-8">{s?.newsByMonth?.length ? <NewsTimeline data={s.newsByMonth} /> : statsState}</Panel>
      <Panel title="ສະຖານະຂ່າວ" className="xl:col-span-4">{s ? <NewsStatusChart total={s.newsTotal} published={s.newsPublished} /> : statsState}</Panel>
      <Panel title="ເອກະສານຕາມປະເພດ" className="xl:col-span-5">{s?.documentsByCategory?.length ? <DocumentChart data={s.documentsByCategory} /> : statsState}</Panel>
      <Panel title="ຂໍ້ຄວາມຕິດຕໍ່" className="xl:col-span-3">{s ? <InquiryChart total={s.inquiriesTotal} unread={s.inquiriesNew} /> : statsState}</Panel>
      <Panel title="ຂ່າວລ່າສຸດ" action={<Link to="/news" className="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring">ເບິ່ງທັງໝົດ <ArrowUpRight className="size-3.5" aria-hidden /></Link>} className="xl:col-span-4">{news.data?.data.length ? <ul className="divide-y divide-border">{news.data.data.map(n => <li key={n.id} className="flex min-w-0 items-start justify-between gap-3 py-3 first:pt-0"><div className="min-w-0"><Link to="/news/$id" params={{id:n.id}} className="line-clamp-2 text-sm font-medium leading-relaxed hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">{n.title}</Link><p className="mt-1 text-xs text-muted-foreground">{formatDate(n.publishedAt ?? n.createdAt)}</p></div><StatusBadge status={n.status} /></li>)}</ul> : <QueryState compact isLoading={news.isLoading} error={news.error} isEmpty onRetry={() => news.refetch()} />}</Panel>
    </div>
    <Panel title="ຂໍ້ຄວາມຕິດຕໍ່ຫຼ້າສຸດ" action={<Link to="/inquiries" className="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring">ເບິ່ງທັງໝົດ <ArrowUpRight className="size-3.5" aria-hidden /></Link>}>{inquiries.data?.data.length ? <ul className="divide-y divide-border">{inquiries.data.data.map(m => <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="min-w-0"><Link to="/inquiries/$id" params={{id:m.id}} className="break-words text-sm font-medium hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">{m.subject || "ຂໍ້ຄວາມບໍ່ມີຫົວຂໍ້"}</Link><p className="mt-1 text-xs text-muted-foreground">{m.name} · {formatDate(m.createdAt)}</p></div><StatusBadge status={m.status} /></li>)}</ul> : <QueryState compact isLoading={inquiries.isLoading} error={inquiries.error} isEmpty onRetry={() => inquiries.refetch()} />}</Panel>
  </div>;
}
