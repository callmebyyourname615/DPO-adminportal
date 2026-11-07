import { createFileRoute } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const Route = createFileRoute("/documents/$id")({
  head: () => ({
    meta: [
      { title: "จัดการเอกสาร · รายละเอียด — DPO Admin" },
      { name: "description", content: "เพิ่มหรือแก้ไข จัดการเอกสาร" },
      { property: "og:title", content: "จัดการเอกสาร · รายละเอียด — DPO Admin" },
      { property: "og:description", content: "เพิ่มหรือแก้ไข จัดการเอกสาร" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ResourceForm key={id} resourceKey="documents" id={id} />;
}
