import React, { useState } from "react";
import { cn } from "@/lib/utils";

export function Dialog({ children, open, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(open || false);

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        // Only pass props to components that can handle them
        if (React.isValidElement(child) && typeof child.type === "function") {
          return React.cloneElement(child, {
            isOpen: open !== undefined ? open : isOpen,
            setIsOpen: handleOpenChange,
          });
        }
        return child;
      })}
    </div>
  );
}

export function DialogTrigger({
  children,
  isOpen,
  setIsOpen,
  asChild = false,
  ...restProps
}) {
  const handleClick = () => setIsOpen?.(true);

  if (asChild) {
    return React.cloneElement(children, { onClick: handleClick });
  }

  return (
    <button onClick={handleClick} {...restProps}>
      {children}
    </button>
  );
}

export function DialogContent({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setIsOpen?.(false)}
      />
      <div
        className={cn(
          "relative bg-background p-6 shadow-lg rounded-lg border max-w-lg w-full mx-4",
          className,
        )}
        {...domProps}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}
