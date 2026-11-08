import { createFileRoute } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const Route = createFileRoute("/news/$id")({
  head: () => ({
    meta: [
      { title: "ຈັດການຂ່າວ · ລາຍລະອຽດ — DPO Admin" },
      { name: "description", content: "ເພີ່ມ ຫຼືແກ້ໄຂການຈັດການຂ່າວ" },
      { property: "og:title", content: "ຈັດການຂ່າວ · ລາຍລະອຽດ — DPO Admin" },
      { property: "og:description", content: "ເພີ່ມ ຫຼືແກ້ໄຂການຈັດການຂ່າວ" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ResourceForm key={id} resourceKey="news" id={id} />;
}
