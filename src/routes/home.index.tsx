import { createFileRoute } from "@tanstack/react-router";
import { ResourceList } from "@/components/admin/ResourceList";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/home/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "จัดการหน้าแรก — DPO Admin" },
      { name: "description", content: "จัดการหน้าแรก ในระบบจัดการเว็บไซต์สำนักงานปกป้องเงินฝาก" },
      { property: "og:title", content: "จัดการหน้าแรก — DPO Admin" },
      { property: "og:description", content: "จัดการหน้าแรก ในระบบจัดการเว็บไซต์ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <ResourceList resourceKey="banners" search={search} />;
}
