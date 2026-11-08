import { createFileRoute } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const Route = createFileRoute("/inquiries/$id")({
  head: () => ({
    meta: [
      { title: "ຂໍ້ຄວາມຕິດຕໍ່ · ລາຍລະອຽດ — DPO Admin" },
      { name: "description", content: "ເພີ່ມ ຫຼືແກ້ໄຂຂໍ້ຄວາມຕິດຕໍ່" },
      { property: "og:title", content: "ຂໍ້ຄວາມຕິດຕໍ່ · ລາຍລະອຽດ — DPO Admin" },
      { property: "og:description", content: "ເພີ່ມ ຫຼືແກ້ໄຂຂໍ້ຄວາມຕິດຕໍ່" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ResourceForm key={id} resourceKey="inquiries" id={id} />;
}
