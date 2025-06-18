import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export function usePageTransition() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show preloader when route changes
    setIsLoading(true);

    // Hide preloader after animation duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds preloader duration

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Also provide manual control
  const startTransition = () => setIsLoading(true);
  const endTransition = () => setIsLoading(false);

  return {
    isLoading,
    startTransition,
    endTransition,
  };
}
