import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, ShieldCheck, Trash2, UserPlus, UsersRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { QueryState } from "@/components/admin/StateBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { ResetPasswordDialog } from "@/components/admin/ResetPasswordDialog";
import { clearSession } from "@/lib/api/client";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { usersService } from "@/lib/api/services";
import type { AdminUser as User } from "@/lib/api/types";
import { notify } from "@/lib/notifications";
import { t } from "@/lib/i18n";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/users")({ component: UsersPage });
export function UsersPage() {
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ["users"], queryFn: usersService.list, retry: false });
  const currentUser = useQuery({ queryKey: ["auth", "me"], queryFn: usersService.me, retry: false });
  const [selected,setSelected] = useState<User | null>(null);
  const [passwordReset,setPasswordReset] = useState<User | null>(null);
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "viewer" });
  const [error, setError] = useState("");
  const create = useMutation({ mutationFn: () => usersService.create(form), onSuccess: () => { setForm({ email: "", name: "", password: "", role: "viewer" }); setError(""); notify.success("ເພີ່ມຜູ້ໃຊ້ສຳເລັດ"); void qc.invalidateQueries({queryKey:["users"]}); }, onError: e => setError(e.message) });
  const update = useMutation({ mutationFn: ({ id, ...body }: { id: string; active?: boolean; role?: string }) => usersService.update(id,body), onSuccess: async () => { setError(""); await qc.invalidateQueries({queryKey:["users"]}); }, onError: e => setError(e.message) });
  const remove = useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: async () => { setSelected(null); setError(""); await qc.invalidateQueries({queryKey:["users"]}); notify.success("ລຶບບັນຊີສຳເລັດ"); },
    onError: e => notify.error(`ລຶບບັນຊີບໍ່ສຳເລັດ: ${e.message}`),
  });
  return <div>
    <PageHeader title="ຜູ້ໃຊ້ ແລະ ສິດທິ" />
    {error && <p role="alert" className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
    {!users.error && !users.isLoading && <form className="panel mb-4 p-5 sm:p-6" onSubmit={(e: FormEvent) => { e.preventDefault(); create.mutate(); }}>
      <div className="mb-5 flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><UserPlus className="size-5" aria-hidden /></span><div><h2 className="font-semibold">ເພີ່ມຜູ້ໃຊ້</h2><p className="mt-1 text-xs text-muted-foreground">ສ້າງບັນຊີ ແລະ ກຳນົດສິດທິການເຂົ້າໃຊ້</p></div></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1.5 text-sm font-medium"><span>ຊື່</span><Input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>
        <label className="space-y-1.5 text-sm font-medium"><span>ອີເມວ</span><Input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
        <div className="space-y-1.5 text-sm font-medium"><label htmlFor="create-user-password">ລະຫັດຜ່ານ</label><PasswordInput id="create-user-password" required minLength={6} maxLength={128} autoComplete="new-password" aria-describedby="create-password-help" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /><p id="create-password-help" className="text-xs font-normal text-muted-foreground">ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ</p></div>
        <label className="space-y-1.5 text-sm font-medium"><span>ສິດທິ</span><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="viewer">ຜູ້ເບິ່ງ</option><option value="editor">ຜູ້ແກ້ໄຂ</option><option value="admin">ຜູ້ດູແລ</option></select></label>
      </div><div className="mt-5 flex justify-end border-t border-border pt-4"><Button type="submit" disabled={create.isPending}><UserPlus className="size-4" aria-hidden /> {create.isPending ? "ກຳລັງເພີ່ມ..." : "ເພີ່ມຜູ້ໃຊ້"}</Button></div>
    </form>}
    <section className="panel"><div className="flex items-center gap-3 border-b border-border px-5 py-4"><span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"><UsersRound className="size-5" aria-hidden /></span><div><h2 className="font-semibold">ລາຍຊື່ຜູ້ໃຊ້</h2><p className="mt-1 text-xs text-muted-foreground">ຈັດການສິດທິ ແລະ ສະຖານະບັນຊີ</p></div></div>
      <QueryState isLoading={users.isLoading} error={users.error} isEmpty={users.data?.length === 0} onRetry={() => users.refetch()} />
      {users.data?.length ? <ul className="divide-y divide-border">{users.data.map(u=><li key={u.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center"><span className="hidden size-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground sm:grid"><ShieldCheck className="size-5" aria-hidden /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{u.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{u.email}</p></div><div className="flex flex-wrap items-center gap-3"><select className="h-9 rounded-md border border-input bg-background px-2 text-sm" aria-label={`ສິດທິ ${u.name}`} value={u.role} disabled={update.isPending || remove.isPending} onChange={e=>update.mutate({id:u.id,role:e.target.value})}><option value="viewer">ຜູ້ເບິ່ງ</option><option value="editor">ຜູ້ແກ້ໄຂ</option><option value="admin">ຜູ້ດູແລ</option></select><div className="flex min-h-11 items-center gap-2.5"><ToggleSwitch checked={u.active} disabled={update.isPending || remove.isPending} aria-label={`ສະຖານະຂອງ ${u.name}`} aria-busy={update.isPending && update.variables?.id === u.id} onCheckedChange={active=>update.mutate({id:u.id,active})}/><span className="min-w-16 text-xs text-muted-foreground">{u.active ? "ໃຊ້ງານຢູ່" : "ປິດໃຊ້ງານ"}</span></div><Button type="button" variant="ghost" size="icon" className="size-10 text-muted-foreground hover:bg-primary-soft hover:text-primary" aria-label={`Reset Password ${u.name}`} title="Reset Password" disabled={update.isPending || remove.isPending} onClick={()=>setPasswordReset(u)}><KeyRound className="size-4" aria-hidden/></Button><Button type="button" variant="ghost" size="icon" className="size-10 text-muted-foreground hover:bg-expired-bg hover:text-destructive" aria-label={`ລຶບບັນຊີ ${u.name}`} disabled={update.isPending || remove.isPending || !currentUser.data || currentUser.data.id===u.id} title={currentUser.data?.id===u.id ? "ບໍ່ສາມາດລຶບບັນຊີຂອງຕົນເອງ" : undefined} onClick={()=>setSelected(u)}><Trash2 className="size-4" aria-hidden/></Button></div></li>)}</ul> : null}
    </section>
    {passwordReset&&<ResetPasswordDialog key={passwordReset.id} user={passwordReset} onClose={()=>setPasswordReset(null)} onSuccess={user=>{if(user.id===currentUser.data?.id){clearSession();window.dispatchEvent(new Event("dpo-session-expired"));}}}/>}
    <AlertDialog open={selected!==null} onOpenChange={open=>{if(!open&&!remove.isPending)setSelected(null);}}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ຢືນຢັນການລຶບບັນຊີ?</AlertDialogTitle>
          <AlertDialogDescription className="break-words">{selected?.name}<br/>{selected?.email}<br/>ການລຶບບໍ່ສາມາດຍ້ອນກັບໄດ້</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={remove.isPending} onClick={event=>{event.preventDefault();if(selected&&!remove.isPending)remove.mutate(selected.id);}}>{remove.isPending?t("loading"):t("delete")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>;
}
