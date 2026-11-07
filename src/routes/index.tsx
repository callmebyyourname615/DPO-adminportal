import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Inbox, Newspaper, PlugZap } from "lucide-react";
import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/admin/PageHeader";
import { QueryState } from "@/components/admin/StateBlock";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getApiBaseUrl } from "@/lib/api/client";
import { services, statsService } from "@/lib/api/services";
import { formatDate } from "@/lib/i18n";
import { documentCategories } from "@/lib/resources";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "แดชบอร์ด — DPO Admin Portal" },
      { name: "description", content: "ภาพรวมข่าว เอกสาร และข้อความติดต่อของเว็บไซต์สำนักงานปกป้องเงินฝาก" },
      { property: "og:title", content: "แดชบอร์ด — DPO Admin Portal" },
      { property: "og:description", content: "ภาพรวมเนื้อหาเว็บไซต์สำนักงานปกป้องเงินฝาก" },
    ],
  }),
  component: Dashboard,
});

function Metric({ label, value }: { label: string; value: number | undefined }) {
  return (
    <span className="flex items-baseline gap-1.5 text-xs text-muted-foreground">
      {label}:
      <span className="num text-lg font-semibold text-foreground">{value ?? "—"}</span>
    </span>
  );
}

function Section({ icon, title, metrics }: { icon: ReactNode; title: string; metrics: ReactNode }) {
  return (
    <div className="panel flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">{icon}</span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 sm:ml-auto">{metrics}</div>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`panel p-[var(--panel-padding)] ${className}`} aria-label={title}>
      <h3 className="mb-3 text-sm font-medium">{title}</h3>
      {children}
    </section>
  );
}

const axis = { fontSize: 11, fill: "var(--chart-axis)" };

function Dashboard() {
  const stats = useQuery({ queryKey: ["stats"], queryFn: statsService.get, retry: false });
  const news = useQuery({ queryKey: ["news", "recent"], queryFn: () => services.news.list({ limit: 5 }), retry: false });
  const inq = useQuery({ queryKey: ["inquiries", "recent"], queryFn: () => services.inquiries.list({ limit: 5 }), retry: false });
  const s = stats.data;
  const base = getApiBaseUrl();
  const statsState = (empty: boolean) => (
    <QueryState compact isLoading={stats.isLoading} error={stats.error} isEmpty={empty} onRetry={() => stats.refetch()} />
  );

  return (
    <div className="flex flex-col gap-[var(--dashboard-gap)]">
      <PageHeader title="แดชบอร์ด" description="แสดงเฉพาะค่าที่ได้จาก API จริง ไม่มีการคำนวณหรือสร้างตัวเลขสมมติ" />

      <Section
        icon={<Newspaper className="size-4" />}
        title="ข่าว"
        metrics={<><Metric label="ทั้งหมด" value={s?.newsTotal} /><Metric label="เผยแพร่" value={s?.newsPublished} /></>}
      />
      <div className="grid gap-[var(--dashboard-gap)] lg:grid-cols-12">
        <Panel title="ข่าวรายเดือน (เผยแพร่ / ร่าง)" className="lg:col-span-8">
          {s?.newsByMonth?.length ? (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={s.newsByMonth}>
                  <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="month" tick={axis} />
                  <YAxis tick={axis} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="published" name="เผยแพร่" fill="var(--chart-1)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="draft" name="ฉบับร่าง" fill="var(--chart-3)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            statsState(true)
          )}
        </Panel>
        <Panel title="ข่าวล่าสุด" className="lg:col-span-4">
          {news.data?.data.length ? (
            <ul className="divide-y divide-border text-sm">
              {news.data.data.map((n) => (
                <li key={n.id} className="flex items-center justify-between gap-2 py-2">
                  <Link to="/news/$id" params={{ id: n.id }} className="truncate hover:text-primary">{n.title}</Link>
                  <StatusBadge status={n.status} />
                </li>
              ))}
            </ul>
          ) : (
            <QueryState compact isLoading={news.isLoading} error={news.error} isEmpty onRetry={() => news.refetch()} />
          )}
        </Panel>
      </div>

      <Section
        icon={<FileText className="size-4" />}
        title="เอกสารและข้อความติดต่อ"
        metrics={<><Metric label="เอกสาร" value={s?.documentsTotal} /><Metric label="ข้อความใหม่" value={s?.inquiriesNew} /><Metric label="ข้อความทั้งหมด" value={s?.inquiriesTotal} /><Metric label="FAQ เผยแพร่" value={s?.faqsPublished} /></>}
      />
      <div className="grid gap-[var(--dashboard-gap)] lg:grid-cols-12">
        <Panel title="ข้อความติดต่อล่าสุด" className="lg:col-span-7">
          {inq.data?.data.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs text-muted-foreground"><tr><th className="px-2 py-1.5 text-left">วันที่</th><th className="px-2 text-left">ชื่อ</th><th className="px-2 text-left">หัวข้อ</th><th className="px-2 text-left">สถานะ</th></tr></thead>
                <tbody>
                  {inq.data.data.map((m) => (
                    <tr key={m.id} className="border-t border-border">
                      <td className="num px-2 py-2">{formatDate(m.createdAt)}</td>
                      <td className="px-2">{m.name}<div className="text-xs text-muted-foreground">{m.email}</div></td>
                      <td className="px-2"><Link to="/inquiries/$id" params={{ id: m.id }} className="hover:text-primary">{m.subject}</Link></td>
                      <td className="px-2"><StatusBadge status={m.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <QueryState compact isLoading={inq.isLoading} error={inq.error} isEmpty onRetry={() => inq.refetch()} />
          )}
        </Panel>
        <Panel title="เอกสารตามประเภท" className="lg:col-span-5">
          {s?.documentsByCategory?.length ? (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart layout="vertical" data={s.documentsByCategory.map((d) => ({ ...d, label: documentCategories.find((c) => c.value === d.category)?.label ?? d.category }))}>
                  <CartesianGrid stroke="var(--chart-grid)" horizontal={false} />
                  <XAxis type="number" tick={axis} allowDecimals={false} />
                  <YAxis type="category" dataKey="label" tick={axis} width={80} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" name="จำนวนเอกสาร" fill="var(--chart-2)" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            statsState(true)
          )}
        </Panel>
      </div>

      <Section icon={<PlugZap className="size-4" />} title="สถานะการเชื่อมต่อ" metrics={<StatusBadge status={base ? "connected" : "not_connected"} />} />
      <div className="grid gap-[var(--dashboard-gap)] md:grid-cols-3">
        {[
          { label: "สถิติ (/api/admin/stats)", q: stats },
          { label: "ข่าว (/api/admin/news)", q: news },
          { label: "ข้อความติดต่อ (/api/admin/inquiries)", q: inq },
        ].map(({ label, q }) => (
          <Panel key={label} title={label}>
            <p className="text-sm">
              {q.isLoading ? "กำลังตรวจสอบ…" : q.error ? <span className="text-warning">{q.error.message === "API_NOT_CONNECTED" ? "ยังไม่ได้เชื่อมต่อ API" : `ผิดพลาด: ${q.error.message}`}</span> : <span className="text-healthy">ตอบกลับสำเร็จ</span>}
            </p>
          </Panel>
        ))}
      </div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><Inbox className="size-3.5" aria-hidden />Base URL: {base ?? "ยังไม่ได้ตั้งค่า"}</p>
    </div>
  );
}
