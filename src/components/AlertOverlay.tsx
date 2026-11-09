import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Info, X } from "lucide-react";
import { notify, useNotification, type Notification } from "@/lib/notifications";
import { loadLottiePlayer } from "@/lib/lottie-player";
import { StatusAnimation } from "@/components/StatusAnimation";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP);

export function AlertOverlay() {
  const notification = useNotification();
  useEffect(() => {
    void loadLottiePlayer().catch(() => {});
  }, []);
  return notification ? (
    <NotificationDialog key={notification.id} notification={notification} />
  ) : null;
}
function NotificationDialog({ notification }: { notification: Notification }) {
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (notification.duration === null) return;
    const timer = window.setTimeout(() => setClosing(true), notification.duration);
    return () => window.clearTimeout(timer);
  }, [notification]);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) setClosing(true);
      }}
    >
      <Dialog.Portal>
        <NotificationPanel
          notification={notification}
          closing={closing}
          close={() => setClosing(true)}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function NotificationPanel({
  notification,
  closing,
  close,
}: {
  notification: Notification;
  closing: boolean;
  close: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const exit = useRef<(() => void) | null>(null);
  useGSAP(
    (context) => {
      if (!panel.current || !backdrop.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.fromTo(
        backdrop.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: reduced ? 0 : 0.24 },
      );
      gsap.fromTo(
        panel.current,
        { autoAlpha: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: reduced ? 0 : 0.36, ease: "power3.out" },
      );
      exit.current = context.add("exit", () => {
        gsap.killTweensOf([panel.current, backdrop.current]);
        gsap
          .timeline({
            defaults: { duration: reduced ? 0 : 0.2, ease: "power2.in" },
            onComplete: () => notify.dismiss(notification.id),
          })
          .to(panel.current, { autoAlpha: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : 0.98 })
          .to(backdrop.current, { autoAlpha: 0 }, 0);
      }) as () => void;
      return () => {
        exit.current = null;
      };
    },
    { scope: panel },
  );
  useEffect(() => {
    if (closing) exit.current?.();
  }, [closing]);
  const title =
    notification.kind === "success"
      ? "ສຳເລັດ"
      : notification.kind === "error"
        ? "ບໍ່ສຳເລັດ"
        : "ແຈ້ງເຕືອນ";
  return (
    <>
      <Dialog.Overlay
        ref={backdrop}
        className="fixed inset-0 z-[1000] bg-alert-backdrop/45 backdrop-blur-sm"
      />
      <div
        className="pointer-events-none fixed inset-0 z-[1001] grid place-items-center p-4"
        data-alert-container
      >
        <Dialog.Content
          ref={panel}
          role={notification.kind === "error" ? "alertdialog" : "dialog"}
          data-alert-kind={notification.kind}
          className="pointer-events-auto relative max-h-[calc(100dvh-32px)] w-full max-w-md overflow-y-auto rounded-[28px] border border-alert-border bg-alert-paper text-alert-ink px-8 pb-8 pt-6 text-center shadow-2xl outline-none"
        >
          <button
            type="button"
            onClick={close}
            aria-label="ປິດການແຈ້ງເຕືອນ"
            className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-alert-muted hover:text-alert-ink"
          >
            <X className="size-5" />
          </button>
          {notification.kind === "info" ? (
            <div className="mx-auto grid size-40 place-items-center text-alert-primary">
              <Info className="size-20" strokeWidth={1.5} />
            </div>
          ) : (
            <StatusAnimation kind={notification.kind} />
          )}
          <Dialog.Title className="text-2xl font-semibold">{title}</Dialog.Title>
          <Dialog.Description className="mt-3 break-words text-sm leading-relaxed text-alert-muted">
            {notification.message}
          </Dialog.Description>
          <Button onClick={close} className="mt-6 h-auto min-h-11 min-w-36 rounded-full px-5 py-2 text-[15px] shadow-none active:bg-primary/80">
            ຕົກລົງ
          </Button>
        </Dialog.Content>
      </div>
    </>
  );
}
