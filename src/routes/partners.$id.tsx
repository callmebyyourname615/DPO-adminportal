import { createFileRoute } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const Route = createFileRoute("/partners/$id")({
  head: () => ({
    meta: [
      { title: "ອົງ​ການ​ເຊື່ອມ​ຕໍ່​ · ລາຍລະອຽດ — DPO Admin" },
      { name: "description", content: "ເພີ່ມ ຫຼືແກ້ໄຂຕົວແທນເຊື່ອມຕໍ່" },
      { property: "og:title", content: "ອົງ​ການ​ເຊື່ອມ​ຕໍ່​ · ລາຍລະອຽດ — DPO Admin" },
      { property: "og:description", content: "ເພີ່ມ ຫຼືແກ້ໄຂຕົວແທນເຊື່ອມຕໍ່" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ResourceForm key={id} resourceKey="partners" id={id} />;
}
