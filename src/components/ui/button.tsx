import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Button({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700",
        className,
      )}
      {...props}
    />
  );
}
