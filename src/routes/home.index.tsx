import { createFileRoute } from "@tanstack/react-router";
import { ResourceList } from "@/components/admin/ResourceList";
import { HomeIntroPanel } from "@/components/admin/HomeIntroPanel";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/home/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "ຈັດການຫນ້າທໍາອິດ — DPO Admin" },
      { name: "description", content: "ຈັດການຫນ້າທໍາອິດໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ຂອງ Deposit Protection Office" },
      { property: "og:title", content: "ຈັດການຫນ້າທໍາອິດ — DPO Admin" },
      { property: "og:description", content: "ຈັດການຫນ້າທໍາອິດໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <ResourceList resourceKey="banners" search={search} extra={<HomeIntroPanel />} />;
}
