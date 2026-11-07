import { createFileRoute } from "@tanstack/react-router";
import { ResourceList } from "@/components/admin/ResourceList";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/inquiries/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "ข้อความติดต่อ — DPO Admin" },
      { name: "description", content: "ข้อความติดต่อ ในระบบจัดการเว็บไซต์สำนักงานปกป้องเงินฝาก" },
      { property: "og:title", content: "ข้อความติดต่อ — DPO Admin" },
      { property: "og:description", content: "ข้อความติดต่อ ในระบบจัดการเว็บไซต์ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <ResourceList resourceKey="inquiries" search={search} />;
}
