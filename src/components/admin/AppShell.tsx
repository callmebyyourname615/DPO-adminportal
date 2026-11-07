import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  FileText,
  FolderOpen,
  HelpCircle,
  Home,
  Inbox,
  LayoutDashboard,
  Menu,
  Newspaper,
  PanelsTopLeft,
  PlugZap,
  Settings,
  Shield,
  Building2,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { isApiConfigured } from "@/lib/api/client";
import { t, type I18nKey } from "@/lib/i18n";

const authEnabled = import.meta.env.VITE_DPO_AUTH_ENABLED === "true";

type Item = { to: string; key: I18nKey; icon: typeof Home; exact?: boolean };
const groups: { label: I18nKey; items: Item[] }[] = [
  { label: "dashboard", items: [{ to: "/", key: "dashboard", icon: LayoutDashboard, exact: true }] },
  {
    label: "groupContent",
    items: [
      { to: "/news", key: "news", icon: Newspaper },
      { to: "/documents", key: "documents", icon: FileText },
      { to: "/faqs", key: "faqs", icon: HelpCircle },
      { to: "/partners", key: "partners", icon: Building2 },
    ],
  },
  { label: "groupCommunication", items: [{ to: "/inquiries", key: "inquiries", icon: Inbox }] },
  {
    label: "groupSite",
    items: [
      { to: "/home", key: "home", icon: Home },
      { to: "/pages", key: "pages", icon: PanelsTopLeft },
      { to: "/media", key: "media", icon: FolderOpen },
      { to: "/settings", key: "settings", icon: Settings },
    ],
  },
  ...(authEnabled
    ? [{ label: "groupAdmin" as I18nKey, items: [{ to: "/users", key: "users" as I18nKey, icon: Shield }] }]
    : []),
];

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="เมนูหลัก" className="flex flex-col gap-4 px-3 py-4">
      {groups.map((g) => (
        <div key={g.label}>
          {g.label !== "dashboard" && (
            <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wide text-sidebar-muted/80">
              {t(g.label)}
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {g.items.map((it) => (
              <li key={it.to}>
                <Link
                  to={it.to as "/"}
                  className="nav-item"
                  activeOptions={{ exact: !!it.exact }}
                  onClick={onNavigate}
                >
                  <it.icon className="size-4 shrink-0" aria-hidden />
                  {t(it.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex h-[var(--header-height)] items-center gap-3 border-b border-sidebar-border px-5">
      <span className="grid size-9 place-items-center rounded-md bg-dpo-cyan font-bold text-sidebar-primary-foreground">
        D
      </span>
      <div className="leading-tight">
        <p className="font-semibold text-sidebar-foreground">{t("appName")}</p>
        <p className="text-[11px] text-sidebar-muted">{t("appSubtitle")}</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const connected = isApiConfigured();
  const current = groups.flatMap((g) => g.items).find((i) =>
    i.exact ? pathname === i.to : pathname.startsWith(i.to),
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2"
      >
        ข้ามไปยังเนื้อหา
      </a>
      <aside className="sticky top-0 hidden h-screen w-[var(--sidebar-width)] shrink-0 flex-col overflow-y-auto bg-sidebar lg:flex">
        <Brand />
        <Nav />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[var(--sidebar-width)] border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">เมนู</SheetTitle>
          <Brand />
          <Nav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-[var(--header-height)] items-center gap-3 border-b border-border bg-surface px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="เปิดเมนู"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <p className="truncate text-lg font-semibold">{current ? t(current.key) : t("appName")}</p>
          <div className="ml-auto flex items-center gap-3">
            <span
              className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex ${
                connected ? "bg-healthy-bg text-healthy" : "bg-warning-bg text-warning"
              }`}
            >
              <PlugZap className="size-3.5" aria-hidden />
              {connected ? "ตั้งค่า API แล้ว" : t("notConnected")}
            </span>
            <Button variant="ghost" size="icon" aria-label="การแจ้งเตือน (ยังไม่เชื่อมต่อ)" disabled>
              <Bell className="size-4" />
            </Button>
          </div>
        </header>
        <main id="main" className="flex-1 p-[var(--dashboard-page-padding)]">
          {children}
        </main>
      </div>
    </div>
  );
}
