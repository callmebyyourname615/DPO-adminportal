import { mediaUrl } from "@/lib/api/media";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ImagePlus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { notify } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { canUseData } from "@/lib/api/client";
import { homeIntroService } from "@/lib/api/services";
import { t } from "@/lib/i18n";
import { FieldInput, validateFields, type Values } from "./FormFields";
import type { FieldDef } from "@/lib/resources";
import { QueryState } from "./StateBlock";

const fields: FieldDef[] = [
  { name: "title", label: "ຫົວຂໍ້ແນະນໍາ", type: "text", required: true, wide: true },
  { name: "content", label: "ເນື້ອຫາທີ່ແນະນໍາ", type: "richtext", required: true, wide: true },
  { name: "imageUrl", label: "ຮູບ", type: "image", accept: ["jpg", "jpeg", "png", "webp"], maxMb: 5 },
];

export function HomeIntroPanel() {
  const q = useQuery({ queryKey: ["home-intro"], queryFn: homeIntroService.get, retry: false });
  const [v, setV] = useState<Values>({ title: "", content: "" });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (q.data) setV(q.data as unknown as Values);
  }, [q.data]);
  const m = useMutation({
    mutationFn: (d: Values) => homeIntroService.update(d as never),
    onSuccess: () => notify.success(t("saved")),
    onError: (e) => notify.error(`ບັນທຶກລົ້ມເຫລວ: ${e.message}`),
  });
  return (
    <section className="panel mb-4" aria-labelledby="intro-h">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4"><span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"><ImagePlus className="size-5" aria-hidden /></span><div><h2 id="intro-h" className="font-semibold">ເນື້ອຫາແນະນໍາ</h2><p className="mt-1 text-xs text-muted-foreground">ຂໍ້ຄວາມ ແລະ ຮູບພາບສຳລັບໜ້າທຳອິດ</p></div></div>
      {q.error || q.isLoading ? (
        <QueryState compact isLoading={q.isLoading} error={q.error} isEmpty={false} onRetry={() => q.refetch()} />
      ) : null}
      {!q.isLoading && !q.error && <div className="grid gap-4 p-4 xl:grid-cols-12">
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
            <FieldInput onPreviewChange={setImagePreview} key={f.name} field={f} value={v[f.name]} values={v} error={errors[f.name]} visualMedia onUploadingChange={(_, active) => setUploading(active)} onChange={(x) => setV((s) => ({ ...s, [f.name]: x }))} />
          ))}
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={!canUseData() || m.isPending || uploading}><Save className="size-4" aria-hidden /> {m.isPending ? "ກຳລັງບັນທຶກ..." : t("save")}</Button>
          </div>
        </form>
        <aside className="rounded-md bg-muted p-4 xl:col-span-5" aria-label={t("preview")}>
          <p className="mb-2 text-xs uppercase text-muted-foreground">{t("preview")}</p>
          {imagePreview || v["imageUrl"] ? <img src={imagePreview || mediaUrl(String(v["imageUrl"]))} alt="" className="mb-4 aspect-video w-full rounded-md object-cover" /> : <div className="mb-4 grid aspect-video place-items-center rounded-md bg-background text-muted-foreground"><ImagePlus className="size-7" aria-hidden /></div>}
          <h3 className="text-lg font-semibold">{(v["title"] as string) || "ຫົວຂໍ້ແນະນໍາ"}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm">{(v["content"] as string) || ""}</p>
        </aside>
      </div>}
    </section>
  );
}
