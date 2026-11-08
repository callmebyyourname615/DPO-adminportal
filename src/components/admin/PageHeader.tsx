import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { t } from "@/lib/i18n";

export interface Crumb {
  label: string;
  to?: string | undefined;
}

export function PageHeader({
  title,
  crumbs = [],
  actions,
  description,
}: {
  title: string;
  crumbs?: Crumb[] | undefined;
  actions?: ReactNode | undefined;
  description?: string | undefined;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <nav aria-label="ເສັ້ນທາງນຳທາງ" className="mb-1">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary">
                {t("dashboard")}
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={i} className="flex items-center gap-1">
                <ChevronRight className="size-3" aria-hidden />
                {c.to ? (
                  <Link to={c.to as "/"} className="hover:text-primary">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-foreground">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="text-[length:var(--text-heading)] font-semibold leading-tight text-foreground">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

