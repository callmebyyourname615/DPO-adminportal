import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/PageHeader";
import { StateBlock } from "@/components/admin/StateBlock";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "ผู้ใช้และสิทธิ์ — DPO Admin" },
      { name: "description", content: "สิทธิ์ admin, editor และ viewer ของระบบจัดการเว็บไซต์ DPO" },
      { property: "og:title", content: "ผู้ใช้และสิทธิ์ — DPO Admin" },
      { property: "og:description", content: "การจัดการผู้ใช้ระบบ DPO Admin" },
    ],
  }),
  component: UsersPage,
});

const roles = [
  ["admin", "จัดการทุกส่วน รวมถึงผู้ใช้และตั้งค่า"],
  ["editor", "สร้าง/แก้ไข/เผยแพร่เนื้อหา อ่านข้อความติดต่อ"],
  ["viewer", "อ่านอย่างเดียว"],
];

function UsersPage() {
  return (
    <div>
      <PageHeader title="ผู้ใช้และสิทธิ์" crumbs={[{ label: "ผู้ใช้และสิทธิ์" }]} />
      <div className="panel mb-4">
        <StateBlock kind="not-connected" title="ยังไม่มีระบบยืนยันตัวตนและ admin API" hint="หน้านี้จะจัดการผู้ใช้ได้เมื่อ backend รองรับ auth และตรวจสอบสิทธิ์ฝั่งเซิร์ฟเวอร์ ไม่มีการอนุมัติสิทธิ์จาก frontend" />
      </div>
      <section className="panel p-4" aria-label="บทบาทที่วางแผน">
        <h2 className="mb-2 font-semibold">บทบาทที่วางแผนไว้</h2>
        <ul className="divide-y divide-border text-sm">
          {roles.map(([r, d]) => (
            <li key={r} className="flex gap-4 py-2"><span className="w-20 font-medium">{r}</span><span className="text-muted-foreground">{d}</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
