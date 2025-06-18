import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block">
      {React.Children.map(children, (child) => {
        // Only pass props to components that can handle them
        if (React.isValidElement(child) && typeof child.type === "function") {
          return React.cloneElement(child, { isOpen, setIsOpen });
        }
        return child;
      })}
    </div>
  );
}

export function DropdownMenuTrigger({
  children,
  isOpen,
  setIsOpen,
  asChild = false,
  ...restProps
}) {
  const handleClick = () => setIsOpen?.(!isOpen);

  if (asChild) {
    return React.cloneElement(children, { onClick: handleClick });
  }

  return (
    <button onClick={handleClick} {...restProps}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  isOpen,
  setIsOpen,
  className,
  ...props
}) {
  if (!isOpen) return null;

  // Remove the React-specific props that shouldn't be passed to DOM
  const { ...domProps } = props;

  return (
    <div
      className={cn(
        "absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className,
      )}
      {...domProps}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ className, children, onClick, ...props }) {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
