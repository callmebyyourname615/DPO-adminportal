/* Hallmark · pre-emit critique: P4 H5 E4 S5 R5 V4 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Bell, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { services } from "@/lib/api/services";
import { formatDate } from "@/lib/i18n";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const inquiries = useQuery({
    queryKey: ["inquiries", "notifications"],
    queryFn: () => services.inquiries.list({ status: "new", page: 1, limit: 5 }),
    refetchInterval: 60_000,
    retry: false,
  });
  const count = inquiries.data?.total;
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" className="relative size-11 shrink-0 rounded-full text-muted-foreground hover:bg-primary-soft hover:text-primary" aria-label={count === undefined ? "ການແຈ້ງເຕືອນ" : `ການແຈ້ງເຕືອນ, ຂໍ້ຄວາມໃໝ່ ${count}`}>
        <Bell className="size-5" aria-hidden="true" />
        {count !== undefined && count > 0 && <span aria-hidden="true" className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-2 ring-surface">{count > 99 ? "99+" : count}</span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" sideOffset={10} className="w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-xl border-border p-0 shadow-lg" aria-label="ຂໍ້ຄວາມຕິດຕໍ່ໃໝ່">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div><h2 className="text-base font-semibold text-foreground">ການແຈ້ງເຕືອນ</h2><p className="mt-1 text-xs text-muted-foreground">ຂໍ້ຄວາມຕິດຕໍ່ທີ່ມີສະຖານະໃໝ່</p></div>
        {count !== undefined && <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">{count.toLocaleString("lo-LA")} ໃໝ່</span>}
      </div>
      {inquiries.isLoading ? <LoadingSkeleton compact /> : inquiries.error ? <div role="alert" className="space-y-3 px-5 py-6 text-sm text-muted-foreground"><p>ບໍ່ສາມາດໂຫຼດຂໍ້ຄວາມໄດ້</p><Button variant="outline" size="sm" onClick={() => void inquiries.refetch()}>ລອງອີກຄັ້ງ</Button></div> : inquiries.data?.data.length ? <ul className="max-h-80 overflow-y-auto py-1">{inquiries.data.data.map(item => <li key={item.id}><Link to="/inquiries/$id" params={{id:item.id}} onClick={() => setOpen(false)} className="flex min-h-16 items-start gap-3 px-5 py-3 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Inbox className="size-4" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-foreground">{item.subject || "ຂໍ້ຄວາມບໍ່ມີຫົວຂໍ້"}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{item.name} · {formatDate(item.createdAt)}</span></span><span className="mt-2 size-2 shrink-0 rounded-full bg-info" aria-hidden="true" /></Link></li>)}</ul> : <div className="px-5 py-9 text-center"><span className="mx-auto grid size-11 place-items-center rounded-full bg-muted text-muted-foreground"><Inbox className="size-5" aria-hidden="true" /></span><p className="mt-3 text-sm font-medium text-foreground">ຍັງບໍ່ມີຂໍ້ຄວາມໃໝ່</p><p className="mt-1 text-xs text-muted-foreground">ຂໍ້ຄວາມໃໝ່ຈະປາກົດຢູ່ທີ່ນີ້</p></div>}
      <div className="border-t border-border px-5"><Link to="/inquiries" onClick={() => setOpen(false)} className="flex min-h-11 items-center justify-between gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring">ເບິ່ງຂໍ້ຄວາມທັງໝົດ <ArrowUpRight className="size-4" aria-hidden="true" /></Link></div>
    </PopoverContent>
  </Popover>;
}
