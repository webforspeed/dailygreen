import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-neutral-50 p-4 shadow-[0_1px_1px_rgb(0_0_0_/_1%),0_3px_8px_rgb(0_0_0_/_2%)]",
        className,
      )}
      {...props}
    />
  );
}
