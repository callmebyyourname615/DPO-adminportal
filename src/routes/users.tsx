import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { QueryState } from "@/components/admin/StateBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api/client";

type User = { id: string; email: string; name: string; role: "admin" | "editor" | "viewer"; active: boolean };
export const Route = createFileRoute("/users")({ component: UsersPage });
function UsersPage() {
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ["users"], queryFn: () => apiRequest<User[]>("/api/admin/users"), retry: false });
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "viewer" });
  const [error, setError] = useState("");
  const create = useMutation({ mutationFn: () => apiRequest<User>("/api/admin/users", { method: "POST", body: form }), onSuccess: () => { setForm({ email: "", name: "", password: "", role: "viewer" }); setError(""); void qc.invalidateQueries({queryKey:["users"]}); }, onError: e => setError(e.message) });
  const update = useMutation({ mutationFn: ({ id, ...body }: { id: string; active?: boolean; role?: string }) => apiRequest<User>(`/api/admin/users/${encodeURIComponent(id)}`, { method: "PATCH", body }), onSuccess: () => { setError(""); void qc.invalidateQueries({queryKey:["users"]}); }, onError: e => setError(e.message) });
  return <div>
    <PageHeader title="ຜູ້ໃຊ້ ແລະ ສິດທິ" />
    {error && <p role="alert" className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
    {!users.error && !users.isLoading && <form className="panel mb-4 p-5 sm:p-6" onSubmit={(e: FormEvent) => { e.preventDefault(); create.mutate(); }}>
      <div className="mb-5 flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><UserPlus className="size-5" aria-hidden /></span><div><h2 className="font-semibold">ເພີ່ມຜູ້ໃຊ້</h2><p className="mt-1 text-xs text-muted-foreground">ສ້າງບັນຊີ ແລະ ກຳນົດສິດທິການເຂົ້າໃຊ້</p></div></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1.5 text-sm font-medium"><span>ຊື່</span><Input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>
        <label className="space-y-1.5 text-sm font-medium"><span>ອີເມວ</span><Input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
        <label className="space-y-1.5 text-sm font-medium"><span>ລະຫັດຜ່ານ</span><Input type="password" required minLength={12} autoComplete="new-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /><span className="block text-xs font-normal text-muted-foreground">ຢ່າງໜ້ອຍ 12 ຕົວອັກສອນ</span></label>
        <label className="space-y-1.5 text-sm font-medium"><span>ສິດທິ</span><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="viewer">ຜູ້ເບິ່ງ</option><option value="editor">ຜູ້ແກ້ໄຂ</option><option value="admin">ຜູ້ດູແລ</option></select></label>
      </div><div className="mt-5 flex justify-end border-t border-border pt-4"><Button type="submit" disabled={create.isPending}><UserPlus className="size-4" aria-hidden /> {create.isPending ? "ກຳລັງເພີ່ມ..." : "ເພີ່ມຜູ້ໃຊ້"}</Button></div>
    </form>}
    <section className="panel"><div className="flex items-center gap-3 border-b border-border px-5 py-4"><span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"><UsersRound className="size-5" aria-hidden /></span><div><h2 className="font-semibold">ລາຍຊື່ຜູ້ໃຊ້</h2><p className="mt-1 text-xs text-muted-foreground">ຈັດການສິດທິ ແລະ ສະຖານະບັນຊີ</p></div></div>
      <QueryState isLoading={users.isLoading} error={users.error} isEmpty={users.data?.length === 0} onRetry={() => users.refetch()} />
      {users.data?.length ? <ul className="divide-y divide-border">{users.data.map(u=><li key={u.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center"><span className="hidden size-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground sm:grid"><ShieldCheck className="size-5" aria-hidden /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{u.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{u.email}</p></div><div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.active ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{u.active ? "ໃຊ້ງານຢູ່" : "ປິດໃຊ້ງານ"}</span><select className="h-9 rounded-md border border-input bg-background px-2 text-sm" aria-label={`ສິດທິ ${u.name}`} value={u.role} disabled={update.isPending} onChange={e=>update.mutate({id:u.id,role:e.target.value})}><option value="viewer">ຜູ້ເບິ່ງ</option><option value="editor">ຜູ້ແກ້ໄຂ</option><option value="admin">ຜູ້ດູແລ</option></select><Button variant="outline" size="sm" disabled={update.isPending} onClick={()=>update.mutate({id:u.id,active:!u.active})}>{u.active ? "ປິດການໃຊ້ງານ" : "ເປີດການໃຊ້ງານ"}</Button></div></li>)}</ul> : null}
    </section>
  </div>;
}
