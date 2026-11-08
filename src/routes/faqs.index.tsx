import { createFileRoute } from "@tanstack/react-router";
import { ResourceList } from "@/components/admin/ResourceList";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/faqs/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "ຈັດການ FAQ — DPO Admin" },
      { name: "description", content: "ຈັດການ FAQ ໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ຂອງ Deposit Protection Office" },
      { property: "og:title", content: "ຈັດການ FAQ — DPO Admin" },
      { property: "og:description", content: "ຈັດການ FAQ ໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <ResourceList resourceKey="faqs" search={search} />;
}
