import { useSyncExternalStore } from "react";

export type AlertKind = "success" | "error" | "info";
export interface Notification {
  id: number;
  kind: AlertKind;
  message: string;
  duration: number | null;
}
let nextId = 0;
let current: Notification | null = null;
let queue: Notification[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
function show(kind: AlertKind, message: string, options?: { duration?: number }) {
  const requested = options?.duration;
  const duration =
    requested === Infinity || (requested === undefined && kind === "error")
      ? null
      : Math.max(requested ?? 2600, kind === "success" ? 2400 : 1000);
  const notification = { id: ++nextId, kind, message, duration };
  if (current) queue.push(notification);
  else current = notification;
  emit();
  return notification.id;
}
export const notify = {
  success: (message: string, options?: { duration?: number }) => show("success", message, options),
  error: (message: string, options?: { duration?: number }) => show("error", message, options),
  info: (message: string, options?: { duration?: number }) => show("info", message, options),
  dismiss(id?: number) {
    if (id === undefined) {
      current = null;
      queue = [];
    } else {
      queue = queue.filter((notification) => notification.id !== id);
      if (current?.id === id) current = queue.shift() ?? null;
    }
    emit();
  },
};
export function useNotification() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => current,
    () => null,
  );
}
