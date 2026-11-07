import { createFileRoute } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const Route = createFileRoute("/news/$id")({
  head: () => ({
    meta: [
      { title: "จัดการข่าว · รายละเอียด — DPO Admin" },
      { name: "description", content: "เพิ่มหรือแก้ไข จัดการข่าว" },
      { property: "og:title", content: "จัดการข่าว · รายละเอียด — DPO Admin" },
      { property: "og:description", content: "เพิ่มหรือแก้ไข จัดการข่าว" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ResourceForm key={id} resourceKey="news" id={id} />;
}
