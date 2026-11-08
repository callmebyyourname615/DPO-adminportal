import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { t } from "@/lib/i18n";

gsap.registerPlugin(useGSAP);

export function LoadingSkeleton({ compact = false, className = "" }: { compact?: boolean | undefined; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(".loading-sheen", { xPercent: -120 }, { xPercent: 120, duration: 1.6, ease: "none", repeat: -1, repeatDelay: 0.15 });
    });
    return () => media.revert();
  }, { scope: root });
  return <div ref={root} role="status" aria-label={t("loading")} className={`relative overflow-hidden px-4 ${compact ? "py-5" : "py-8"} ${className}`}>
    <span className="sr-only">{t("loading")}</span>
    <div className="space-y-4" aria-hidden="true"><div className="h-3 w-2/5 rounded bg-muted" /><div className="h-3 w-4/5 rounded bg-muted" /><div className="h-3 w-3/5 rounded bg-muted" />{!compact && <><div className="h-3 w-11/12 rounded bg-muted" /><div className="h-3 w-1/2 rounded bg-muted" /></>}</div>
    <div aria-hidden="true" className="loading-sheen pointer-events-none absolute inset-0" />
  </div>;
}
