import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isApiConfigured } from "@/lib/api/client";
import { homeIntroService } from "@/lib/api/services";
import { t } from "@/lib/i18n";
import { FieldInput, validateFields, type Values } from "./FormFields";
import type { FieldDef } from "@/lib/resources";
import { QueryState } from "./StateBlock";

const fields: FieldDef[] = [
  { name: "title", label: "หัวข้อแนะนำ", type: "text", required: true, wide: true },
  { name: "content", label: "เนื้อหาแนะนำ", type: "richtext", required: true, wide: true },
  { name: "imageUrl", label: "รูปภาพ", type: "image", accept: ["jpg", "jpeg", "png", "webp"], maxMb: 5 },
];

export function HomeIntroPanel() {
  const q = useQuery({ queryKey: ["home-intro"], queryFn: homeIntroService.get, retry: false });
  const [v, setV] = useState<Values>({ title: "", content: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (q.data) setV(q.data as unknown as Values);
  }, [q.data]);
  const m = useMutation({
    mutationFn: (d: Values) => homeIntroService.update(d as never),
    onSuccess: () => toast.success(t("saved")),
    onError: (e) => toast.error(`บันทึกไม่สำเร็จ: ${e.message}`),
  });
  return (
    <section className="panel mb-4" aria-labelledby="intro-h">
      <h2 id="intro-h" className="border-b border-border px-4 py-3 font-semibold">ส่วนเนื้อหาแนะนำ</h2>
      {q.error || q.isLoading ? (
        <QueryState compact isLoading={q.isLoading} error={q.error} isEmpty={false} onRetry={() => q.refetch()} />
      ) : null}
      <div className="grid gap-4 p-4 xl:grid-cols-12">
        <form
          className="grid gap-4 md:grid-cols-2 xl:col-span-7"
          onSubmit={(e) => {
            e.preventDefault();
            const errs = validateFields(fields, v);
            setErrors(errs);
            if (!Object.keys(errs).length) m.mutate(v);
          }}
        >
          {fields.map((f) => (
            <FieldInput key={f.name} field={f} value={v[f.name]} values={v} error={errors[f.name]} onChange={(x) => setV((s) => ({ ...s, [f.name]: x }))} />
          ))}
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={!isApiConfigured() || m.isPending}>{t("save")}</Button>
          </div>
        </form>
        <aside className="rounded-md bg-muted p-4 xl:col-span-5" aria-label={t("preview")}>
          <p className="mb-2 text-xs uppercase text-muted-foreground">{t("preview")}</p>
          <h3 className="text-lg font-semibold">{(v["title"] as string) || "หัวข้อแนะนำ"}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm">{(v["content"] as string) || ""}</p>
        </aside>
      </div>
    </section>
  );
}
