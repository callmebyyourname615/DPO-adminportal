import { createFileRoute } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const Route = createFileRoute("/home/$id")({
  head: () => ({
    meta: [
      { title: "ຈັດການຫນ້າທໍາອິດ · ລາຍລະອຽດ — DPO Admin" },
      { name: "description", content: "ເພີ່ມ ຫຼືແກ້ໄຂການຈັດການໜ້າຫຼັກ" },
      { property: "og:title", content: "ຈັດການຫນ້າທໍາອິດ · ລາຍລະອຽດ — DPO Admin" },
      { property: "og:description", content: "ເພີ່ມ ຫຼືແກ້ໄຂການຈັດການໜ້າຫຼັກ" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ResourceForm key={id} resourceKey="banners" id={id} />;
}
