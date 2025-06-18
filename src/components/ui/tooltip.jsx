import React, { useState } from "react";
import { cn } from "@/lib/utils";

export function TooltipProvider({ children }) {
  return <>{children}</>;
}

export function Tooltip({ children }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      {React.Children.map(children, (child) => {
        // Only pass props to components that can handle them
        if (React.isValidElement(child) && typeof child.type === "function") {
          return React.cloneElement(child, { isVisible, setIsVisible });
        }
        return child;
      })}
    </div>
  );
}

export function TooltipTrigger({
  children,
  isVisible,
  setIsVisible,
  asChild = false,
  ...restProps
}) {
  const handleMouseEnter = () => setIsVisible?.(true);
  const handleMouseLeave = () => setIsVisible?.(false);

  if (asChild) {
    return React.cloneElement(children, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    });
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...restProps}
    >
      {children}
    </div>
  );
}

export function TooltipContent({
  children,
  isVisible,
  setIsVisible,
  className,
  ...props
}) {
  if (!isVisible) return null;

  // Remove the React-specific props that shouldn't be passed to DOM
  const { ...domProps } = props;

  return (
    <div
      className={cn(
        "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap z-50",
        className,
      )}
      {...domProps}
    >
      {children}
    </div>
  );
}
