import { Area, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";
import type { VisitorReport, VisitorGroup } from "@/lib/api/types";

const axis = { fontSize: 11, fill: "var(--chart-axis)" };
const tooltip = { borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 12 };
const colors = ["var(--chart-1)","var(--chart-2)","var(--chart-4)","var(--chart-3)","var(--chart-5)"];
export const deviceName = (value: string) => ({desktop:"Desktop",mobile:"Mobile",tablet:"Tablet",unknown:"ບໍ່ຮູ້ອຸປະກອນ"}[value] || value);
export function countryName(code: string) {
  if (code === "ZZ") return "ບໍ່ຮູ້ປະເທດ";
  try { return new Intl.DisplayNames(["lo","en"],{type:"region"}).of(code) || code; } catch { return code; }
}
export function ChartTable({ headings, rows }: { headings: string[]; rows: (string | number)[][] }) {
  return <details className="mt-3 text-xs text-muted-foreground"><summary className="min-h-8 cursor-pointer py-2 font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring">ເບິ່ງຂໍ້ມູນຕາຕະລາງ</summary><div className="max-h-64 overflow-auto"><table className="w-full text-left"><thead><tr>{headings.map(h=><th key={h} className="border-b border-border p-2">{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j} className="border-b border-border p-2">{cell}</td>)}</tr>)}</tbody></table></div></details>;
}
export function VisitorTrend({ report }: { report: VisitorReport }) {
  return <><div className="h-72 min-w-0 w-full 2xl:h-80" role="img" aria-label="ກຣາຟຜູ້ເຂົ້າຊົມ Sessions ແລະ Page views">
    <ResponsiveContainer width="100%" height="100%"><ComposedChart data={report.trend} margin={{top:12,right:8,left:-18,bottom:0}} accessibilityLayer>
      <defs><linearGradient id="visitor-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.14}/><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0}/></linearGradient></defs>
      <CartesianGrid stroke="var(--chart-grid)" vertical={false} strokeDasharray="3 4"/>
      <XAxis dataKey="bucket" tick={axis} tickLine={false} axisLine={false} minTickGap={24} tickFormatter={value=>report.hourly ? String(value).slice(11) : String(value).slice(5)}/>
      <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false}/>
      <Tooltip position={{x:8,y:8}} wrapperStyle={{maxWidth:"calc(100% - 16px)",whiteSpace:"normal"}} contentStyle={tooltip}/><Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:11,paddingTop:18}}/>
      <Area type="monotone" dataKey="views" name="Page views" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#visitor-area)" isAnimationActive={false}/>
      <Line type="monotone" dataKey="visitors" name="ຜູ້ເຂົ້າຊົມ" stroke="var(--chart-2)" strokeWidth={2} dot={false} isAnimationActive={false}/>
      <Line type="monotone" dataKey="sessions" name="Sessions" stroke="var(--chart-4)" strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive={false}/>
    </ComposedChart></ResponsiveContainer>
  </div><ChartTable headings={[report.hourly ? "ເວລາ" : "ວັນທີ","Page views","ຜູ້ເຂົ້າຊົມ","Sessions"]} rows={report.trend.map(row=>[row.bucket,row.views,row.visitors,row.sessions])}/></>;
}
export function CountryChart({ data, onSelect }: { data: VisitorGroup[]; onSelect: (code:string)=>void }) {
  const visible = data.slice(0,6).map(row=>({...row,name:countryName(row.key)}));
  return <><div className="h-56 min-w-0 w-full" role="img" aria-label="ປະເທດທີ່ເຂົ້າຊົມຫຼາຍທີ່ສຸດ"><ResponsiveContainer width="100%" height="100%"><BarChart data={visible} layout="vertical" margin={{top:0,right:18,left:-15,bottom:0}} accessibilityLayer>
    <CartesianGrid stroke="var(--chart-grid)" horizontal={false} strokeDasharray="3 4"/><XAxis type="number" tick={axis} tickLine={false} axisLine={false} allowDecimals={false}/><YAxis type="category" dataKey="name" width={105} tick={axis} axisLine={false} tickLine={false}/><Tooltip position={{x:8,y:8}} wrapperStyle={{maxWidth:"calc(100% - 16px)",whiteSpace:"normal"}} contentStyle={tooltip} cursor={{fill:"var(--muted)"}}/>
    <Bar dataKey="views" name="Page views" fill="var(--chart-2)" radius={[0,4,4,0]} maxBarSize={18} isAnimationActive={false}/>
  </BarChart></ResponsiveContainer></div><div className="flex flex-wrap gap-2">{visible.map(row=><button key={row.key} type="button" className="min-h-9 rounded-md border border-border px-2.5 text-xs hover:border-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ring" onClick={()=>onSelect(row.key)}>{row.key} · {row.visitors.toLocaleString("lo-LA")}</button>)}</div></>;
}
export function DeviceChart({ data, onSelect }: { data: VisitorGroup[]; onSelect: (device:string)=>void }) {
  return <><div className="h-44 min-w-0 w-full" role="img" aria-label="ສັດສ່ວນ Page views ຕາມອຸປະກອນ"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="views" nameKey="key" innerRadius={48} outerRadius={72} paddingAngle={3} stroke="none" isAnimationActive={false}>{data.map((row,i)=><Cell key={row.key} fill={colors[i%colors.length]}/>)}</Pie><Tooltip position={{x:8,y:8}} wrapperStyle={{maxWidth:"calc(100% - 16px)",whiteSpace:"normal"}} contentStyle={tooltip}/></PieChart></ResponsiveContainer></div><div className="space-y-1">{data.map((row,i)=><button key={row.key} type="button" onClick={()=>onSelect(row.key)} className="flex min-h-10 w-full items-center justify-between gap-2 rounded-md px-2 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><span className="flex items-center gap-2"><i className="size-2 rounded-full" style={{backgroundColor:colors[i%colors.length]}} aria-hidden/>{deviceName(row.key)}</span><span className="num font-semibold">{row.views.toLocaleString("lo-LA")}</span></button>)}</div></>;
}

export function PageViewsChart({ data, metric = "Page views" }: { data: VisitorGroup[]; metric?: string }) {
  const visible=data.slice(0,6).map(row=>({...row,name:(row.title||row.key).slice(0,25)}));
  return <div className="h-64 min-w-0 w-full" role="img" aria-label="ກຣາຟ Page views ຕາມໜ້າເວັບ"><ResponsiveContainer width="100%" height="100%"><BarChart data={visible} layout="vertical" margin={{top:0,right:12,left:0,bottom:0}} accessibilityLayer>
    <CartesianGrid stroke="var(--chart-grid)" horizontal={false} strokeDasharray="3 4"/><XAxis type="number" tick={axis} tickLine={false} axisLine={false} allowDecimals={false}/><YAxis type="category" dataKey="name" width={140} tick={axis} axisLine={false} tickLine={false}/><Tooltip position={{x:8,y:8}} wrapperStyle={{maxWidth:"calc(100% - 16px)",whiteSpace:"normal"}} contentStyle={tooltip} cursor={{fill:"var(--muted)"}}/>
    <Bar dataKey="views" name={metric} fill="var(--chart-1)" radius={[0,4,4,0]} maxBarSize={18} isAnimationActive={false}/>
  </BarChart></ResponsiveContainer></div>;
}
