import { mediaUrl } from "@/lib/api/media";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, ExternalLink, FileText, ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { notify } from "@/lib/notifications";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ApiNotConnectedError, canUseData } from "@/lib/api/client";
import { services, type CrudService } from "@/lib/api/services";
import { formatBytes, formatDate, t } from "@/lib/i18n";
import { documentCategories, newsCategories, resources, type FieldDef } from "@/lib/resources";
import { StatusBadge } from "./StatusBadge";
import { NewsDetail } from "./NewsDetail";
import { PageHeader } from "./PageHeader";
import { QueryState, StateBlock } from "./StateBlock";
import { FieldInput, validateFields, type Values } from "./FormFields";
import { slugify } from "@/lib/validation";
import type { Inquiry } from "@/lib/api/types";
import { InquiryDetail } from "./InquiryDetail";

export function ResourceForm({ resourceKey, id }: { resourceKey: string; id: string }) {
  const def = resources[resourceKey]!;
  const svc = services[def.key] as CrudService<any>;
  const isNew = id === "new";
  const isNews = resourceKey === "news";
  const isDocument = resourceKey === "documents";
  const isNewPartner = resourceKey === "partners" && isNew;
  const isSiteContent = resourceKey === "banners" || (resourceKey === "pages" && isNew);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const connected = canUseData();
  const listTo = def.basePath as "/news";

  const item = useQuery({
    queryKey: [def.key, "item", id],
    queryFn: () => svc.get(id),
    enabled: !isNew,
    retry: false,
  });

  const [editingNews, setEditingNews] = useState(false);
  useEffect(() => { if (isNews && typeof window !== "undefined" && window.location.hash === "#edit") setEditingNews(true); }, [isNews, id]);
  const [values, setValues] = useState<Values>(() => initialValues(def.fields));
  const [uploadingFields, setUploadingFields] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<null | "delete" | "unpublish">(null);

  useEffect(() => {
    if (item.data) setValues({ ...initialValues(def.fields), ...(item.data as Values) });
  }, [item.data, def.fields]);

  const save = useMutation({
    mutationFn: (v: Values) => (isNew ? svc.create(v as never) : svc.update(id, v as never)),
    onSuccess: (res: any) => {
      notify.success(t("saved"));
      qc.invalidateQueries({ queryKey: [def.key] });
      if (isNew && res?.id) navigate({ to: `${def.basePath}/$id` as "/news/$id", params: { id: String(res.id) } });
    },
    onError: (e) => {
      if (def.slugResource && "status" in e && e.status === 409) {
        setErrors(previous => ({ ...previous, slug: "Slug ນີ້ຖືກໃຊ້ແລ້ວ" }));
        document.getElementById("f-slug")?.focus();
      }
      notify.error(e instanceof ApiNotConnectedError ? t("notConnected") : `ບັນທຶກລົ້ມເຫລວ: ${e.message}`);
    },
  });
  const del = useMutation({
    mutationFn: () => svc.remove(id),
    onSuccess: () => {
      notify.success(t("deleted"));
      qc.invalidateQueries({ queryKey: [def.key] });
      navigate({ to: listTo });
    },
    onError: (e) => notify.error(`ລຶບບໍ່ສຳເລັດ: ${e.message}`),
  });

  const submit = (skipConfirm = false) => {
    if (save.isPending || uploadingFields.length) return;
    const prepared = { ...values };
    for (const field of def.fields) {
      if (field.type === "slug" && field.slugFrom) {
        prepared[field.name] = String(values[field.name] ?? "").trim() || slugify(String(values[field.slugFrom] ?? ""));
      }
    }
    setValues(prepared);
    const errs = validateFields(def.fields, prepared);
    setErrors(errs);
    if (Object.keys(errs).length) {
      notify.error("ກະລຸນາກວດເບິ່ງຂໍ້ມູນທີ່ລະບຸ.");
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    const wasPublished = (item.data as Values | undefined)?.["status"] === "published";
    if (!skipConfirm && wasPublished && values["status"] === "draft") return setConfirm("unpublish");
    const payload = Object.fromEntries(def.fields.map((f) => [f.name, prepared[f.name]]));
    if (def.key === "documents") for (const key of ["fileName", "fileType", "fileSize", "fileStatus"]) if (values[key] !== undefined) payload[key] = values[key];
    save.mutate(payload);
  };

  const title = isNew ? `${t("add")}${def.singular}` : `${def.readOnlyDetail ? "" : t("edit")}${def.singular}`;
  const publicUrl = !isNew && def.publicUrl ? def.publicUrl(values) : null;

  const header = isNews && isNew ? (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div><Link to="/news" className="mb-2 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"><ArrowLeft className="size-4" aria-hidden />ກັບໄປລາຍການຂ່າວ</Link><h1 className="text-2xl font-semibold tracking-tight text-foreground">ເພີ່ມຂ່າວໃໝ່</h1><p className="mt-1 text-sm text-muted-foreground">ສ້າງເນື້ອຫາ ເພີ່ມຮູບ ແລະກຳນົດການເຜີຍແຜ່</p></div>
      <StatusBadge status={String(values["status"] || "draft")} />
    </header>
  ) : isDocument ? (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-4"><div className="min-w-0"><Link to="/documents" className="mb-2 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"><ArrowLeft className="size-4" aria-hidden />ກັບໄປລາຍການເອກະສານ</Link><h1 className="break-words text-2xl font-semibold tracking-tight text-foreground">{isNew ? "ເພີ່ມເອກະສານໃໝ່" : "ແກ້ໄຂເອກະສານ"}</h1><p className="mt-1 text-sm text-muted-foreground">ປ້ອນຂໍ້ມູນ ເລືອກໄຟລ໌ ແລະກຳນົດການເຜີຍແຜ່</p></div><div className="flex flex-wrap items-center gap-3"><StatusBadge status={String(values["status"] || "draft")} />{!isNew && <Button type="button" variant="outline" className="text-destructive" onClick={() => setConfirm("delete")} disabled={!connected}><Trash2 className="size-4" aria-hidden />{t("delete")}</Button>}</div></header>
  ) : isNewPartner ? (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><Link to="/partners" className="mb-2 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"><ArrowLeft className="size-4" aria-hidden />ກັບໄປລາຍການອົງການ</Link><h1 className="text-2xl font-semibold tracking-tight text-foreground">ເພີ່ມອົງການໃໝ່</h1><p className="mt-1 text-sm text-muted-foreground">ເພີ່ມຂໍ້ມູນ ໂລໂກ້ ແລະຊ່ອງທາງຕິດຕໍ່</p></div><StatusBadge status={String(values["status"] || "draft")} /></header>
  ) : isSiteContent ? (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0"><Link to={listTo} className="mb-2 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"><ArrowLeft className="size-4" aria-hidden />{resourceKey === "banners" ? "ກັບໄປໜ້າຫຼັກ" : "ກັບໄປລາຍການໜ້າເນື້ອຫາ"}</Link><h1 className="break-words text-2xl font-semibold tracking-tight text-foreground">{resourceKey === "banners" ? (isNew ? "ເພີ່ມແບນເນີໃໝ່" : "ແກ້ໄຂແບນເນີ") : "ເພີ່ມໜ້າເນື້ອຫາໃໝ່"}</h1><p className="mt-1 text-sm text-muted-foreground">ປ້ອນຂໍ້ມູນ ເພີ່ມຮູບພາບ ແລະກຳນົດການເຜີຍແຜ່</p></div>
      <div className="flex items-center gap-3"><StatusBadge status={String(values["status"] || "draft")} />{!isNew && <Button variant="outline" className="text-destructive" onClick={() => setConfirm("delete")} disabled={!connected}><Trash2 className="size-4" aria-hidden /> {t("delete")}</Button>}</div>
    </header>
  ) : (
    <PageHeader
      title={title}
      description={isNews ? "ຈັດການເນື້ອຫາ ຮູບພາບ ແລະການເຜີຍແຜ່ຂ່າວ" : undefined}
      crumbs={[{ label: def.title, to: def.basePath }, { label: isNew ? t("add") : isNews ? t("edit") : String(values["title"] ?? values["question"] ?? values["name"] ?? values["subject"] ?? id) }]}
      actions={
        <>
          {publicUrl && (
            <Button asChild variant="outline">
              <a href={publicUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" /> ໜ້າສາທາລະນະ
              </a>
            </Button>
          )}
          {!isNew && def.canCreate !== false && (
            <Button variant="outline" className="text-destructive" onClick={() => setConfirm("delete")} disabled={!connected}>
              <Trash2 className="size-4" /> {t("delete")}
            </Button>
          )}
        </>
      }
    />
  );

  if (!isNew && (item.isLoading || item.error)) {
    return (
      <div>
        {header}
        <div className="panel">
          <QueryState isLoading={item.isLoading} error={item.error} isEmpty={false} onRetry={() => item.refetch()} />
        </div>
      </div>
    );
  }

  if (resourceKey === "inquiries" && item.data) {
    return <InquiryDetail inquiry={item.data as Inquiry} status={String(values["status"] ?? (item.data as Inquiry).status)} statusField={def.fields[0]!} onStatusChange={status => setValues(previous => ({ ...previous, status }))} onSave={() => submit()} saving={save.isPending} connected={connected} error={errors["status"]} />;
  }

  if (isNews && !isNew && !editingNews && item.data) {
    return <NewsDetail news={item.data} onEdit={() => setEditingNews(true)} />;
  }

  return (
    <div>
      {header}
      {!connected && (
        <div className="panel mb-4 border-warning/30 bg-warning-bg">
          <StateBlock kind="not-connected" compact hint={`${t("notConnectedHint")} — ${t("saveDisabled")}`} />
        </div>
      )}
      <div className="grid gap-[var(--dashboard-gap)] xl:grid-cols-12">
        <form
          className={`panel min-w-0 p-[var(--panel-padding)] ${def.preview || isDocument || isNewPartner ? "xl:col-span-7" : "xl:col-span-12"} ${def.readOnlyDetail ? "xl:col-span-4" : ""}`}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {isNews ? (
            <div className="space-y-8">
              {[
                { title: "ເນື້ອຫາຂ່າວ", description: "ຂໍ້ມູນຫຼັກທີ່ຈະສະແດງໃນເວັບໄຊ", names: ["title", "excerpt", "content"] },
                { title: "ການເຜີຍແຜ່", description: "ກຳນົດທີ່ຢູ່ ໝວດໝູ່ ແລະສະຖານະຂ່າວ", names: ["slug", "category", "publishedAt", "status"] },
                { title: "ຮູບພາບ", description: "ຈັດການຮູບໜ້າປົກ ແລະຮູບປະກອບຂ່າວ", names: ["coverImageUrl", "gallery"] },
              ].map((section, index) => (
                <section key={section.title} className={index ? "border-t border-border pt-6" : ""}>
                  <div className="mb-5"><h2 className="text-base font-semibold text-foreground">{section.title}</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.description}</p></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {section.names.map((name) => {
                      const original = def.fields.find((field) => field.name === name)!;
                      const f: FieldDef = name === "title" ? { ...original, type: "textarea", help: "ຫົວຂໍ້ທີ່ສະແດງໃນລາຍການ ແລະ ໜ້າຂ່າວ" } : name === "excerpt" ? { ...original, label: "ຂໍ້ຄວາມສະຫຼຸບ", help: "ຂໍ້ຄວາມສັ້ນສຳລັບລາຍການຂ່າວ" } : name === "content" ? { ...original, label: "ເນື້ອຫາຂ່າວ", help: "ໃສ່ເນື້ອຫາຂ່າວທັງໝົດ ແລະ ແບ່ງເປັນຫຍໍ້ໜ້າເພື່ອອ່ານງ່າຍ" } : original;
                      return <FieldInput onPreviewChange={preview => setImagePreviews(previous => ({ ...previous, [f.name]: preview }))} key={f.name} field={f} value={values[f.name]} error={errors[f.name]} values={values} newsEditor visualMedia onUploadingChange={(name, uploading) => setUploadingFields((fields) => uploading ? [...fields.filter((item) => item !== name), name] : fields.filter((item) => item !== name))} onChange={(v) => setValues((state) => ({ ...state, [f.name]: v }))} />;
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : isDocument ? (
            <div className="space-y-8">{[
              { title: "ຂໍ້ມູນເອກະສານ", description: "ຊື່ ປະເພດ ແລະວັນທີຂອງເອກະສານ", names: ["title", "category", "documentDate"] },
              { title: "ໄຟລ໌ເອກະສານ", description: "ອັບໂຫຼດໄຟລ໌ທີ່ຕ້ອງການເຜີຍແຜ່", names: ["fileUrl"] },
              { title: "ການເຜີຍແຜ່", description: "ເລືອກສະຖານະກ່ອນບັນທຶກ", names: ["status"] },
            ].map((section,index) => <section key={section.title} className={index ? "border-t border-border pt-6" : ""}><div className="mb-5"><h2 className="text-base font-semibold text-foreground">{section.title}</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.description}</p></div><div className="grid gap-4 md:grid-cols-2">{section.names.map(name => { const f = def.fields.find(field => field.name === name)!; return <FieldInput onPreviewChange={preview => setImagePreviews(previous => ({ ...previous, [f.name]: preview }))} key={f.name} field={f} value={values[f.name]} error={errors[f.name]} values={values} visualDocument onUploadingChange={(field, uploading) => setUploadingFields(fields => uploading ? [...fields.filter(item => item !== field), field] : fields.filter(item => item !== field))} onChange={(v, media) => setValues(state => ({ ...state, [f.name]: v, ...(media ? { fileName: media.fileName, fileType: media.fileName.toLowerCase().endsWith(".xlsx") ? "xlsx" : "pdf", fileSize: media.size, fileStatus: "available" } : {}) }))} />; })}</div></section>)}</div>
          ) : isNewPartner ? (
            <div className="space-y-8">{[
              { title: "ຂໍ້ມູນອົງການ", description: "ຊື່ ເວັບໄຊ ແລະໂລໂກ້ຂອງອົງການ", names: ["name", "url", "logoUrl"] },
              { title: "ຂໍ້ມູນຕິດຕໍ່", description: "ທີ່ຢູ່ ແລະຊ່ອງທາງຕິດຕໍ່", names: ["address", "phone", "email"] },
              { title: "ການສະແດງ", description: "ກຳນົດລຳດັບ ແລະສະຖານະການເຜີຍແຜ່", names: ["order", "status"] },
            ].map((section,index) => <section key={section.title} className={index ? "border-t border-border pt-6" : ""}><div className="mb-5"><h2 className="text-base font-semibold text-foreground">{section.title}</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.description}</p></div><div className="grid gap-4 md:grid-cols-2">{section.names.map(name => { const f = def.fields.find(field => field.name === name)!; return <FieldInput onPreviewChange={preview => setImagePreviews(previous => ({ ...previous, [f.name]: preview }))} key={f.name} field={f} value={values[f.name]} error={errors[f.name]} values={values} visualMedia onUploadingChange={(field, uploading) => setUploadingFields(fields => uploading ? [...fields.filter(item => item !== field), field] : fields.filter(item => item !== field))} onChange={value => setValues(state => ({ ...state, [f.name]: value }))} />; })}</div></section>)}</div>
          ) : isSiteContent ? (
            <div className="space-y-8">{(resourceKey === "banners" ? [
              { title: "ຂໍ້ມູນແບນເນີ", description: "ຊື່ ແລະລິ້ງປາຍທາງ", names: ["title", "linkUrl"] },
              { title: "ຮູບພາບ", description: "ເລືອກຮູບສຳລັບແບນເນີ", names: ["imageUrl"] },
              { title: "ການສະແດງ", description: "ກຳນົດລຳດັບ ແລະສະຖານະ", names: ["order", "status"] },
            ] : [
              { title: "ເນື້ອຫາ", description: "ຊື່ ແລະເນື້ອຫາຂອງໜ້າ", names: ["title", "content"] },
              { title: "ຮູບພາບ", description: "ເລືອກຮູບປະກອບໜ້າ", names: ["imageUrl"] },
              { title: "ການເຜີຍແຜ່", description: "ກຳນົດທີ່ຢູ່ ແລະສະຖານະ", names: ["slug", "status"] },
            ]).map((section,index) => <section key={section.title} className={index ? "border-t border-border pt-6" : ""}><div className="mb-5"><h2 className="text-base font-semibold text-foreground">{section.title}</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.description}</p></div><div className="grid gap-4 md:grid-cols-2">{section.names.map(name => { const f = def.fields.find(field => field.name === name)!; return <FieldInput onPreviewChange={preview => setImagePreviews(previous => ({ ...previous, [f.name]: preview }))} key={f.name} field={f} value={values[f.name]} error={errors[f.name]} values={values} visualMedia newsEditor onUploadingChange={(field, uploading) => setUploadingFields(fields => uploading ? [...fields.filter(item => item !== field), field] : fields.filter(item => item !== field))} onChange={value => setValues(state => ({ ...state, [f.name]: value }))} />; })}</div></section>)}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {def.fields.map((f) => (
                <FieldInput
                  key={f.name}
                  onPreviewChange={preview => setImagePreviews(previous => ({ ...previous, [f.name]: preview }))}
                  field={f}
                  value={values[f.name]}
                  error={errors[f.name]}
                  values={values}
                  onChange={(v, media) => setValues((state) => ({ ...state, [f.name]: v, ...(f.name === "fileUrl" && media ? { fileName: media.fileName, fileType: media.fileName.toLowerCase().endsWith(".xlsx") ? "xlsx" : "pdf", fileSize: media.size, fileStatus: "available" } : {}) }))}
                />
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            {isNews && !isNew ? <Button type="button" variant="outline" onClick={() => { if (item.data) setValues({ ...initialValues(def.fields), ...(item.data as Values) }); setErrors({}); setImagePreviews({}); setEditingNews(false); }}>{t("cancel")}</Button> : <Button asChild variant="outline"><Link to={listTo}>{t("cancel")}</Link></Button>}
            <Button type="submit" disabled={!connected || save.isPending || uploadingFields.length > 0} title={!connected ? t("saveDisabled") : undefined}>
              {save.isPending ? t("loading") : t("save")}
            </Button>
          </div>
        </form>
        {def.preview && <Preview imagePreview={imagePreviews["coverImageUrl"] || imagePreviews["imageUrl"]} kind={def.preview} v={values} compact={isNews || isSiteContent} news={isNews} />}
        {isDocument && <DocumentPreview v={values} />}
        {isNewPartner && <PartnerPreview imagePreview={imagePreviews["logoUrl"]} v={values} />}
      </div>

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm === "delete" ? t("confirmDelete") : t("confirmUnpublish")}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "delete" ? t("confirmDeleteBody") : t("confirmUnpublishBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => (confirm === "delete" ? del.mutate() : submit(true))}
            >
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function initialValues(fields: FieldDef[]): Values {
  const v: Values = {};
  for (const f of fields) {
    v[f.name] = f.type === "status" ? "draft" : f.type === "gallery" ? [] : f.type === "number" ? 0 : f.type === "select" ? (f.options?.[0]?.value ?? "") : "";
  }
  return v;
}

function Preview({ kind, v, compact = false, news = false, imagePreview }: { kind: "article" | "faq"; v: Values; compact?: boolean; news?: boolean; imagePreview?: string | undefined }) {
  return (
    <aside className={`panel min-w-0 self-start p-[var(--panel-padding)] xl:col-span-5 ${compact ? "xl:sticky xl:top-24" : ""}`} aria-label={t("preview")}>
      <div className="mb-4 border-b border-border pb-4"><h2 className="text-base font-semibold text-foreground">{t("preview")}</h2>{compact && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">ຕົວຢ່າງຈະປ່ຽນຕາມຂໍ້ມູນທີ່ທ່ານປ້ອນ</p>}</div>
      {kind === "faq" ? (
        <Accordion type="single" collapsible defaultValue="q">
          <AccordionItem value="q">
            <AccordionTrigger>{(v["question"] as string) || "ຄຳຖາມ"}</AccordionTrigger>
            <AccordionContent className="whitespace-pre-wrap">{(v["answer"] as string) || "ຄໍາຕອບ"}</AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <article>
          {imagePreview || (typeof (v["coverImageUrl"] ?? v["imageUrl"]) === "string" && (v["coverImageUrl"] || v["imageUrl"])) ? (
            <img src={imagePreview || mediaUrl((v["coverImageUrl"] || v["imageUrl"]) as string)} alt="" className="mb-3 aspect-video w-full rounded-md object-cover" />
          ) : (
            <div className="mb-4 flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg bg-muted text-xs text-muted-foreground">
              <ImagePlus className="size-6" aria-hidden />ຍັງບໍ່ມີຮູບໜ້າປົກ
            </div>
          )}
          {compact && <div className="mb-3 flex flex-wrap items-center gap-2">{news && <span className="text-xs font-medium text-primary">{newsCategories.find((category) => category.value === v["category"])?.label ?? "ຂ່າວ"}</span>}<StatusBadge status={String(v["status"] || "draft")} /></div>}
          <h3 className="break-words text-lg font-semibold leading-relaxed">{(v["title"] as string) || "ຫົວຂໍ້"}</h3>
          {v["excerpt"] ? <p className="mt-1 text-sm text-muted-foreground">{String(v["excerpt"])}</p> : null}
          <p className={`mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed ${compact ? "max-h-96 overflow-y-auto" : ""}`}>{(v["content"] as string) || ""}</p>
        </article>
      )}
    </aside>
  );
}

function DocumentPreview({ v }: { v: Values }) {
  const type = typeof v["fileType"] === "string" ? v["fileType"].toLowerCase() : "";
  const category = documentCategories.find(item => item.value === v["category"])?.label ?? "—";
  const fileUrl = typeof v["fileUrl"] === "string" ? v["fileUrl"] : "";
  const fileHref = mediaUrl(fileUrl);
  return <aside className="panel min-w-0 self-start p-[var(--panel-padding)] xl:sticky xl:top-24 xl:col-span-5" aria-label="ຕົວຢ່າງເອກະສານ">
    <div className="border-b border-border pb-4"><h2 className="text-base font-semibold">ຕົວຢ່າງເອກະສານ</h2><p className="mt-1 text-xs text-muted-foreground">ຂໍ້ມູນຈະປ່ຽນຕາມທີ່ທ່ານປ້ອນ</p></div>
    <div className="mt-5 flex min-w-0 items-start gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-lg bg-muted">{type === "pdf" ? <img src={mediaUrl("/api/assets/icons/pdf.svg")} alt="" className="size-9 object-contain" /> : type === "xlsx" ? <img src={mediaUrl("/api/assets/icons/excel.png")} alt="" className="size-9 object-contain" /> : <FileText className="size-6 text-muted-foreground" aria-hidden />}</span><div className="min-w-0"><p className="break-words font-semibold leading-relaxed">{String(v["title"] || "ຊື່ເອກະສານ")}</p><p className="mt-1 break-all text-xs text-muted-foreground">{String(v["fileName"] || "ຍັງບໍ່ໄດ້ເລືອກໄຟລ໌")}</p></div></div>
    <dl className="mt-5 divide-y divide-border border-t border-border text-sm"><div className="flex justify-between gap-3 py-3"><dt className="text-muted-foreground">ປະເພດ</dt><dd className="text-right">{category}</dd></div><div className="flex justify-between gap-3 py-3"><dt className="text-muted-foreground">ວັນທີ</dt><dd>{formatDate(v["documentDate"] as string)}</dd></div><div className="flex justify-between gap-3 py-3"><dt className="text-muted-foreground">ຂະໜາດໄຟລ໌</dt><dd>{formatBytes(v["fileSize"] as number | undefined)}</dd></div><div className="flex items-center justify-between gap-3 py-3"><dt className="text-muted-foreground">ສະຖານະ</dt><dd><StatusBadge status={String(v["status"] || "draft")} /></dd></div></dl>
    {fileHref && <Button asChild variant="outline" className="mt-4 min-h-11 w-full"><a href={fileHref} target="_blank" rel="noreferrer"><ExternalLink className="size-4" aria-hidden />ເປີດໄຟລ໌ເອກະສານ</a></Button>}
  </aside>;
}

function PartnerPreview({ v, imagePreview }: { v: Values; imagePreview?: string | undefined }) {
  return <aside className="panel min-w-0 self-start p-[var(--panel-padding)] xl:sticky xl:top-24 xl:col-span-5" aria-label="ຕົວຢ່າງອົງການ"><div className="border-b border-border pb-4"><h2 className="text-base font-semibold">ຕົວຢ່າງອົງການ</h2><p className="mt-1 text-xs text-muted-foreground">ຂໍ້ມູນຈະປ່ຽນຕາມທີ່ທ່ານປ້ອນ</p></div><div className="mt-5 flex min-w-0 items-center gap-4"><span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted">{imagePreview || v["logoUrl"] ? <img src={imagePreview || mediaUrl(String(v["logoUrl"]))} alt="" className="size-full object-contain p-2" /> : <Building2 className="size-6 text-muted-foreground" aria-hidden />}</span><div className="min-w-0"><p className="break-words font-semibold leading-relaxed">{String(v["name"] || "ຊື່ອົງການ")}</p><p className="mt-1 break-all text-xs text-muted-foreground">{String(v["url"] || "ເວັບໄຊຂອງອົງການ")}</p></div></div><dl className="mt-5 divide-y divide-border border-t border-border text-sm"><div className="py-3"><dt className="text-xs text-muted-foreground">ທີ່ຢູ່</dt><dd className="mt-1 whitespace-pre-wrap break-words">{String(v["address"] || "—")}</dd></div><div className="flex justify-between gap-3 py-3"><dt className="text-muted-foreground">ເບີໂທລະສັບ</dt><dd className="break-all text-right">{String(v["phone"] || "—")}</dd></div><div className="flex justify-between gap-3 py-3"><dt className="text-muted-foreground">ອີເມວ</dt><dd className="break-all text-right">{String(v["email"] || "—")}</dd></div><div className="flex items-center justify-between gap-3 pt-3"><dt className="text-muted-foreground">ສະຖານະ</dt><dd><StatusBadge status={String(v["status"] || "draft")} /></dd></div></dl></aside>;
}
