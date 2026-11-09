import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Eye, Globe2, Maximize2, Minimize2, MousePointer2, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/admin/StateBlock";
import { ChartTable, CountryChart, DeviceChart, PageViewsChart, VisitorTrend, countryName, deviceName } from "@/components/admin/VisitorCharts";
import { visitorService } from "@/lib/api/services";
import type { VisitorFilters, VisitorGroup } from "@/lib/api/types";
import { notify } from "@/lib/notifications";
import excelIcon from "@/assets/icons/microsoft-excel.svg?url";

export const Route = createFileRoute("/visitors")({
  head: () => ({ meta: [{ title: "ຜູ້ເຂົ້າຊົມ — DPO Admin" }, { name: "description", content: "ຕິດຕາມຜູ້ເຂົ້າຊົມ ປະເທດ ແລະສະຖິຕິເວັບໄຊທ໌ DPO" }] }),
  component: VisitorsPage,
});

const DAY = 86400000;
export function localDay(date = new Date()) { return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Vientiane",year:"numeric",month:"2-digit",day:"2-digit"}).format(date); }
export function dayBefore(day: string, days: number) { return new Date(new Date(`${day}T00:00:00Z`).getTime()-days*DAY).toISOString().slice(0,10); }
const num = (value: number) => value.toLocaleString("lo-LA");
const control = "h-10 min-w-0 w-full rounded-[var(--radius-control)] border border-input bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring";

function Panel({ title, children, className = "", action }: { title: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return <section className={`panel min-w-0 p-5 ${className}`}><div className="mb-5 flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-sm font-semibold">{title}</h2></div>{action}</div>{children}</section>;
}
function Change({ value, before, available }: { value: number; before: number; available: boolean }) {
  if (!available || !before) return null;
  const diff = (value-before)/before*100;
  const Icon = diff < 0 ? ArrowDownRight : ArrowUpRight;
  return <span className={`inline-flex items-center gap-1 text-xs ${diff < 0 ? "text-muted-foreground" : "text-healthy"}`} title="ທຽບຊ່ວງກ່ອນ"><Icon className="size-3.5" aria-hidden/>{diff>0?"+":""}{diff.toFixed(1)}%</span>;
}
function RankedRows({ data, total }: { data: VisitorGroup[]; total: number }) {
  if (!data.length) return <Empty/>;
  return <div className="space-y-4">{data.map(row=><div key={row.key}><div className="mb-2 flex items-center justify-between gap-3 text-xs"><span className="min-w-0 truncate" title={row.key}>{row.key === "Direct" ? "ເຂົ້າໂດຍກົງ" : row.key}</span><strong className="num shrink-0 font-semibold">{num(row.views)} <span className="ml-1 font-normal text-muted-foreground">{total ? (row.views/total*100).toFixed(1):0}%</span></strong></div><div className="h-1.5 rounded-full bg-muted" aria-hidden><div className="h-full rounded-full bg-chart-2" style={{width:`${total ? row.views/total*100:0}%`}}/></div></div>)}</div>;
}
function Empty() { return <p className="flex min-h-36 items-center justify-center text-center text-sm text-muted-foreground">ຍັງບໍ່ມີການເຂົ້າຊົມໃນຊ່ວງນີ້</p>; }

function PopularPages({ pages, landingPages, onSelect }: { pages: VisitorGroup[]; landingPages: VisitorGroup[]; onSelect: (path:string)=>void }) {
  const [landing,setLanding]=useState(false);
  const rows=landing?landingPages:pages;
  return <Panel title="ໜ້າທີ່ມີຄົນເຂົ້າຊົມຫຼາຍ" className="xl:col-span-6" action={<div className="flex rounded-md border border-border p-0.5" aria-label="ປະເພດໜ້າເວັບ">{[{value:false,label:"ທຸກໜ້າ"},{value:true,label:"Landing pages"}].map(item=><button key={item.label} type="button" aria-pressed={landing===item.value} onClick={()=>setLanding(item.value)} className={`min-h-8 rounded px-2 text-[10px] font-medium focus-visible:outline-2 focus-visible:outline-ring ${landing===item.value?"bg-primary-soft text-primary":"text-muted-foreground hover:bg-muted"}`}>{item.label}</button>)}</div>}>
    {rows?.length?<><PageViewsChart data={rows} metric={landing?"Sessions":"Page views"}/><details className="mt-3"><summary className="min-h-8 cursor-pointer py-2 text-xs font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring">ເບິ່ງ 10 ອັນດັບ ແລະກອງໜ້າເວັບ</summary>
      <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-border text-muted-foreground"><th className="pb-3 font-medium">ໜ້າເວັບ</th><th className="pb-3 text-right font-medium">Visitors</th><th className="pb-3 pl-4 text-right font-medium">{landing?"Sessions":"Views"}</th></tr></thead><tbody>{rows.map((row,i)=><tr key={row.key} className="border-b border-border last:border-0"><td className="max-w-0 py-3 pr-3"><button type="button" className="block w-full min-w-32 text-left hover:text-primary focus-visible:outline-2 focus-visible:outline-ring" onClick={()=>onSelect(row.key)}><span className="line-clamp-1 font-medium">{i+1}. {row.title||row.key}</span><span className="mt-1 block truncate text-[10px] text-muted-foreground">{row.key}</span></button></td><td className="num py-3 text-right">{num(row.visitors)}</td><td className="num py-3 pl-4 text-right font-semibold">{num(row.views)}</td></tr>)}</tbody></table></div>
    </details></>:<Empty/>}
  </Panel>;
}

export function VisitorsPage() {
  const today = localDay();
  const [filters,setFilters] = useState<VisitorFilters>(()=>({from:dayBefore(today,6),to:today}));
  const [dates,setDates] = useState({from:filters.from,to:filters.to});
  const [page,setPage] = useState(1);
  const [auto,setAuto] = useState(true);
  const [monitor,setMonitor] = useState(false);
  const [exporting,setExporting] = useState(false);
  const [dateError,setDateError] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const report = useQuery({queryKey:["visitors","report",filters],queryFn:()=>visitorService.report(filters),retry:false,refetchInterval:auto?30000:false});
  const events = useQuery({queryKey:["visitors","events",filters,page],queryFn:()=>visitorService.events(filters,page),retry:false,refetchInterval:auto?30000:false});
  const legacy = useQuery({queryKey:["visitors","legacy"],queryFn:visitorService.legacy,retry:false,refetchInterval:auto?30000:false});
  const r = report.data;
  useEffect(()=>{
    const changed=()=>{if (!document.fullscreenElement) setMonitor(false);};
    const escape=(event:KeyboardEvent)=>{if(event.key==="Escape")setMonitor(false);};
    document.addEventListener("fullscreenchange",changed);window.addEventListener("keydown",escape);
    return ()=>{document.removeEventListener("fullscreenchange",changed);window.removeEventListener("keydown",escape);};
  },[]);
  useEffect(()=>{
    if(!monitor)return;
    const previous=document.body.style.overflow;document.body.style.overflow="hidden";
    return ()=>{document.body.style.overflow=previous;};
  },[monitor]);
  function apply(patch: Partial<VisitorFilters>) { setFilters(current=>({...current,...patch}));setPage(1); }
  function preset(days: number) { const next={from:dayBefore(today,days-1),to:today};setDates(next);apply(next);setDateError(""); }
  async function fullscreen() {
    if(monitor){if(document.fullscreenElement)await document.exitFullscreen();setMonitor(false);return;}
    setMonitor(true);
    try { await root.current?.requestFullscreen?.(); } catch { /* The expanded monitor remains usable if native fullscreen is unavailable. */ }
  }
  async function exportWorkbook() {
    setExporting(true);
    try {
      const file=await visitorService.export(filters);
      const url=URL.createObjectURL(file);
      const link=document.createElement("a");link.href=url;link.download=`dpo-visitors-${filters.from}-${filters.to}.xlsx`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(error){if(document.fullscreenElement)await document.exitFullscreen();notify.error(`Export ບໍ່ສຳເລັດ: ${error instanceof Error?error.message:"ກະລຸນາລອງໃໝ່"}`);}finally{setExporting(false);}
  }
  return <div ref={root} data-visitors-monitor className={`min-w-0 space-y-5 bg-background ${monitor?"fixed inset-0 z-40 h-dvh overflow-y-auto p-4 sm:p-6":""}`}>
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-2xl font-semibold tracking-tight">ຜູ້ເຂົ້າຊົມເວັບໄຊທ໌</h1></div>
      <div className="flex flex-wrap items-center gap-2"><Button variant="outline" size="sm" disabled={report.isFetching || events.isFetching} onClick={()=>{void report.refetch();void events.refetch();void legacy.refetch();}}><RefreshCw className={`size-3.5 ${report.isFetching?"animate-spin motion-reduce:animate-none":""}`} aria-hidden/>Refresh</Button><Button variant="outline" size="sm" disabled={exporting || !r?.current.views} onClick={()=>void exportWorkbook()}><img src={excelIcon} alt="" aria-hidden="true" width={16} height={16} className="size-4 shrink-0 object-contain"/>{exporting?"Exporting…":"Export XLSX"}</Button><Button variant="outline" size="sm" aria-pressed={monitor} onClick={()=>void fullscreen()}>{monitor?<Minimize2 className="size-3.5"/>:<Maximize2 className="size-3.5"/>}{monitor?"ອອກເຕັມຈໍ":"ເຕັມຈໍ"}</Button></div>
    </header>

    <section className="panel p-4" aria-label="ຕົວກອງສະຖິຕິ">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"><div className="flex flex-wrap gap-1" aria-label="ເລືອກຊ່ວງເວລາ">{[{days:1,label:"ມື້ນີ້"},{days:7,label:"7 ວັນ"},{days:30,label:"30 ວັນ"},{days:90,label:"90 ວັນ"}].map(item=><button key={item.days} type="button" aria-pressed={filters.from===dayBefore(today,item.days-1)&&filters.to===today} className={`min-h-9 rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring ${filters.from===dayBefore(today,item.days-1)&&filters.to===today?"bg-primary text-primary-foreground":"text-muted-foreground hover:bg-muted"}`} onClick={()=>preset(item.days)}>{item.label}</button>)}</div><label className="flex min-h-9 cursor-pointer items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={auto} onChange={event=>setAuto(event.target.checked)} className="size-4 accent-primary"/><span className={`size-1.5 rounded-full ${auto?"bg-healthy":"bg-muted-foreground"}`} aria-hidden/>{auto?"ອັບເດດທຸກ 30 ວິນາທີ":"ຢຸດອັບເດດອັດຕະໂນມັດ"}</label></div>
      <details className="mt-3"><summary className="min-h-9 cursor-pointer py-2 text-xs font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring">ຕົວກອງ: ວັນທີ · ປະເທດ · ອຸປະກອນ · ໜ້າເວັບ</summary><div className="mt-3 grid min-w-0 gap-3 lg:grid-cols-12">
        <form className="grid min-w-0 grid-cols-2 items-end gap-2 lg:col-span-5" onSubmit={event=>{event.preventDefault();if(dates.from>dates.to||dates.to>today||dates.from<dayBefore(today,89)){setDateError("ເລືອກວັນທີໃນ 90 ວັນຫຼ້າສຸດ ແລະວັນເລີ່ມກ່ອນວັນສິ້ນສຸດ");return;}setDateError("");apply(dates);}}>
          <label className="min-w-0 text-xs text-muted-foreground">ວັນເລີ່ມ<input aria-label="ວັນເລີ່ມ" type="date" required min={dayBefore(today,89)} max={dates.to} value={dates.from} onChange={event=>setDates(current=>({...current,from:event.target.value}))} className={`${control} mt-1.5`}/></label>
          <label className="min-w-0 text-xs text-muted-foreground">ວັນສິ້ນສຸດ<input aria-label="ວັນສິ້ນສຸດ" type="date" required min={dates.from} max={today} value={dates.to} onChange={event=>setDates(current=>({...current,to:event.target.value}))} className={`${control} mt-1.5`}/></label>
          <Button variant="outline" size="sm" type="submit" className="col-span-2 h-8"><CalendarDays className="size-3.5" aria-hidden/>ນຳໃຊ້ວັນທີ</Button>
          {dateError&&<p role="alert" className="col-span-2 text-xs text-destructive">{dateError}</p>}
        </form>
        <label className="min-w-0 text-xs text-muted-foreground lg:col-span-2">ປະເທດ<select aria-label="ປະເທດ" className={`${control} mt-1.5`} value={filters.country||""} onChange={event=>apply({country:event.target.value})}><option value="">ທຸກປະເທດ</option>{r?.countryOptions.map(row=><option value={row.key} key={row.key}>{countryName(row.key)}</option>)}</select></label>
        <label className="min-w-0 text-xs text-muted-foreground lg:col-span-2">ອຸປະກອນ<select aria-label="ອຸປະກອນ" className={`${control} mt-1.5`} value={filters.device||""} onChange={event=>apply({device:event.target.value})}><option value="">ທຸກອຸປະກອນ</option>{["desktop","mobile","tablet","unknown"].map(value=><option key={value} value={value}>{deviceName(value)}</option>)}</select></label>
        <label className="min-w-0 text-xs text-muted-foreground lg:col-span-3">ໜ້າເວັບ<select aria-label="ໜ້າເວັບ" className={`${control} mt-1.5`} value={filters.path||""} onChange={event=>apply({path:event.target.value})}><option value="">ທຸກໜ້າ</option>{r?.pathOptions.map(row=><option key={row.key} value={row.key}>{row.key}</option>)}</select></label>
      </div>
      </details>
      {(filters.country||filters.device||filters.path)&&<div className="mt-3 flex flex-wrap items-center gap-3 text-xs"><span className="text-muted-foreground">{[filters.country?countryName(filters.country):"",filters.device?deviceName(filters.device):"",filters.path].filter(Boolean).join(" · ")}</span><button type="button" onClick={()=>apply({country:"",device:"",path:""})} className="min-h-8 font-medium text-primary underline underline-offset-4">ລ້າງຕົວກອງ</button></div>}
    </section>

    {(report.isLoading||report.error)&&<div className="panel"><QueryState isLoading={report.isLoading} error={report.error} isEmpty={false} onRetry={()=>report.refetch()}/></div>}
    {r&&<>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          {label:"ຜູ້ເຂົ້າຊົມ",value:r.current.visitors,before:r.previous.visitors,icon:Users},
          {label:"Sessions",value:r.current.sessions,before:r.previous.sessions,icon:MousePointer2},
          {label:"Page views",value:r.current.views,before:r.previous.views,icon:Eye},
          {label:"ໜ້າ / Session",value:r.current.sessions?r.current.views/r.current.sessions:0,icon:Activity,decimal:true},
          {label:"ປະເທດ",value:r.countries.filter(row=>row.key!=="ZZ").length,icon:Globe2},
          {label:"Page views ສະສົມ",value:r.allTimeViews,icon:Eye},
        ].map(item=><article key={item.label} className="panel min-w-0 p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-muted-foreground">{item.label}</p><item.icon className="size-4 shrink-0 text-primary/70" aria-hidden/></div><p className="num mt-4 text-3xl font-semibold tracking-tight">{item.decimal?item.value.toFixed(1):num(item.value)}</p>{item.before!==undefined&&item.before>0&&r.previousAvailable&&<div className="mt-3 border-t border-border pt-3"><Change value={item.value} before={item.before} available={r.previousAvailable}/></div>}</article>)}
      </div>

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-12">
        <Panel title="ແນວໂນ້ມການເຂົ້າຊົມ" className="xl:col-span-8"><VisitorTrend report={r}/>{!r.current.views&&<p className="mt-2 text-xs text-muted-foreground">ຍັງບໍ່ມີຂໍ້ມູນໃນຊ່ວງນີ້</p>}</Panel>
        <Panel title="ຜູ້ເຂົ້າຊົມຕາມປະເທດ" className="xl:col-span-4">{r.countries.length?<><CountryChart data={r.countries} onSelect={country=>apply({country})}/><ChartTable headings={["ປະເທດ","ຜູ້ເຂົ້າຊົມ","Sessions","Views","% Views"]} rows={r.countries.map(row=>[countryName(row.key),row.visitors,row.sessions,row.views,`${(row.views/Math.max(r.current.views,1)*100).toFixed(1)}%`])}/></>:<Empty/>}</Panel>

        <PopularPages pages={r.pages} landingPages={r.landingPages} onSelect={path=>apply({path})}/>
        <Panel title="ອຸປະກອນ" className="xl:col-span-3">{r.devices.length?<DeviceChart data={r.devices} onSelect={device=>apply({device})}/>:<Empty/>}</Panel>
        <Panel title="ຊ່ອງທາງເຂົ້າຊົມ" className="xl:col-span-3"><RankedRows data={r.sources} total={r.current.views}/></Panel>
        <Panel title="Browser" className="xl:col-span-6"><RankedRows data={r.browsers} total={r.current.views}/></Panel>
        <Panel title="ລະບົບປະຕິບັດການ" className="xl:col-span-6"><RankedRows data={r.systems} total={r.current.views}/></Panel>
      </div>
      <details className="group"><summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring"><span>ລາຍລະອຽດການເຂົ້າຊົມ <span className="ml-2 text-xs font-normal text-muted-foreground">{events.data?`${num(events.data.total)} ລາຍການ`:""}</span></span><ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden/></summary><div className="mt-3"><Panel title="ການເຂົ້າຊົມຫຼ້າສຸດ" action={<span className="text-xs text-muted-foreground">{events.data?`${num(events.data.total)} ລາຍການ`:""}</span>}>
        {events.isLoading||events.error?<QueryState compact isLoading={events.isLoading} error={events.error} isEmpty={false} onRetry={()=>events.refetch()}/>:events.data?.data.length?<><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-xs"><thead><tr className="border-b border-border text-muted-foreground">{["ເວລາ","ຜູ້ເຂົ້າຊົມ","ປະເທດ","ໜ້າເວັບ","ອຸປະກອນ","Browser / OS","ຊ່ອງທາງ"].map(label=><th key={label} className="px-2 pb-3 font-medium">{label}</th>)}</tr></thead><tbody>{events.data.data.map(row=><tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30"><td className="whitespace-nowrap px-2 py-3">{new Intl.DateTimeFormat("lo-LA",{timeZone:"Asia/Vientiane",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(row.occurredAt))}</td><td className="px-2 py-3 font-mono text-[10px] text-muted-foreground">{row.visitor}</td><td className="px-2 py-3">{countryName(row.country)}</td><td className="max-w-56 px-2 py-3"><button type="button" onClick={()=>apply({path:row.path})} className="block max-w-full truncate text-primary hover:underline" title={row.path}>{row.path}</button></td><td className="px-2 py-3">{deviceName(row.device)}</td><td className="px-2 py-3">{row.browser}<span className="mt-1 block text-[10px] text-muted-foreground">{row.os}</span></td><td className="max-w-40 truncate px-2 py-3" title={row.source}>{row.source}</td></tr>)}</tbody></table></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground"><span>ໜ້າ {events.data.page} / {events.data.totalPages} · 20 ລາຍການຕໍ່ໜ້າ</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={events.data.page<=1} onClick={()=>setPage(Math.max(1,events.data!.page-1))}><ChevronLeft className="size-3.5"/>ກ່ອນໜ້າ</Button><Button variant="outline" size="sm" disabled={events.data.page>=events.data.totalPages} onClick={()=>setPage(events.data!.page+1)}>ຖັດໄປ<ChevronRight className="size-3.5"/></Button></div></div></>:<Empty/>}
      </Panel></div></details>
      <footer className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <p>ອັບເດດ: {new Intl.DateTimeFormat("lo-LA",{timeZone:"Asia/Vientiane",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date(r.generatedAt))} · Asia/Vientiane</p>
        {legacy.data&&<p title="ວິທີນັບແຍກຈາກ Page views">ຍອດ Footer ເດີມ: <strong className="num text-foreground">{num(legacy.data.total)}</strong></p>}
        {r.geoMode==="unconfigured"&&<p>ລະບົບລະບຸປະເທດຍັງບໍ່ໄດ້ຕັ້ງຄ່າ</p>}
      </footer>
      {r.geoSource?.provider.startsWith("DBIP")&&<p className="text-[10px] text-muted-foreground">IP Geolocation by <a href="https://db-ip.com" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">DB-IP</a> · CC BY 4.0 · {new Date(r.geoSource.updatedAt).toISOString().slice(0,7)}</p>}
    </>}
  </div>;
}
