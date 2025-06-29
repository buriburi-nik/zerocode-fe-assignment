import React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-800 dark:text-gray-200 form-label",
        className,
      )}
      {...props}
    />
  );
}
