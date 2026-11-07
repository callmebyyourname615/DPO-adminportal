import { createFileRoute } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const Route = createFileRoute("/faqs/$id")({
  head: () => ({
    meta: [
      { title: "จัดการ FAQ · รายละเอียด — DPO Admin" },
      { name: "description", content: "เพิ่มหรือแก้ไข จัดการ FAQ" },
      { property: "og:title", content: "จัดการ FAQ · รายละเอียด — DPO Admin" },
      { property: "og:description", content: "เพิ่มหรือแก้ไข จัดการ FAQ" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ResourceForm key={id} resourceKey="faqs" id={id} />;
}
