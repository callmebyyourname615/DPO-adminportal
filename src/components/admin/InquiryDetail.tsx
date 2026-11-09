/* Hallmark · genre: modern-minimal · theme: DPO tokens · layout: message workspace
 * audience: DPO administrators · task: read and triage inquiries
 * pre-emit critique: P5 H5 E4 S5 R5 V4
 */
import { Link } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarDays,
  faCircleNotch,
  faClockRotateLeft,
  faEnvelope,
  faEnvelopeOpenText,
  faFloppyDisk,
  faGlobe,
  faReply,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { Inquiry } from "@/lib/api/types";
import type { FieldDef } from "@/lib/resources";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { FieldInput } from "./FormFields";
import { StatusBadge } from "./StatusBadge";

config.autoAddCss = false;

function dateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "—";
  return new Intl.DateTimeFormat("lo-LA", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Vientiane",
  }).format(date);
}

interface InquiryDetailProps {
  inquiry: Inquiry;
  status: string;
  statusField: FieldDef;
  onStatusChange: (status: string) => void;
  onSave: () => void;
  saving: boolean;
  connected: boolean;
  error?: string | undefined;
}

export function InquiryDetail({ inquiry, status, statusField, onStatusChange, onSave, saving, connected, error }: InquiryDetailProps) {
  const subject = inquiry.subject.trim() || "ຂໍ້ຄວາມຕິດຕໍ່";
  const initial = Array.from(inquiry.name.trim())[0]?.toUpperCase() || "—";
  const source = inquiry.source === "faq" ? "FAQ" : "ໜ້າຕິດຕໍ່";
  const emailHref = `mailto:${encodeURIComponent(inquiry.email)}`;
  const replyHref = `${emailHref}?subject=${encodeURIComponent(`Re: ${subject}`)}`;
  const changed = status !== inquiry.status;

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-8" data-inquiry-detail>
      <header className="space-y-4">
        <Link to="/inquiries" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <FontAwesomeIcon icon={faArrowLeft} className="size-3.5" aria-hidden="true" />
          ກັບໄປກ່ອງຂໍ້ຄວາມ
        </Link>
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-semibold leading-snug tracking-tight text-foreground [overflow-wrap:anywhere]">ລາຍລະອຽດຂໍ້ຄວາມ</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">ອ່ານຂໍ້ຄວາມ ແລະຕິດຕາມການດຳເນີນງານ</p>
          </div>
          <div className="pt-1"><StatusBadge status={inquiry.status} /></div>
        </div>
      </header>

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0 overflow-hidden rounded-[var(--radius-detail)] border border-border bg-surface shadow-[var(--shadow-panel)]" aria-label="ຂໍ້ຄວາມທີ່ໄດ້ຮັບ">
          <div className="flex min-w-0 items-center gap-3 border-b border-border px-5 py-5 sm:px-7">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-base font-semibold text-primary" aria-hidden="true">{initial}</span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="break-words text-sm font-semibold leading-relaxed text-foreground [overflow-wrap:anywhere]">{inquiry.name}</p>
              <a href={emailHref} className="inline-flex min-h-6 max-w-full items-center gap-2 text-sm text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">
                <FontAwesomeIcon icon={faEnvelope} className="size-3 shrink-0" aria-hidden="true" />
                <span className="min-w-0 [overflow-wrap:anywhere]">{inquiry.email}</span>
              </a>
            </div>
            <FontAwesomeIcon icon={faEnvelopeOpenText} className="hidden size-5 text-primary/60 sm:block" aria-hidden="true" />
          </div>

          <div className="space-y-6 px-5 py-7 sm:px-7 sm:py-8">
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">ຫົວຂໍ້</p>
              <h2 className="text-xl font-semibold leading-relaxed text-foreground [overflow-wrap:anywhere]">{subject}</h2>
            </div>
            <div className="min-h-40 max-w-prose whitespace-pre-wrap text-base leading-8 text-foreground [overflow-wrap:anywhere]">{inquiry.message}</div>
          </div>

          <footer className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-7">
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground"><FontAwesomeIcon icon={faGlobe} className="size-3.5" aria-hidden="true" />{source}</p>
            <Button asChild variant="outline" className="h-11 gap-2 bg-surface px-4">
              <a href={replyHref}><FontAwesomeIcon icon={faReply} aria-hidden="true" />ຕອບກັບທາງອີເມວ</a>
            </Button>
          </footer>
        </article>

        <aside className="min-w-0 rounded-[var(--radius-detail)] border border-border bg-surface shadow-[var(--shadow-panel)] xl:sticky xl:top-24" aria-label="ຈັດການຂໍ້ຄວາມ">
          <div className="flex items-center gap-3 border-b border-border px-5 py-5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><FontAwesomeIcon icon={faSliders} className="size-4" aria-hidden="true" /></span>
            <h2 className="text-sm font-semibold">ຈັດການຂໍ້ຄວາມ</h2>
          </div>
          <form className="space-y-5 p-5" onSubmit={event => { event.preventDefault(); onSave(); }}>
            <fieldset disabled={saving || !connected} className="min-w-0 space-y-5">
              <div className="[&_select]:h-11">
                <FieldInput field={statusField} value={status} values={{ status }} error={error} onChange={value => onStatusChange(String(value))} />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">ປ່ຽນສະຖານະເພື່ອຕິດຕາມຂໍ້ຄວາມ ແລ້ວກົດບັນທຶກ</p>
              <Button type="submit" disabled={saving || !connected || !changed} className="h-11 w-full gap-2 active:bg-primary/80" aria-busy={saving}>
                <FontAwesomeIcon icon={saving ? faCircleNotch : faFloppyDisk} className={saving ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />
                {saving ? t("loading") : t("save")}
              </Button>
            </fieldset>
          </form>

          <dl className="space-y-5 border-t border-border p-5">
            {[
              { icon: faCalendarDays, label: "ວັນທີໄດ້ຮັບ", value: dateTime(inquiry.createdAt) },
              { icon: faClockRotateLeft, label: "ປັບປຸງຫຼ້າສຸດ", value: dateTime(inquiry.updatedAt) },
            ].map(item => <div key={item.label} className="flex min-w-0 gap-3">
              <FontAwesomeIcon icon={item.icon} className="mt-1 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0 space-y-1"><dt className="text-xs text-muted-foreground">{item.label}</dt><dd className="text-sm leading-relaxed [overflow-wrap:anywhere]">{item.value}</dd></div>
            </div>)}
          </dl>
        </aside>
      </div>
    </div>
  );
}
