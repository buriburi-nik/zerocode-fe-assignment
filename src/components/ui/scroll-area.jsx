import React from "react";
import { cn } from "@/lib/utils";

export function ScrollArea({ className, children, ...props }) {
  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      <div className="h-full w-full overflow-auto">{children}</div>
    </div>
  );
}
