import { createFileRoute } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const Route = createFileRoute("/pages/$id")({
  head: () => ({
    meta: [
      { title: "หน้าเนื้อหา · รายละเอียด — DPO Admin" },
      { name: "description", content: "เพิ่มหรือแก้ไข หน้าเนื้อหา" },
      { property: "og:title", content: "หน้าเนื้อหา · รายละเอียด — DPO Admin" },
      { property: "og:description", content: "เพิ่มหรือแก้ไข หน้าเนื้อหา" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ResourceForm key={id} resourceKey="pages" id={id} />;
}
