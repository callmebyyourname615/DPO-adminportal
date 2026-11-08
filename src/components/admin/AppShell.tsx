import { Link, useRouterState } from "@tanstack/react-router";
import {
  FileText,
  FolderOpen,
  HelpCircle,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  PanelsTopLeft,
  Settings,
  Shield,
  Building2,
  UserRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { NotificationBell } from "./NotificationBell";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { t, type I18nKey } from "@/lib/i18n";



type Item = { to: string; key: I18nKey; icon: typeof Home; exact?: boolean | undefined };
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
  { label: "groupAdmin", items: [{ to: "/users", key: "users", icon: Shield }] },
];

function Nav({ onNavigate }: { onNavigate?: () => void | undefined }) {
  return (
    <nav aria-label="ເມນູຫຼັກ" className="flex flex-col gap-4 px-3 py-4">
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
      <img src="/dpo-logo.png" alt="ຕາສັນຍາລັກ DPO" className="size-10 shrink-0 object-contain" />
      <div className="leading-tight">
        <p className="font-semibold text-sidebar-foreground">{t("appName")}</p>
        <p className="text-[11px] text-sidebar-muted">{t("appSubtitle")}</p>
      </div>
    </div>
  );
}

function LogoutButton({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  return <div className="mt-auto border-t border-sidebar-border p-3"><p className="mb-2 truncate px-1 text-xs text-sidebar-muted" title={userName}>{userName}</p><Button type="button" variant="destructive" className="h-10 w-full justify-start" onClick={onLogout}><LogOut aria-hidden />ອອກຈາກລະບົບ</Button></div>;
}

export function AppShell({ children, userName, userRole, onLogout }: { children: ReactNode; userName: string; userRole: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = groups.flatMap((g) => g.items).find((i) =>
    i.exact ? pathname === i.to : pathname.startsWith(i.to),
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2"
      >
        ຂ້າມໄປຫາເນື້ອຫາ
      </a>
      <aside className="sticky top-0 hidden h-screen w-[var(--sidebar-width)] shrink-0 flex-col overflow-y-auto bg-sidebar lg:flex">
        <Brand />
        <Nav />
        <LogoutButton userName={userName} onLogout={onLogout} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex w-[var(--sidebar-width)] flex-col overflow-y-auto border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">ເມນູ</SheetTitle>
          <Brand />
          <Nav onNavigate={() => setOpen(false)} />
          <LogoutButton userName={userName} onLogout={onLogout} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-[var(--header-height)] items-center gap-3 border-b border-border bg-surface px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="ເປີດເມນູ"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <p className="truncate text-lg font-semibold">{current ? t(current.key) : t("appName")}</p>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <div className="flex min-w-0 items-center gap-2 border-l border-border pl-3" aria-label={`ຜູ້ໃຊ້: ${userName}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary" aria-hidden="true"><UserRound className="size-5" /></span>
              <div className="hidden min-w-0 leading-tight md:block">
                <p className="max-w-40 truncate text-sm font-semibold text-foreground" title={userName}>{userName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{{ admin: "ຜູ້ດູແລລະບົບ", editor: "ຜູ້ແກ້ໄຂ", viewer: "ຜູ້ເບິ່ງ" }[userRole] ?? userRole}</p>
              </div>
            </div>
          </div>
        </header>
        <main id="main" className="flex-1 p-[var(--dashboard-page-padding)]">
          {children}
        </main>
      </div>
    </div>
  );
}
