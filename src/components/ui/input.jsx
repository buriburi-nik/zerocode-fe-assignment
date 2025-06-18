import React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white dark:text-gray-100 bg-gray-800 dark:bg-gray-700 border-gray-600 dark:border-gray-600 placeholder:text-gray-300 dark:placeholder:text-gray-400 form-input",
        className,
      )}
      {...props}
    />
  );
}
