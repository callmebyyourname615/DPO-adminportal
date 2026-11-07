import { createFileRoute } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const Route = createFileRoute("/inquiries/$id")({
  head: () => ({
    meta: [
      { title: "ข้อความติดต่อ · รายละเอียด — DPO Admin" },
      { name: "description", content: "เพิ่มหรือแก้ไข ข้อความติดต่อ" },
      { property: "og:title", content: "ข้อความติดต่อ · รายละเอียด — DPO Admin" },
      { property: "og:description", content: "เพิ่มหรือแก้ไข ข้อความติดต่อ" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ResourceForm key={id} resourceKey="inquiries" id={id} />;
}
