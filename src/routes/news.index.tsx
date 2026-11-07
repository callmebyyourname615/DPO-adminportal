import { createFileRoute } from "@tanstack/react-router";
import { ResourceList } from "@/components/admin/ResourceList";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/news/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "จัดการข่าว — DPO Admin" },
      { name: "description", content: "จัดการข่าว ในระบบจัดการเว็บไซต์สำนักงานปกป้องเงินฝาก" },
      { property: "og:title", content: "จัดการข่าว — DPO Admin" },
      { property: "og:description", content: "จัดการข่าว ในระบบจัดการเว็บไซต์ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <ResourceList resourceKey="news" search={search} />;
}
