/* Hallmark · pre-emit critique: P4 H5 E4 S5 R5 V4 · dashboard charts */
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardStats } from "@/lib/api/types";
import { documentCategories } from "@/lib/resources";

type Month = DashboardStats["newsByMonth"][number];
const axis = { fontSize: 11, fill: "var(--chart-axis)" };
const tooltip = { borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 };

function DataTable({ headings, rows }: { headings: string[]; rows: (string | number)[][] }) {
  return <details className="mt-3 text-xs text-muted-foreground"><summary className="cursor-pointer rounded-sm py-2 font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring">ເບິ່ງຂໍ້ມູນຕາຕະລາງ</summary><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{headings.map(h => <th key={h} className="border-b border-border px-2 py-2">{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="border-b border-border">{row.map((cell, j) => <td key={j} className="px-2 py-2">{cell}</td>)}</tr>)}</tbody></table></div></details>;
}

export function NewsTimeline({ data }: { data: Month[] }) {
  const [range, setRange] = useState<"recent" | "all">("recent");
  const visible = range === "recent" ? data.slice(-12) : data;
  return <div><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-2"><i className="size-2.5 rounded-sm bg-chart-1" aria-hidden />ເຜີຍແຜ່</span><span className="flex items-center gap-2"><i className="size-2.5 rounded-sm bg-chart-3" aria-hidden />ຮ່າງ</span></div><div className="flex rounded-md border border-border p-0.5" role="group" aria-label="ໄລຍະເວລາ"><button className={`rounded px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-ring ${range === "recent" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`} aria-pressed={range === "recent"} onClick={() => setRange("recent")}>12 ເດືອນທີ່ມີຂໍ້ມູນ</button><button className={`rounded px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-ring ${range === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`} aria-pressed={range === "all"} onClick={() => setRange("all")}>ທັງໝົດ</button></div></div>
    <div className="h-64 w-full min-w-0" role="img" aria-label="ຈຳນວນຂ່າວເຜີຍແຜ່ ແລະຂ່າວຮ່າງແຍກຕາມເດືອນ"><ResponsiveContainer width="100%" height="100%"><BarChart data={visible} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}><CartesianGrid stroke="var(--chart-grid)" vertical={false} strokeDasharray="3 4" /><XAxis dataKey="month" tick={axis} tickLine={false} axisLine={false} minTickGap={24} /><YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip contentStyle={tooltip} cursor={{fill:"var(--muted)"}} /><Bar dataKey="published" name="ເຜີຍແຜ່" fill="var(--chart-1)" radius={[3,3,0,0]} maxBarSize={22} isAnimationActive={false} /><Bar dataKey="draft" name="ຮ່າງ" fill="var(--chart-3)" radius={[3,3,0,0]} maxBarSize={22} isAnimationActive={false} /></BarChart></ResponsiveContainer></div><DataTable headings={["ເດືອນ", "ເຜີຍແຜ່", "ຮ່າງ"]} rows={visible.map(m => [m.month,m.published,m.draft])} /></div>;
}

export function NewsStatusChart({ total, published }: { total: number; published: number }) {
  const draft = Math.max(0, total - published);
  const data = [{ name: "ເຜີຍແຜ່", value: published, color: "var(--chart-1)" }, { name: "ຮ່າງ", value: draft, color: "var(--chart-3)" }];
  return <div><div className="relative mx-auto h-44 max-w-52" role="img" aria-label={`ຂ່າວທັງໝົດ ${total}, ເຜີຍແຜ່ ${published}, ຮ່າງ ${draft}`}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={57} outerRadius={78} paddingAngle={total ? 3 : 0} stroke="none" isAnimationActive={false}>{data.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={tooltip} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-content-center text-center"><strong className="num text-3xl font-semibold text-foreground">{total.toLocaleString("lo-LA")}</strong><span className="text-xs text-muted-foreground">ຂ່າວທັງໝົດ</span></div></div><div className="mt-2 space-y-3">{data.map(item => <div key={item.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><i className="size-2.5 rounded-full" style={{backgroundColor:item.color}} aria-hidden />{item.name}</span><span className="num font-semibold">{item.value.toLocaleString("lo-LA")}</span></div>)}</div></div>;
}

export function DocumentChart({ data }: { data: DashboardStats["documentsByCategory"] }) {
  const rows = [...data].sort((a,b) => b.count-a.count).map(d => ({ ...d, label: documentCategories.find(c => c.value === d.category)?.label ?? d.category }));
  const max = Math.max(...rows.map(d => d.count), 1);
  return <div className="space-y-4">{rows.map(item => <div key={item.category}><div className="mb-1.5 flex justify-between gap-3 text-sm"><span>{item.label}</span><span className="num font-semibold">{item.count.toLocaleString("lo-LA")}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true"><div className="h-full rounded-full bg-chart-2" style={{width:`${item.count / max * 100}%`}} /></div></div>)}</div>;
}

export function InquiryChart({ total, unread }: { total: number; unread: number }) {
  const other = Math.max(0,total-unread);
  const data = [{name:"ຂໍ້ຄວາມໃໝ່",value:unread,color:"var(--chart-2)"},{name:"ສະຖານະອື່ນ",value:other,color:"var(--chart-3)"}];
  return <div><div className="mb-5 flex h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label={`ຂໍ້ຄວາມໃໝ່ ${unread}, ສະຖານະອື່ນ ${other}`}>
    {total > 0 && data.map(d => <div key={d.name} style={{width:`${d.value/total*100}%`,backgroundColor:d.color}} />)}</div><div className="space-y-3">{data.map(d => <div key={d.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><i className="size-2.5 rounded-sm" style={{backgroundColor:d.color}} aria-hidden />{d.name}</span><span className="num font-semibold">{d.value.toLocaleString("lo-LA")}</span></div>)}</div><p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">ຂໍ້ຄວາມທັງໝົດ <strong className="num ml-1 text-foreground">{total.toLocaleString("lo-LA")}</strong></p></div>;
}
