import { createFileRoute } from "@tanstack/react-router";
import { ResourceList } from "@/components/admin/ResourceList";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/documents/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "จัดการเอกสาร — DPO Admin" },
      { name: "description", content: "จัดการเอกสาร ในระบบจัดการเว็บไซต์สำนักงานปกป้องเงินฝาก" },
      { property: "og:title", content: "จัดการเอกสาร — DPO Admin" },
      { property: "og:description", content: "จัดการเอกสาร ในระบบจัดการเว็บไซต์ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <ResourceList resourceKey="documents" search={search} />;
}
