import { createFileRoute } from "@tanstack/react-router";
import { ResourceList } from "@/components/admin/ResourceList";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/pages/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "ຫນ້າເນື້ອຫາ — DPO Admin" },
      { name: "description", content: "ຫນ້າເນື້ອຫາຢູ່ໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ຂອງຫ້ອງການປົກປ້ອງເງິນຝາກ" },
      { property: "og:title", content: "ຫນ້າເນື້ອຫາ — DPO Admin" },
      { property: "og:description", content: "ຫນ້າເນື້ອຫາໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <ResourceList resourceKey="pages" search={search} />;
}
