import { createFileRoute } from "@tanstack/react-router";
import { NewsList } from "@/components/admin/NewsList";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/news/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "ຈັດການຂ່າວ — DPO Admin" },
      { name: "description", content: "ຈັດການຂ່າວໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ຂອງ Deposit Protection Office." },
      { property: "og:title", content: "ຈັດການຂ່າວ — DPO Admin" },
      { property: "og:description", content: "ການຄຸ້ມຄອງຂ່າວໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <NewsList search={search} />;
}
