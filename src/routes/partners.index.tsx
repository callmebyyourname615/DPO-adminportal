import { createFileRoute } from "@tanstack/react-router";
import { ResourceList } from "@/components/admin/ResourceList";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/partners/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "หน่วยงานเชื่อมต่อ — DPO Admin" },
      { name: "description", content: "หน่วยงานเชื่อมต่อ ในระบบจัดการเว็บไซต์สำนักงานปกป้องเงินฝาก" },
      { property: "og:title", content: "หน่วยงานเชื่อมต่อ — DPO Admin" },
      { property: "og:description", content: "หน่วยงานเชื่อมต่อ ในระบบจัดการเว็บไซต์ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <ResourceList resourceKey="partners" search={search} />;
}
