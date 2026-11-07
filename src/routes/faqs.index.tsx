import { createFileRoute } from "@tanstack/react-router";
import { ResourceList } from "@/components/admin/ResourceList";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/faqs/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "จัดการ FAQ — DPO Admin" },
      { name: "description", content: "จัดการ FAQ ในระบบจัดการเว็บไซต์สำนักงานปกป้องเงินฝาก" },
      { property: "og:title", content: "จัดการ FAQ — DPO Admin" },
      { property: "og:description", content: "จัดการ FAQ ในระบบจัดการเว็บไซต์ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <ResourceList resourceKey="faqs" search={search} />;
}
