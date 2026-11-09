import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VisitorsPage, dayBefore, localDay } from "@/routes/visitors";

const { report, events, legacy, exportWorkbook, error }=vi.hoisted(()=>({report:vi.fn(),events:vi.fn(),legacy:vi.fn(),exportWorkbook:vi.fn(),error:vi.fn()}));
vi.mock("@tanstack/react-router",()=>({createFileRoute:()=> (options:unknown)=>options}));
vi.mock("@/lib/api/services",()=>({visitorService:{report,events,legacy,export:exportWorkbook}}));
vi.mock("@/lib/notifications",()=>({notify:{error}}));
vi.mock("@/components/admin/VisitorCharts",async importOriginal=>{
  const actual=await importOriginal<typeof import("@/components/admin/VisitorCharts")>();
  return {...actual,VisitorTrend:()=> <div role="img" aria-label="Traffic chart"/>,CountryChart:()=> <div role="img" aria-label="Country chart"/>,DeviceChart:()=> <div role="img" aria-label="Device chart"/>,PageViewsChart:()=> <div role="img" aria-label="Page views chart"/>};
});
const counts={views:24,visitors:10,sessions:12};
const row={key:"LA",...counts};
const reportData={from:dayBefore(localDay(),6),to:localDay(),oldest:dayBefore(localDay(),89),hourly:false,timezone:"Asia/Vientiane",generatedAt:new Date().toISOString(),startedAt:new Date().toISOString(),allTimeViews:120,current:counts,previous:{views:12,visitors:5,sessions:6},previousAvailable:true,trend:[],countries:[row],pages:[{...row,key:"/news/",title:"Latest news"}],sources:[{...row,key:"Direct"}],devices:[{...row,key:"desktop"}],browsers:[{...row,key:"Chrome"}],systems:[{...row,key:"Windows"}],countryOptions:[{key:"LA"}],pathOptions:[{key:"/news/"}],geoMode:"geoip"};
function mount(){const client=new QueryClient({defaultOptions:{queries:{retry:false}}});return render(<QueryClientProvider client={client}><VisitorsPage/></QueryClientProvider>);}

describe("visitor monitor",()=>{
  beforeEach(()=>{
    vi.clearAllMocks();report.mockResolvedValue(reportData);events.mockResolvedValue({data:[],total:0,page:1,totalPages:1,limit:20});legacy.mockResolvedValue({today:1,week:2,month:4,total:99});
  });
  it("shows real report metrics, chart panels and a separate legacy total",async()=>{
    mount();
    expect(await screen.findByRole("img",{name:"Traffic chart"})).toBeInTheDocument();
    expect(screen.getByRole("img",{name:"Country chart"})).toBeInTheDocument();
    expect(screen.getByRole("img",{name:"Device chart"})).toBeInTheDocument();
    expect(screen.getByRole("heading",{name:"ໜ້າທີ່ມີຄົນເຂົ້າຊົມຫຼາຍ"})).toBeInTheDocument();
    expect(screen.getByText("99")).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Export XLSX"})).toBeEnabled();
  });
  it("applies country, device, path and preset filters to both report and history",async()=>{
    mount();await screen.findByRole("img",{name:"Traffic chart"});
    fireEvent.change(screen.getByLabelText("ປະເທດ"),{target:{value:"LA"}});
    await waitFor(()=>expect(report).toHaveBeenLastCalledWith(expect.objectContaining({country:"LA"})));
    fireEvent.change(screen.getByLabelText("ອຸປະກອນ"),{target:{value:"desktop"}});
    await waitFor(()=>expect(events).toHaveBeenLastCalledWith(expect.objectContaining({country:"LA",device:"desktop"}),1));
    fireEvent.change(screen.getByLabelText("ໜ້າເວັບ"),{target:{value:"/news/"}});
    await waitFor(()=>expect(report).toHaveBeenLastCalledWith(expect.objectContaining({path:"/news/"})));
    fireEvent.click(screen.getByRole("button",{name:"ມື້ນີ້"}));
    await waitFor(()=>expect(report).toHaveBeenLastCalledWith(expect.objectContaining({from:localDay(),to:localDay()})));
    fireEvent.click(screen.getByRole("button",{name:"ລ້າງຕົວກອງ"}));
    await waitFor(()=>expect(report).toHaveBeenLastCalledWith(expect.objectContaining({country:"",device:"",path:""})));
  });
  it("rejects inverted custom dates and allows pausing updates",async()=>{
    mount();await screen.findByRole("img",{name:"Traffic chart"});
    fireEvent.click(screen.getByText("ຕົວກອງ: ວັນທີ · ປະເທດ · ອຸປະກອນ · ໜ້າເວັບ"));
    const before=report.mock.calls.length;
    fireEvent.change(screen.getByLabelText("ວັນເລີ່ມ"),{target:{value:localDay()}});
    fireEvent.change(screen.getByLabelText("ວັນສິ້ນສຸດ"),{target:{value:dayBefore(localDay(),1)}});
    fireEvent.submit(screen.getByRole("button",{name:"ນຳໃຊ້ວັນທີ"}).closest("form")!);
    expect(screen.getByRole("alert")).toBeInTheDocument();expect(report).toHaveBeenCalledTimes(before);
    const auto=screen.getByRole("checkbox");expect(auto).toBeChecked();fireEvent.click(auto);expect(auto).not.toBeChecked();
  });
  it("preserves the dashboard and shows a container alert when export fails",async()=>{
    exportWorkbook.mockRejectedValueOnce(new Error("Try a shorter date range"));
    mount();await screen.findByRole("img",{name:"Traffic chart"});
    fireEvent.click(screen.getByRole("button",{name:"Export XLSX"}));
    await waitFor(()=>expect(error).toHaveBeenCalledWith(expect.stringContaining("shorter date range")));
    expect(screen.getByRole("button",{name:"Export XLSX"})).toBeEnabled();
    expect(screen.getByRole("img",{name:"Traffic chart"})).toBeInTheDocument();
  });
  it("downloads an XLSX workbook using the current filters",async()=>{
    const file=new Blob(["workbook"],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    exportWorkbook.mockResolvedValueOnce(file);
    let filename="";
    const click=vi.spyOn(HTMLAnchorElement.prototype,"click").mockImplementation(function(this:HTMLAnchorElement){filename=this.download;});
    try{
      mount();await screen.findByRole("img",{name:"Traffic chart"});
      fireEvent.click(screen.getByRole("button",{name:"Export XLSX"}));
      await waitFor(()=>expect(filename).toMatch(/^dpo-visitors-.*\.xlsx$/));
      expect(exportWorkbook).toHaveBeenCalledWith(expect.objectContaining({from:dayBefore(localDay(),6),to:localDay()}));
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    }finally{click.mockRestore();}
  });
  it("supports an expanded monitor and Escape restores the page",async()=>{
    const view=mount();await screen.findByRole("img",{name:"Traffic chart"});
    fireEvent.click(screen.getByRole("button",{name:"ເຕັມຈໍ"}));
    await waitFor(()=>expect(view.container.querySelector('[data-visitors-monitor]')).toHaveClass("fixed"));
    expect(document.body.style.overflow).toBe("hidden");fireEvent.keyDown(window,{key:"Escape"});
    await waitFor(()=>expect(document.body.style.overflow).not.toBe("hidden"));
  });
});
