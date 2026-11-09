import type { ComponentProps } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function ToggleSwitch({ className, ...props }: ComponentProps<typeof Switch>) {
  return <Switch {...props} className={cn(
    "relative h-7 w-12 data-[state=checked]:bg-switch-on data-[state=unchecked]:bg-switch-off " +
    "before:absolute before:inset-y-[-8px] before:inset-x-0 [&>span]:h-5 [&>span]:w-5 " +
    "[&>span]:bg-primary-foreground [&>span[data-state=checked]]:translate-x-5 motion-reduce:transition-none " +
    "[&>span]:motion-reduce:transition-none",
    className,
  )}/>;
}
