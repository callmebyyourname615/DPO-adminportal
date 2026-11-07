import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { services, type CrudService } from "@/lib/api/services";
import { t } from "@/lib/i18n";
import type { ListSearch } from "@/lib/list-search";
import { resources } from "@/lib/resources";
import { PageHeader } from "./PageHeader";
import { QueryState } from "./StateBlock";

const LIMIT = 10;

export function ResourceList({
  resourceKey,
  search,
  extra,
}: {
  resourceKey: string;
  search: ListSearch;
  extra?: ReactNode | undefined;
}) {
  const def = resources[resourceKey]!;
  const svc = services[def.key] as CrudService<any>;
  const navigate = useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  useEffect(() => setQ(search.q ?? ""), [search.q]);

  const setSearch = (patch: Partial<ListSearch>) =>
    navigate({ to: ".", search: (prev: ListSearch) => ({ ...prev, ...patch }) } as never);

  const page = search.page ?? 1;
  const query = useQuery({
    queryKey: [def.key, "list", search],
    queryFn: () =>
      svc.list({ page, limit: LIMIT, q: search.q, category: search.category, status: search.status }),
    retry: false,
  });
  const rows = (query.data?.data ?? []) as Record<string, any>[];
  const detail = `${def.basePath}/$id` as "/news/$id";

  return (
    <div>
      <PageHeader
        title={def.title}
        crumbs={[{ label: def.title }]}
        actions={
          def.canCreate !== false && (
            <Button asChild>
              <Link to={detail} params={{ id: "new" }}>
                <Plus className="size-4" /> {t("add")}
                {def.singular}
              </Link>
            </Button>
          )
        }
      />
      {extra}
      <section className="panel" aria-label={def.title}>
        <form
          role="search"
          className="flex flex-col gap-2 border-b border-border p-3 md:flex-row md:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch({ q: q.trim() || undefined, page: undefined });
          }}
        >
          <label className="relative flex-1">
            <span className="sr-only">{t("search")}</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={def.searchPlaceholder ?? t("search")}
              className="pl-8"
              lang="lo"
            />
          </label>
          {def.filters.map((f) => (
            <label key={f.param} className="flex items-center gap-2 text-sm">
              <span className="whitespace-nowrap text-muted-foreground">{f.label}</span>
              <select
                className="h-9 rounded-[var(--radius-control)] border border-input bg-surface px-2 text-sm"
                value={search[f.param] ?? ""}
                onChange={(e) => setSearch({ [f.param]: e.target.value || undefined, page: undefined })}
              >
                <option value="">{t("all")}</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <Button type="submit" variant="secondary">
            {t("search")}
          </Button>
        </form>

        {query.isLoading || query.error || rows.length === 0 ? (
          <QueryState
            isLoading={query.isLoading}
            error={query.error}
            isEmpty={rows.length === 0}
            onRetry={() => query.refetch()}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    {def.columns.map((c) => (
                      <th key={c.key} scope="col" className="px-3 py-2 text-left font-medium">
                        {c.label}
                      </th>
                    ))}
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r["id"]} className="border-t border-border hover:bg-muted/50">
                      {def.columns.map((c) => (
                        <td key={c.key} className={`px-3 py-2.5 align-middle ${c.className ?? ""}`}>
                          {c.render ? c.render(r) : (r[c.key] ?? "—")}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={detail} params={{ id: String(r["id"]) }}>
                            <Pencil className="size-3.5" />
                            {def.readOnlyDetail ? "ดูรายละเอียด" : t("edit")}
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {query.data && (
              <div className="flex items-center justify-between border-t border-border px-3 py-2 text-sm text-muted-foreground">
                <span className="num">
                  {t("page")} {query.data.page} {t("of")} {Math.max(1, query.data.totalPages)} ·{" "}
                  {query.data.total} รายการ
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setSearch({ page: page - 1 > 1 ? page - 1 : undefined })}
                  >
                    <ChevronLeft className="size-4" /> {t("prev")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= query.data.totalPages}
                    onClick={() => setSearch({ page: page + 1 })}
                  >
                    {t("next")} <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
