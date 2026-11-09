import { mediaUrl } from "@/lib/api/media";
import { useEffect, useRef, useState } from "react";
import { FileUp, ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDef } from "@/lib/resources";
import { uploadMedia } from "@/lib/api/services";
import type { Media } from "@/lib/api/types";
import { isValidEmail, isValidHttpUrl, isValidSlug, slugify, validateFile } from "@/lib/validation";

export type Values = Record<string, unknown>;

export function validateFields(fields: FieldDef[], v: Values): Record<string, string> {
  const e: Record<string, string> = {};
  for (const f of fields) {
    const val = v[f.name];
    const s = typeof val === "string" ? val.trim() : val;
    if (f.required && (s === "" || s == null) && f.type !== "image" && f.type !== "file") e[f.name] = "ຕ້ອງການ";
    else if (typeof s === "string" && s) {
      if (f.max && s.length > f.max) e[f.name] = `ບໍ່ຫຼາຍກ່ວາ ${f.max} ຈົດໝາຍ`;
      else if (f.type === "slug" && !isValidSlug(s)) e[f.name] = "ຫ້າມໃຊ້ຊ່ອງວ່າງ ຫຼື / ? #";
      else if (f.type === "url" && !isValidHttpUrl(s)) e[f.name] = "ຮູບແບບ URL ບໍ່ຖືກຕ້ອງ (http/https)";
      else if (f.type === "email" && !isValidEmail(s)) e[f.name] = "ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ";
    }
    if (f.type === "number" && val !== "" && (!Number.isFinite(Number(val)) || Number(val) < 0))
      e[f.name] = "ຕ້ອງເປັນຕົວເລກ 0 ຂຶ້ນ";
  }
  return e;
}

const ctl = "h-[var(--control-height)]";

