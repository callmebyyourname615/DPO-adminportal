import { createFileRoute } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const Route = createFileRoute("/faqs/$id")({
  head: () => ({
    meta: [
      { title: "ຈັດການ FAQ · ລາຍລະອຽດ — DPO Admin" },
      { name: "description", content: "ເພີ່ມ ຫຼືແກ້ໄຂການຈັດການ FAQ" },
      { property: "og:title", content: "ຈັດການ FAQ · ລາຍລະອຽດ — DPO Admin" },
      { property: "og:description", content: "ເພີ່ມ ຫຼືແກ້ໄຂການຈັດການ FAQ" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ResourceForm key={id} resourceKey="faqs" id={id} />;
}
