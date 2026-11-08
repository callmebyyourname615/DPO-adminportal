import { createFileRoute } from "@tanstack/react-router";
import { ResourceList } from "@/components/admin/ResourceList";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/partners/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "ອົງ​ການ​ເຊື່ອມ​ຕໍ່​ — DPO Admin" },
      { name: "description", content: "ເຊື່ອມຕໍ່ອົງການຢູ່ໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ຂອງຫ້ອງການປົກປ້ອງເງິນຝາກ" },
      { property: "og:title", content: "ອົງ​ການ​ເຊື່ອມ​ຕໍ່​ — DPO Admin" },
      { property: "og:description", content: "ອົງການເຊື່ອມຕໍ່ໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <ResourceList resourceKey="partners" search={search} />;
}
