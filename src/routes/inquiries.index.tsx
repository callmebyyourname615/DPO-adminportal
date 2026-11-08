import { createFileRoute } from "@tanstack/react-router";
import { ResourceList } from "@/components/admin/ResourceList";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/inquiries/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "ຂໍ້ຄວາມຕິດຕໍ່ — DPO Admin" },
      { name: "description", content: "ຂໍ້ຄວາມຕິດຕໍ່ໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ຂອງ Deposit Protection Office" },
      { property: "og:title", content: "ຂໍ້ຄວາມຕິດຕໍ່ — DPO Admin" },
      { property: "og:description", content: "ຂໍ້ຄວາມຕິດຕໍ່ໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <ResourceList resourceKey="inquiries" search={search} />;
}
