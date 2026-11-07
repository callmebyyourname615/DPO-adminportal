import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { ApiNotConnectedError, isApiConfigured } from "@/lib/api/client";
import { services } from "@/lib/api/services";
import { formatDate, t } from "@/lib/i18n";
import { resources, type FieldDef } from "@/lib/resources";
import { PageHeader } from "./PageHeader";
import { QueryState, StateBlock } from "./StateBlock";
import { FieldInput, validateFields, type Values } from "./FormFields";

export function ResourceForm({ resourceKey, id }: { resourceKey: string; id: string }) {
  const def = resources[resourceKey];
  const svc = services[def.key];
  const isNew = id === "new";
  const qc = useQueryClient();
  const navigate = useNavigate();
  const connected = isApiConfigured();
  const listTo = def.basePath as "/news";

  const item = useQuery({
    queryKey: [def.key, "item", id],
    queryFn: () => svc.get(id),
    enabled: !isNew,
    retry: false,
  });

  const [values, setValues] = useState<Values>(() => initialValues(def.fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<null | "delete" | "unpublish">(null);

  useEffect(() => {
    if (item.data) setValues({ ...initialValues(def.fields), ...(item.data as Values) });
  }, [item.data, def.fields]);

  const save = useMutation({
    mutationFn: (v: Values) => (isNew ? svc.create(v as never) : svc.update(id, v as never)),
    onSuccess: (res: any) => {
      toast.success(t("saved"));
      qc.invalidateQueries({ queryKey: [def.key] });
      if (isNew && res?.id) navigate({ to: `${def.basePath}/$id` as "/news/$id", params: { id: String(res.id) } });
    },
    onError: (e) =>
      toast.error(e instanceof ApiNotConnectedError ? t("notConnected") : `บันทึกไม่สำเร็จ: ${e.message}`),
  });
  const del = useMutation({
    mutationFn: () => svc.remove(id),
    onSuccess: () => {
      toast.success(t("deleted"));
      qc.invalidateQueries({ queryKey: [def.key] });
      navigate({ to: listTo });
    },
    onError: (e) => toast.error(`ลบไม่สำเร็จ: ${e.message}`),
  });

  const submit = (skipConfirm = false) => {
    const errs = validateFields(def.fields, values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("กรุณาตรวจสอบข้อมูลที่กรอก");
      return;
    }
    const wasPublished = (item.data as Values | undefined)?.status === "published";
    if (!skipConfirm && wasPublished && values.status === "draft") return setConfirm("unpublish");
    save.mutate(values);
  };

  const title = isNew ? `${t("add")}${def.singular}` : `${def.readOnlyDetail ? "" : t("edit")}${def.singular}`;
  const publicUrl = !isNew && def.publicUrl ? def.publicUrl(values) : null;

  const header = (
    <PageHeader
      title={title}
      crumbs={[{ label: def.title, to: def.basePath }, { label: isNew ? t("add") : String(values.title ?? values.question ?? values.name ?? values.subject ?? id) }]}
      actions={
        <>
          {publicUrl && (
            <Button asChild variant="outline">
              <a href={publicUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" /> หน้าสาธารณะ
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

  return (
    <div>
      {header}
      {!connected && (
        <div className="panel mb-4 border-warning/30 bg-warning-bg">
          <StateBlock kind="not-connected" compact hint={`${t("notConnectedHint")} — ${t("saveDisabled")}`} />
        </div>
      )}
      <div className="grid gap-[var(--dashboard-gap)] xl:grid-cols-12">
        {def.readOnlyDetail && !isNew && <InquiryDetail v={values} />}
        <form
          className={`panel p-[var(--panel-padding)] ${def.preview ? "xl:col-span-7" : "xl:col-span-12"} ${def.readOnlyDetail ? "xl:col-span-4" : ""}`}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {def.fields.map((f) => (
              <FieldInput
                key={f.name}
                field={f}
                value={values[f.name]}
                error={errors[f.name]}
                values={values}
                onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))}
              />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button asChild variant="outline">
              <Link to={listTo}>{t("cancel")}</Link>
            </Button>
            <Button type="submit" disabled={!connected || save.isPending} title={!connected ? t("saveDisabled") : undefined}>
              {save.isPending ? t("loading") : t("save")}
            </Button>
          </div>
        </form>
        {def.preview && <Preview kind={def.preview} v={values} />}
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

function InquiryDetail({ v }: { v: Values }) {
  return (
    <section className="panel p-[var(--panel-padding)] xl:col-span-8" aria-label="รายละเอียดข้อความ">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {[
          ["ชื่อ", v.name],
          ["อีเมล", v.email],
          ["หัวข้อ", v.subject],
          ["วันที่", formatDate(v.createdAt as string)],
        ].map(([k, val]) => (
          <div key={k as string}>
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="font-medium break-words">{(val as string) || "—"}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-4 text-xs text-muted-foreground">ข้อความ</h2>
      <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{(v.message as string) || "—"}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        การตอบกลับทางอีเมลยังไม่รองรับ เนื่องจากยังไม่มี API สำหรับส่งอีเมล
      </p>
    </section>
  );
}

function Preview({ kind, v }: { kind: "article" | "faq"; v: Values }) {
  return (
    <aside className="panel p-[var(--panel-padding)] xl:col-span-5" aria-label={t("preview")}>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("preview")}</p>
      {kind === "faq" ? (
        <Accordion type="single" collapsible defaultValue="q">
          <AccordionItem value="q">
            <AccordionTrigger>{(v.question as string) || "คำถาม"}</AccordionTrigger>
            <AccordionContent className="whitespace-pre-wrap">{(v.answer as string) || "คำตอบ"}</AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <article>
          {typeof (v.coverImageUrl ?? v.imageUrl) === "string" && (v.coverImageUrl || v.imageUrl) ? (
            <img src={(v.coverImageUrl || v.imageUrl) as string} alt="" className="mb-3 aspect-video w-full rounded-md object-cover" />
          ) : (
            <div className="mb-3 grid aspect-video w-full place-items-center rounded-md bg-muted text-xs text-muted-foreground">
              ยังไม่มีภาพ
            </div>
          )}
          <h2 className="text-lg font-semibold">{(v.title as string) || "หัวข้อ"}</h2>
          {v.excerpt ? <p className="mt-1 text-sm text-muted-foreground">{v.excerpt as string}</p> : null}
          <p className="mt-3 whitespace-pre-wrap text-sm">{(v.content as string) || ""}</p>
        </article>
      )}
    </aside>
  );
}
