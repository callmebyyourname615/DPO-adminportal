import { createFileRoute } from "@tanstack/react-router";
import { DocumentsList } from "@/components/admin/DocumentsList";
import { parseListSearch } from "@/lib/list-search";

export const Route = createFileRoute("/documents/")({
  validateSearch: parseListSearch,
  head: () => ({
    meta: [
      { title: "ຈັດການເອກະສານ — DPO Admin" },
      { name: "description", content: "ຈັດການເອກະສານຢູ່ໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ຂອງຫ້ອງການປົກປ້ອງເງິນຝາກ." },
      { property: "og:title", content: "ຈັດການເອກະສານ — DPO Admin" },
      { property: "og:description", content: "ຈັດການເອກະສານໃນລະບົບການຄຸ້ມຄອງເວັບໄຊທ໌ DPO" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <DocumentsList search={search} />;
}
