import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { loadLottiePlayer, type LottieAnimation } from "@/lib/lottie-player";
import successFile from "@/assets/animations/check.json?url";
import errorFile from "@/assets/animations/VMC-EQUIS.json?url";

export function StatusAnimation({ kind }: { kind: "success" | "error" }) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let animation: LottieAnimation | undefined;
    loadLottiePlayer()
      .then((player) => {
        if (cancelled || !container.current) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        animation = player.loadAnimation({
          container: container.current,
          renderer: "svg",
          loop: false,
          autoplay: !reduced,
          path: kind === "success" ? successFile : errorFile,
        });
        animation.addEventListener("DOMLoaded", () => {
          if (cancelled) return;
          if (reduced) animation?.goToAndStop(Math.max(0, animation.totalFrames - 1), true);
          setReady(true);
        });
        animation.addEventListener("data_failed", () => {
          if (!cancelled) setReady(false);
        });
      })
      .catch(() => {
        /* Keep the static status icon if the CDN is unavailable. */
      });
    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, [kind]);
  const Icon = kind === "success" ? CheckCircle2 : XCircle;
  return (
    <div className="relative mx-auto size-40" aria-hidden="true" data-status-animation={kind}>
      {!ready && (
        <Icon
          className={`absolute inset-8 size-24 ${kind === "success" ? "text-alert-success" : "text-alert-danger"}`}
          strokeWidth={1.5}
        />
      )}
      <div ref={container} className={`size-full ${ready ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}
