import { createFileRoute } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const Route = createFileRoute("/home/$id")({
  head: () => ({
    meta: [
      { title: "จัดการหน้าแรก · รายละเอียด — DPO Admin" },
      { name: "description", content: "เพิ่มหรือแก้ไข จัดการหน้าแรก" },
      { property: "og:title", content: "จัดการหน้าแรก · รายละเอียด — DPO Admin" },
      { property: "og:description", content: "เพิ่มหรือแก้ไข จัดการหน้าแรก" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ResourceForm key={id} resourceKey="banners" id={id} />;
}
