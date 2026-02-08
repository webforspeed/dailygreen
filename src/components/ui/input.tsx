import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-500",
        className,
      )}
      {...props}
    />
  );
}
