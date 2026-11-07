import { createFileRoute } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const Route = createFileRoute("/partners/$id")({
  head: () => ({
    meta: [
      { title: "หน่วยงานเชื่อมต่อ · รายละเอียด — DPO Admin" },
      { name: "description", content: "เพิ่มหรือแก้ไข หน่วยงานเชื่อมต่อ" },
      { property: "og:title", content: "หน่วยงานเชื่อมต่อ · รายละเอียด — DPO Admin" },
      { property: "og:description", content: "เพิ่มหรือแก้ไข หน่วยงานเชื่อมต่อ" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ResourceForm key={id} resourceKey="partners" id={id} />;
}
