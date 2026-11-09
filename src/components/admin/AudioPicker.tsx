import { useState } from "react";
import { Upload } from "lucide-react";
import { mediaUrl } from "@/lib/api/media";
import type { Media } from "@/lib/api/types";
import { uploadMedia } from "@/lib/api/services";
import { MAX_UPLOAD_MB, validateFile } from "@/lib/validation";
import { notify } from "@/lib/notifications";

export type AudioOption = Pick<Media, "url" | "fileName">;
const ACCEPT = ["mp3", "wav", "ogg"];

export function AudioPicker({ name, label, value, options, loading, disabled, onChange, onUploaded, onUploadingChange }: {
  name: string;
  label: string;
  value: string;
  options: AudioOption[];
  loading: boolean;
  disabled: boolean;
  onChange: (url: string) => void;
  onUploaded: (option: AudioOption) => void;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const choices = value && !options.some(option => option.url === value)
    ? [{ url: value, fileName: "ສຽງທີ່ເລືອກໄວ້" }, ...options]
    : options;
  async function upload(file?: File) {
    if (!file || uploading || disabled) return;
    const invalid = validateFile(file, ACCEPT, MAX_UPLOAD_MB.audio);
    if (invalid) { setError(invalid); notify.error(invalid); return; }
    setError(""); setUploading(true); onUploadingChange(true);
    try {
      const result = await uploadMedia(file);
      onUploaded(result);
      onChange(result.url);
      notify.success("ອັບໂຫຼດສຽງສຳເລັດ — ກົດບັນທຶກເພື່ອນຳໃຊ້");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "ກະລຸນາລອງໃໝ່";
      setError(message); notify.error(`ອັບໂຫຼດສຽງບໍ່ສຳເລັດ: ${message}`);
    } finally { setUploading(false); onUploadingChange(false); }
  }
  const id = `f-${name}`;
  return <div className="min-w-0 space-y-3 md:col-span-2">
    <label htmlFor={id} className="block text-sm font-medium">{label}</label>
    <div className="flex flex-col gap-3 sm:flex-row">
      <select id={id} value={value} disabled={disabled || uploading || loading} onChange={event => { setError(""); onChange(event.target.value); }} className="h-[var(--control-height)] min-w-0 flex-1 rounded-[var(--radius-control)] border border-input bg-surface px-3 text-sm disabled:opacity-60">
        <option value="">{loading ? "ກຳລັງໂຫຼດລາຍການສຽງ..." : "ບໍ່ໃຊ້ສຽງ"}</option>
        {choices.map(option => <option key={option.url} value={option.url}>{option.fileName}</option>)}
      </select>
      <label className={`relative inline-flex min-h-11 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[var(--radius-control)] border border-input px-4 text-sm font-medium focus-within:outline-2 focus-within:outline-ring ${disabled || uploading ? "opacity-60" : "cursor-pointer hover:bg-primary-soft"}`}>
        <Upload className="size-4" aria-hidden />{uploading ? "ກຳລັງອັບໂຫຼດ..." : "Browse ໄຟລ໌ສຽງ"}
        <input type="file" aria-label={`Browse ${label}`} accept={ACCEPT.map(ext => `.${ext}`).join(",")} disabled={disabled || uploading} className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-wait" onChange={event => { void upload(event.target.files?.[0]); event.target.value = ""; }} />
      </label>
    </div>
    <p className="text-xs leading-relaxed text-muted-foreground">MP3, WAV, OGG · ສູງສຸດ 10 MB · ເລືອກສຽງເກົ່າ ຫຼືອັບໂຫຼດໃໝ່ໄດ້ ໂດຍບໍ່ລຶບໄຟລ໌ເກົ່າ</p>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    {value && <audio key={value} controls preload="metadata" src={mediaUrl(value)} aria-label={`ຕົວຢ່າງ ${label}`} className="h-10 w-full max-w-md" />}
  </div>;
}
