import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { services } from "@/lib/api/services";
import { isValidEmail } from "@/lib/validation";

/** Mock-only: simulates a visitor submitting the public contact form. Nothing is emailed or sent. */
export function MockInquirySimulator() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ name: "", email: "", subject: "", message: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const m = useMutation({
    mutationFn: () => services.inquiries.create({ ...v, source: "contact", status: "new" }),
    onSuccess: () => {
      toast.success("เพิ่มข้อความจำลองแล้ว (ไม่มีการส่งอีเมล)");
      qc.invalidateQueries({ queryKey: ["inquiries"] });
      setV({ name: "", email: "", subject: "", message: "" });
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const submit = () => {
    const e: Record<string, string> = {};
    if (!v.name.trim()) e["name"] = "จำเป็นต้องกรอก";
    if (!isValidEmail(v.email.trim())) e["email"] = "รูปแบบอีเมลไม่ถูกต้อง";
    if (!v.subject.trim()) e["subject"] = "จำเป็นต้องกรอก";
    if (v.message.trim().length < 5) e["message"] = "อย่างน้อย 5 ตัวอักษร";
    setErr(e);
    if (!Object.keys(e).length) m.mutate();
  };
  const field = (k: keyof typeof v, label: string, multi = false) => (
    <div className={multi ? "md:col-span-2" : ""}>
      <label htmlFor={`sim-${k}`} className="mb-1 block text-sm font-medium">{label}</label>
      {multi ? (
        <Textarea id={`sim-${k}`} rows={3} value={v[k]} aria-invalid={!!err[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
      ) : (
        <Input id={`sim-${k}`} value={v[k]} aria-invalid={!!err[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
      )}
      {err[k] && <p className="mt-1 text-xs text-destructive">{err[k]}</p>}
    </div>
  );
  return (
    <section className="panel mb-4 border-warning/30" aria-label="จำลองข้อความติดต่อ">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <p className="text-sm"><strong>จำลองฟอร์มติดต่อ</strong> <span className="text-muted-foreground">— เพิ่มข้อความตัวอย่างเข้ากล่อง เก็บในหน่วยความจำเท่านั้น</span></p>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "ปิด" : "จำลองข้อความเข้า"}
        </Button>
      </div>
      {open && (
        <form className="grid gap-3 border-t border-border p-4 md:grid-cols-2" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
          {field("name", "ชื่อ")}
          {field("email", "อีเมล")}
          {field("subject", "หัวข้อ")}
          <div />
          {field("message", "ข้อความ", true)}
          <div className="flex justify-end md:col-span-2">
            <Button type="submit" disabled={m.isPending}>{m.isPending ? "กำลังบันทึก…" : "เพิ่มข้อความจำลอง"}</Button>
          </div>
        </form>
      )}
    </section>
  );
}
