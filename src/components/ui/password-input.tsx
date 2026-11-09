import { useEffect, useId, useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordInput({ className, id, ...props }: ComponentProps<typeof Input>) {
  const generatedId=useId();
  const inputId=id||generatedId;
  const [visible,setVisible]=useState(false);
  useEffect(()=>{if(props.value==="")setVisible(false);},[props.value]);
  return <div className="relative">
    <Input {...props} id={inputId} type={visible?"text":"password"} className={cn("pr-11",className)}/>
    <button type="button" disabled={props.disabled} aria-label={visible?"Hide password":"Show password"} aria-pressed={visible} aria-controls={inputId} onClick={()=>setVisible(current=>!current)} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-md text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50">
      {visible?<EyeOff className="size-4" aria-hidden/>:<Eye className="size-4" aria-hidden/>}
    </button>
  </div>;
}
