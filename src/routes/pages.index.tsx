import { createFileRoute } from "@tanstack/react-router";
import { ResourceList } from "@/components/admin/ResourceList";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/pages/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "หน้าเนื้อหา — DPO Admin" },
      { name: "description", content: "หน้าเนื้อหา ในระบบจัดการเว็บไซต์สำนักงานปกป้องเงินฝาก" },
      { property: "og:title", content: "หน้าเนื้อหา — DPO Admin" },
      { property: "og:description", content: "หน้าเนื้อหา ในระบบจัดการเว็บไซต์ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <ResourceList resourceKey="pages" search={search} />;
}
