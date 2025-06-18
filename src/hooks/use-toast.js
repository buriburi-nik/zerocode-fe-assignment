import React from "react";
import { toast as sonnerToast } from "sonner";

export function useToast() {
  const toast = React.useCallback(
    ({ title, description, variant = "default", ...props }) => {
      const isDark = document.documentElement.classList.contains("dark");

      const baseStyle = {
        opacity: 1,
        backgroundColor: isDark ? "#1f2937" : "white",
        border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
        color: isDark ? "#f9fafb" : "#111827",
        fontSize: "14px",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: isDark
          ? "0 4px 12px rgba(0, 0, 0, 0.3)"
          : "0 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 9999,
        maxWidth: "400px",
        wordWrap: "break-word",
      };

      if (variant === "destructive") {
        sonnerToast.error(title, {
          description,
          style: {
            ...baseStyle,
            borderLeft: "4px solid #ef4444",
          },
          ...props,
        });
      } else {
        sonnerToast.success(title, {
          description,
          style: {
            ...baseStyle,
            borderLeft: "4px solid #10b981",
          },
          ...props,
        });
      }
    },
    [],
  );

  return { toast };
}
