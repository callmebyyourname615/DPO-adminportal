import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDef } from "@/lib/resources";
import { formatBytes } from "@/lib/i18n";
import { isValidEmail, isValidHttpUrl, isValidSlug, slugify, validateFile } from "@/lib/validation";

export type Values = Record<string, unknown>;

export function validateFields(fields: FieldDef[], v: Values): Record<string, string> {
  const e: Record<string, string> = {};
  for (const f of fields) {
    const val = v[f.name];
    const s = typeof val === "string" ? val.trim() : val;
    if (f.required && (s === "" || s == null) && f.type !== "image" && f.type !== "file") e[f.name] = "จำเป็นต้องกรอก";
    else if (typeof s === "string" && s) {
      if (f.max && s.length > f.max) e[f.name] = `ไม่เกิน ${f.max} ตัวอักษร`;
      else if (f.type === "slug" && !isValidSlug(s)) e[f.name] = "ใช้ a-z, 0-9 และ - เท่านั้น";
      else if (f.type === "url" && !isValidHttpUrl(s)) e[f.name] = "รูปแบบ URL ไม่ถูกต้อง (http/https)";
      else if (f.type === "email" && !isValidEmail(s)) e[f.name] = "รูปแบบอีเมลไม่ถูกต้อง";
    }
    if (f.type === "number" && val !== "" && (!Number.isFinite(Number(val)) || Number(val) < 0))
      e[f.name] = "ต้องเป็นตัวเลข 0 ขึ้นไป";
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
}: {
  field: FieldDef;
  value: unknown;
  error?: string | undefined;
  values: Values;
  onChange: (v: unknown) => void;
}) {
  const id = `f-${f.name}`;
  const describedBy = error ? `${id}-err` : f.help ? `${id}-help` : undefined;
  const common = { id, "aria-invalid": !!error, "aria-describedby": describedBy };
  const str = typeof value === "string" ? value : value == null ? "" : String(value);
  let control;
  switch (f.type) {
    case "textarea":
    case "richtext":
      control = <Textarea {...common} rows={f.type === "richtext" ? 10 : 3} value={str} onChange={(e) => onChange(e.target.value)} />;
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
                { value: "draft", label: "ฉบับร่าง" },
                { value: "published", label: "เผยแพร่" },
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
              สร้างจากหัวข้อ
            </button>
          )}
        </div>
      );
      break;
    case "image":
    case "file":
    case "gallery":
      control = <FilePicker field={f} value={value} id={id} />;
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

/** Selects files and validates type/size locally. Upload needs a confirmed backend flow; nothing is base64-embedded. */
function FilePicker({ field: f, value, id }: { field: FieldDef; value: unknown; id: string }) {
  const [picked, setPicked] = useState<{ name: string; size: number; error: string | null }[]>([]);
  const current = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <div className="rounded-[var(--radius-control)] border border-dashed border-input p-3">
      {current.length > 0 && (
        <ul className="mb-2 text-xs text-muted-foreground">
          {current.map((u) => (
            <li key={String(u)} className="truncate">
              ไฟล์ปัจจุบัน: {String(u)}
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        type="file"
        multiple={f.type === "gallery"}
        accept={f.accept?.map((a) => `.${a}`).join(",")}
        className="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:text-primary"
        onChange={(e) =>
          setPicked(
            Array.from(e.target.files ?? []).map((file) => ({
              name: file.name,
              size: file.size,
              error: validateFile(file, f.accept ?? [], f.maxMb ?? 5),
            })),
          )
        }
      />
      <p className="mt-1 text-xs text-muted-foreground">
        รองรับ {f.accept?.join(", ").toUpperCase()} ไม่เกิน {f.maxMb} MB
      </p>
      {picked.map((p) => (
        <p key={p.name} className={`mt-1 text-xs ${p.error ? "text-destructive" : "text-foreground"}`}>
          {p.name} ({formatBytes(p.size)}) — {p.error ?? "ยังอัปโหลดไม่ได้: รอ API อัปโหลดไฟล์"}
        </p>
      ))}
    </div>
  );
}
