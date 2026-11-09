import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ContactRound, MapPin, Save, Share2, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { notify } from "@/lib/notifications";
import { FieldInput, validateFields, type Values } from "@/components/admin/FormFields";
import { PageHeader } from "@/components/admin/PageHeader";
import { QueryState } from "@/components/admin/StateBlock";
import { AudioPicker, type AudioOption } from "@/components/admin/AudioPicker";
import { Button } from "@/components/ui/button";
import { canUseData } from "@/lib/api/client";
import { audioOptionsService, settingsService } from "@/lib/api/services";
import { t } from "@/lib/i18n";
import type { FieldDef } from "@/lib/resources";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "ຕັ້ງຄ່າເວັບໄຊທ໌ — DPO Admin" },
      { name: "description", content: "ຂໍ້ມູນຕິດຕໍ່, ສື່ສັງຄົມ, ແຜນທີ່ ແລະໄຟລ໌ສຽງ footer" },
      { property: "og:title", content: "ຕັ້ງຄ່າເວັບໄຊທ໌ — DPO Admin" },
      { property: "og:description", content: "ກໍານົດຂໍ້ມູນ footer ຂອງເວັບໄຊທ໌ DPO" },
    ],
  }),
  component: SettingsPage,
});

const fields: FieldDef[] = [
  { name: "email", label: "ອີເມວ", type: "email", required: true },
  { name: "phone", label: "ເບີໂທລະສັບ", type: "tel", required: true },
  { name: "address", label: "ທີ່ຢູ່", type: "textarea", wide: true, required: true },
  { name: "facebookUrl", label: "Facebook", type: "url" },
  { name: "youtubeUrl", label: "YouTube", type: "url" },
  { name: "mapEmbedUrl", label: "ການເຊື່ອມຕໍ່ແຜນທີ່ (embed)", type: "url", wide: true },
  { name: "footerAudioUrl", label: "ໄຟລ໌ສຽງ 1", type: "text", wide: true },
  { name: "footerAudioUrl2", label: "ໄຟລ໌ສຽງ 2", type: "text", wide: true },
];

export function SettingsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["settings"], queryFn: settingsService.get, retry: false });
  const audio = useQuery({ queryKey: ["media", "audio-options"], queryFn: audioOptionsService.list, retry: false });
  const [v, setV] = useState<Values>({});
  const [audioUploading, setAudioUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (q.data) setV(q.data as unknown as Values);
  }, [q.data]);
  const m = useMutation({
    mutationFn: (d: Values) => settingsService.update(d as never),
    onSuccess: (saved) => { qc.setQueryData(["settings"], saved); notify.success(t("saved")); },
    onError: (e) => notify.error(`ບັນທຶກລົ້ມເຫລວ: ${e.message}`),
  });
  return (
    <div>
      <PageHeader title="ຕັ້ງຄ່າເວັບໄຊທ໌" crumbs={[{ label: "ຕັ້ງຄ່າ" }]} />
      {(q.isLoading || q.error) && (
        <div className="panel mb-4"><QueryState compact isLoading={q.isLoading} error={q.error} isEmpty={false} onRetry={() => q.refetch()} /></div>
      )}
      {!q.isLoading && !q.error && <form className="space-y-4" noValidate onSubmit={(e) => {
        e.preventDefault();
        if (m.isPending || audioUploading || !canUseData()) return;
        const errs = validateFields(fields, v);
        setErrors(errs);
        if (!Object.keys(errs).length) m.mutate(v);
      }}>
        {[
          { title: "ຂໍ້ມູນຕິດຕໍ່", description: "ຂໍ້ມູນສຳລັບການຕິດຕໍ່ອົງການ", icon: ContactRound, names: ["email", "phone", "address"] },
          { title: "ສື່ສັງຄົມ", description: "ລິ້ງໄປຍັງຊ່ອງທາງຂອງອົງການ", icon: Share2, names: ["facebookUrl", "youtubeUrl"] },
          { title: "ແຜນທີ່", description: "ລິ້ງແຜນທີ່ສຳລັບສະແດງໃນເວັບໄຊ", icon: MapPin, names: ["mapEmbedUrl"] },
          { title: "ໄຟລ໌ສຽງ", description: "ເລືອກ ແລະຟັງຕົວຢ່າງສຽງສຳລັບສ່ວນທ້າຍເວັບໄຊ ແລ້ວກົດບັນທຶກເພື່ອນຳໃຊ້", icon: Volume2, names: ["footerAudioUrl", "footerAudioUrl2"] },
        ].map(section => <section className="panel p-5 sm:p-6" key={section.title}>
          <div className="mb-5 flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><section.icon className="size-5" aria-hidden /></span>
            <div><h2 className="font-semibold">{section.title}</h2><p className="mt-1 text-xs text-muted-foreground">{section.description}</p></div>
          </div>
          {section.icon === Volume2 && audio.error && <div className="mb-4"><QueryState compact isLoading={audio.isFetching} error={audio.error} isEmpty={false} onRetry={() => audio.refetch()} /></div>}
          <fieldset disabled={m.isPending || audioUploading} className="grid min-w-0 gap-4 md:grid-cols-2">
            {section.names.map(name => {
              const f = fields.find(field => field.name === name)!;
              return name.startsWith("footerAudioUrl") ? <AudioPicker
                key={name} name={name} label={f.label} value={String(v[name] ?? "")}
                options={audio.data ?? []} loading={audio.isLoading}
                disabled={!canUseData() || m.isPending || audioUploading}
                onUploadingChange={setAudioUploading}
                onUploaded={option => {
                  qc.setQueryData<AudioOption[]>(["media", "audio-options"], previous => [option, ...(previous ?? []).filter(item => item.url !== option.url)]);
                  void qc.invalidateQueries({ queryKey: ["media"] });
                }}
                onChange={url => setV(state => ({ ...state, [name]: url }))}
              /> : <FieldInput key={f.name} field={f} value={v[f.name]} values={v} error={errors[f.name]} onChange={(x) => setV((state) => ({ ...state, [f.name]: x }))} />;
            })}
          </fieldset>
        </section>)}
        <div className="flex justify-end"><Button type="submit" disabled={!canUseData() || m.isPending || audioUploading} title={!canUseData() ? t("saveDisabled") : undefined}><Save className="size-4" aria-hidden /> {m.isPending ? "ກຳລັງບັນທຶກ..." : t("save")}</Button></div>
      </form>}
    </div>
  );
}
