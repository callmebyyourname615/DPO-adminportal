import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FieldInput, validateFields, type Values } from "@/components/admin/FormFields";
import { PageHeader } from "@/components/admin/PageHeader";
import { QueryState } from "@/components/admin/StateBlock";
import { Button } from "@/components/ui/button";
import { canUseData } from "@/lib/api/client";
import { settingsService } from "@/lib/api/services";
import { t } from "@/lib/i18n";
import type { FieldDef } from "@/lib/resources";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "ตั้งค่าเว็บไซต์ — DPO Admin" },
      { name: "description", content: "ข้อมูลติดต่อ โซเชียล แผนที่ และไฟล์เสียงของ footer" },
      { property: "og:title", content: "ตั้งค่าเว็บไซต์ — DPO Admin" },
      { property: "og:description", content: "ตั้งค่าข้อมูล footer ของเว็บไซต์ DPO" },
    ],
  }),
  component: SettingsPage,
});

const fields: FieldDef[] = [
  { name: "email", label: "อีเมล", type: "email", required: true },
  { name: "phone", label: "เบอร์โทร", type: "tel", required: true },
  { name: "address", label: "ที่อยู่", type: "textarea", wide: true, required: true },
  { name: "facebookUrl", label: "Facebook", type: "url" },
  { name: "youtubeUrl", label: "YouTube", type: "url" },
  { name: "mapEmbedUrl", label: "ลิงก์แผนที่ (embed)", type: "url", wide: true },
  { name: "footerAudioUrl", label: "ไฟล์เสียง footer", type: "file", accept: ["mp3", "m4a", "ogg"], maxMb: 10, wide: true },
];

function SettingsPage() {
  const q = useQuery({ queryKey: ["settings"], queryFn: settingsService.get, retry: false });
  const [v, setV] = useState<Values>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (q.data) setV(q.data as unknown as Values);
  }, [q.data]);
  const m = useMutation({
    mutationFn: (d: Values) => settingsService.update(d as never),
    onSuccess: () => toast.success(t("saved")),
    onError: (e) => toast.error(`บันทึกไม่สำเร็จ: ${e.message}`),
  });
  return (
    <div>
      <PageHeader title="ตั้งค่าเว็บไซต์" crumbs={[{ label: "ตั้งค่า" }]} />
      {(q.isLoading || q.error) && (
        <div className="panel mb-4"><QueryState compact isLoading={q.isLoading} error={q.error} isEmpty={false} onRetry={() => q.refetch()} /></div>
      )}
      <form className="panel grid gap-4 p-4 md:grid-cols-2" noValidate onSubmit={(e) => {
        e.preventDefault();
        const errs = validateFields(fields, v);
        setErrors(errs);
        if (!Object.keys(errs).length) m.mutate(v);
      }}>
        {fields.map((f) => (
          <FieldInput key={f.name} field={f} value={v[f.name]} values={v} error={errors[f.name]} onChange={(x) => setV((s) => ({ ...s, [f.name]: x }))} />
        ))}
        <div className="flex justify-end border-t border-border pt-4 md:col-span-2">
          <Button type="submit" disabled={!canUseData() || m.isPending} title={!canUseData() ? t("saveDisabled") : undefined}>{t("save")}</Button>
        </div>
      </form>
    </div>
  );
}
