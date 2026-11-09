import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AdminUser } from "@/lib/api/types";
import { usersService } from "@/lib/api/services";
import { notify } from "@/lib/notifications";
import { t } from "@/lib/i18n";

export function ResetPasswordDialog({ user, onClose, onSuccess }: { user: AdminUser; onClose: ()=>void; onSuccess: (user:AdminUser)=>void }) {
  const [password,setPassword]=useState("");
  const [confirmation,setConfirmation]=useState("");
  const [error,setError]=useState("");
  const reset=useMutation({
    mutationFn: ()=>usersService.resetPassword(user.id,password),
    onSuccess: ()=>{setPassword("");setConfirmation("");onClose();notify.success("Reset Password ສຳເລັດ");onSuccess(user);},
    onError: cause=>{setError(cause.message);notify.error(`Reset Password ບໍ່ສຳເລັດ: ${cause.message}`);},
  });
  return <Dialog open onOpenChange={open=>{if(!open&&!reset.isPending)onClose();}}>
    <DialogContent onEscapeKeyDown={event=>{if(reset.isPending)event.preventDefault();}} onPointerDownOutside={event=>{if(reset.isPending)event.preventDefault();}}>
      <DialogHeader><DialogTitle>Reset Password</DialogTitle><DialogDescription className="break-words">{user.name}<br/>{user.email}</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={event=>{
        event.preventDefault();if(reset.isPending)return;
        if(password.length<6||password.length>128){setError("ລະຫັດຜ່ານຕ້ອງມີ 6–128 ຕົວອັກສອນ");return;}
        if(password!==confirmation){setError("ລະຫັດຜ່ານບໍ່ກົງກັນ");return;}
        setError("");reset.mutate();
      }}>
        <fieldset disabled={reset.isPending} className="space-y-4">
          <div className="space-y-1.5"><label htmlFor="reset-new-password" className="text-sm font-medium">ລະຫັດຜ່ານໃໝ່</label><PasswordInput id="reset-new-password" required minLength={6} maxLength={128} autoComplete="new-password" disabled={reset.isPending} aria-invalid={!!error} aria-describedby={error?"reset-password-error":"reset-password-help"} value={password} onChange={event=>{setPassword(event.target.value);setError("");}}/><p id="reset-password-help" className="text-xs text-muted-foreground">ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ</p></div>
          <div className="space-y-1.5"><label htmlFor="reset-confirm-password" className="text-sm font-medium">ຢືນຢັນລະຫັດຜ່ານ</label><PasswordInput id="reset-confirm-password" required minLength={6} maxLength={128} autoComplete="new-password" disabled={reset.isPending} aria-invalid={!!error} aria-describedby={error?"reset-password-error":undefined} value={confirmation} onChange={event=>{setConfirmation(event.target.value);setError("");}}/></div>
        </fieldset>
        {error&&<p id="reset-password-error" role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter><Button type="button" variant="outline" disabled={reset.isPending} onClick={onClose}>{t("cancel")}</Button><Button type="submit" disabled={reset.isPending} aria-busy={reset.isPending}><KeyRound className="size-4" aria-hidden/>{reset.isPending?t("loading"):"Reset Password"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
