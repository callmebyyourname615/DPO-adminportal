import { createFileRoute } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const Route = createFileRoute("/pages/$id")({
  head: () => ({
    meta: [
      { title: "ຫນ້າເນື້ອຫາ · ລາຍລະອຽດ — DPO Admin" },
      { name: "description", content: "ເພີ່ມ ຫຼືແກ້ໄຂໜ້າເນື້ອຫາ" },
      { property: "og:title", content: "ຫນ້າເນື້ອຫາ · ລາຍລະອຽດ — DPO Admin" },
      { property: "og:description", content: "ເພີ່ມ ຫຼືແກ້ໄຂໜ້າເນື້ອຫາ" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ResourceForm key={id} resourceKey="pages" id={id} />;
}