export function FieldInput({
  field: f,
  value,
  error,
  values,
  onChange,
  visualMedia = false,
  newsEditor = false,
  visualDocument = false,
  onUploadingChange,
  onPreviewChange,
}: {
  field: FieldDef;
  value: unknown;
  error?: string | undefined;
  values: Values;
  onChange: (v: unknown, media?: Media) => void;
  visualMedia?: boolean;
  newsEditor?: boolean;
  visualDocument?: boolean;
  onUploadingChange?: (name: string, uploading: boolean) => void;
  onPreviewChange?: (preview: string) => void;
}) {
  const id = `f-${f.name}`;
  const describedBy = error ? `${id}-err` : f.help ? `${id}-help` : undefined;
  const common = { id, "aria-invalid": !!error, "aria-describedby": describedBy };
  const str = typeof value === "string" ? value : value == null ? "" : String(value);
  let control;
  switch (f.type) {
    case "textarea":
    case "richtext":
      control = <Textarea {...common} rows={newsEditor ? (f.type === "richtext" ? 16 : f.name === "title" ? 3 : 5) : f.type === "richtext" ? 10 : 3} className={newsEditor ? "min-h-24 resize-y bg-surface px-4 py-3 text-base leading-7" : undefined} value={str} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "select":
    case "status":
      control = (
        <select
          {...common}
          className={`${ctl} w-full rounded-[var(--radius-control)] border border-input bg-surface px-2 text-sm`}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        >
          {(f.type === "status"
            ? [
                { value: "draft", label: "ຮ່າງ" },
                { value: "published", label: "ເຜີຍແຜ່" },
              ]
            : (f.options ?? [])
          ).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "slug":
      control = (
        <div className="flex gap-2">
          <Input {...common} className={ctl} value={str} onChange={(e) => onChange(e.target.value)} />
          {f.slugFrom && (
            <button
              type="button"
              className="whitespace-nowrap rounded-[var(--radius-control)] border border-input px-3 text-xs hover:bg-muted"
              onClick={() => onChange(slugify(String(values[f.slugFrom!] ?? "")))}
            >
              ສ້າງຈາກຫົວຂໍ້
            </button>
          )}
        </div>
      );
      break;
    case "image":
    case "file":
    case "gallery":
      control = <FilePicker field={f} value={value} id={id} onChange={onChange} visualMedia={visualMedia} visualDocument={visualDocument} fileName={typeof values["fileName"] === "string" ? values["fileName"] : undefined} onUploadingChange={onUploadingChange} onPreviewChange={onPreviewChange} />;
      break;
    case "date":
      control = (
        <Input {...common} type="date" className={ctl} value={str.slice(0, 10)} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : "")} />
      );
      break;
    default:
      control = (
        <Input
          {...common}
          className={ctl}
          type={f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "url" ? "url" : f.type === "tel" ? "tel" : "text"}
          min={f.type === "number" ? 0 : undefined}
          value={str}
          onChange={(e) => onChange(f.type === "number" ? Number(e.target.value) : e.target.value)}
        />
      );
  }
  return (
    <div className={f.wide || f.type === "gallery" ? "md:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {f.label}
        {f.required && <span className="text-destructive"> *</span>}
      </label>
      {control}
      {newsEditor && f.max && !error && <p className="mt-1.5 text-right text-xs text-muted-foreground">{str.length.toLocaleString("lo-LA")} / {f.max.toLocaleString("lo-LA")}</p>}
      {f.help && !error && (
        <p id={`${id}-help`} className="mt-1 text-xs text-muted-foreground">
          {f.help}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function FilePicker({ field: f, value, id, onChange, visualMedia, visualDocument, fileName, onUploadingChange, onPreviewChange }: { field: FieldDef; value: unknown; id: string; onChange: (value: unknown, media?: Media) => void; visualMedia: boolean; visualDocument: boolean; fileName?: string | undefined; onUploadingChange?: ((name: string, uploading: boolean) => void) | undefined; onPreviewChange?: ((preview: string) => void) | undefined }) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});
  const objectUrls = useRef(new Set<string>());
  useEffect(() => {
    const urls = objectUrls.current;
    return () => { for (const url of urls) URL.revokeObjectURL(url); };
  }, []);
  const current = Array.isArray(value) ? value : value ? [value] : [];
  const savedImages = current.map(url => ({ url: String(url), src: localPreviews[String(url)] || mediaUrl(String(url)) }));
  const pendingImages = pendingPreviews.map(src => ({ url: "", src }));
  const images = f.type === "image" && pendingImages.length ? pendingImages : [...savedImages, ...pendingImages];
  async function select(files: File[]) {
    if (!files.length) return;
    const invalid = files.map(file => validateFile(file, f.accept ?? [], f.maxMb ?? 5)).find(Boolean);
    if (invalid) { setMessage(invalid); return; }
    const previews = f.type === "image" || f.type === "gallery" ? files.map(file => {
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      return url;
    }) : [];
    setPendingPreviews(previews);
    if (f.type === "image" && previews[0]) onPreviewChange?.(previews[0]);
    setUploading(true); onUploadingChange?.(f.name, true); setMessage("");
    try {
      const uploaded: Media[] = [];
      for (const file of files) uploaded.push(await uploadMedia(file));
      setLocalPreviews(previous => ({ ...previous, ...Object.fromEntries(uploaded.flatMap((item, index) => previews[index] ? [[item.url, previews[index]]] : [])) }));
      if (f.type === "gallery") onChange([...current, ...uploaded.map(item => item.url)]);
      else if (uploaded[0]) onChange(uploaded[0].url, uploaded[0]);
      setMessage("ອັບໂຫຼດສຳເລັດ");
    } catch (error) {
      for (const url of previews) { URL.revokeObjectURL(url); objectUrls.current.delete(url); }
      if (f.type === "image") onPreviewChange?.(localPreviews[String(current[0])] || "");
      setMessage(`ອັບໂຫຼດບໍ່ສຳເລັດ: ${error instanceof Error ? error.message : ""}`);
    }
    finally { setPendingPreviews([]); setUploading(false); onUploadingChange?.(f.name, false); }
  }
  if (visualDocument && f.type === "file") return <div className="space-y-3">
    {current.length > 0 && <div className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-muted/30 p-3"><span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-soft text-primary"><FileUp className="size-5" aria-hidden /></span><div className="min-w-0"><p className="truncate text-sm font-medium">{fileName || "ໄຟລ໌ເອກະສານ"}</p><p className="mt-1 text-xs text-muted-foreground">ອັບໂຫຼດແລ້ວ</p></div></div>}
    <label htmlFor={id} className="relative flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 px-4 py-5 text-center text-sm text-primary hover:bg-primary-soft focus-within:outline-2 focus-within:outline-ring"><FileUp className="size-6" aria-hidden /><span className="font-medium">{uploading ? "ກຳລັງອັບໂຫຼດ..." : current.length ? "ປ່ຽນໄຟລ໌ເອກະສານ" : "ເລືອກໄຟລ໌ເອກະສານ"}</span><span className="text-xs text-muted-foreground">{f.accept?.join(" / ").toUpperCase()} · {f.maxMb} MB</span><input id={id} type="file" disabled={uploading} accept={f.accept?.map(a => `.${a}`).join(",")} className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-wait" onChange={e => { void select(Array.from(e.target.files ?? [])); e.target.value = ""; }} /></label>
    {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
  </div>;
  if (visualMedia && (f.type === "image" || f.type === "gallery")) return <div className="space-y-3">
    {images.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{images.map(({ url, src }, index) => <div key={`${url || src}-${index}`} className="group relative overflow-hidden rounded-lg border border-border bg-muted"><img src={src} alt={`${f.label} ${index + 1}`} className="aspect-[4/3] w-full object-cover" loading="lazy" /><button type="button" disabled={uploading} onClick={() => { if (f.type === "image") onPreviewChange?.(""); onChange(f.type === "gallery" ? current.filter((_, i) => i !== index) : ""); }} aria-label={`ລຶບ ${f.label} ${index + 1}`} className="absolute right-2 top-2 grid size-9 place-items-center rounded-md bg-card text-destructive shadow-sm hover:bg-expired-bg focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"><X className="size-4" aria-hidden /></button></div>)}</div>}
    <label htmlFor={id} className="relative flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input bg-muted/30 px-4 py-3 text-center text-sm text-primary hover:bg-primary-soft focus-within:outline-2 focus-within:outline-ring"><ImagePlus className="size-5" aria-hidden /><span>{uploading ? "ກຳລັງອັບໂຫຼດ..." : f.type === "gallery" ? "ເພີ່ມຮູບປະກອບ" : f.name === "logoUrl" ? (current.length ? "ປ່ຽນໂລໂກ້" : "ເລືອກໂລໂກ້") : f.name === "coverImageUrl" ? (current.length ? "ປ່ຽນຮູບໜ້າປົກ" : "ເລືອກຮູບໜ້າປົກ") : current.length ? "ປ່ຽນຮູບ" : "ເລືອກຮູບ"}</span><span className="text-xs text-muted-foreground">{f.accept?.join(", ").toUpperCase()} · {f.maxMb} MB</span><input id={id} type="file" multiple={f.type === "gallery"} disabled={uploading} accept={f.accept?.map(a => `.${a}`).join(",")} className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-wait" onChange={e => { void select(Array.from(e.target.files ?? [])); e.target.value = ""; }} /></label>
    {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
  </div>;
  return <div className="rounded-[var(--radius-control)] border border-dashed border-input p-3">
    {current.map(u => <div key={String(u)} className="mb-1 break-all text-xs">{String(u)}</div>)}
    <input id={id} type="file" multiple={f.type === "gallery"} disabled={uploading} accept={f.accept?.map(a => `.${a}`).join(",")} className="block w-full text-sm" onChange={e => { void select(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
    <p className="mt-1 text-xs text-muted-foreground">{f.accept?.join(", ").toUpperCase()} · {f.maxMb} MB</p>
    <p role="status" className="mt-1 text-xs">{uploading ? "ກຳລັງອັບໂຫຼດ..." : message}</p>
  </div>;
}
