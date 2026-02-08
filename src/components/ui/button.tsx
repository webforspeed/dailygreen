import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Button({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "ui-button rounded-md px-3 py-2 text-sm font-medium transition-colors",
        className,
      )}
      {...props}
    />
  );
}
