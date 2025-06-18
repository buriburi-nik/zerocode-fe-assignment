import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Chat from "@/pages/Chat";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/signin"
        element={user ? <Navigate to="/chat" replace /> : <SignIn />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/chat" replace /> : <SignUp />}
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={<Navigate to={user ? "/chat" : "/signin"} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={user ? "/chat" : "/signin"} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Router>
              <AppRoutes />
              <Toaster />
              <div className="modal-overlay" />
              <Sonner
                position="top-right"
                expand={true}
                richColors={true}
                visibleToasts={3}
                closeButton={true}
                toastOptions={{
                  duration: 4000,
                  style: {
                    opacity: 1,
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    color: "#111827",
                    fontSize: "14px",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
                    zIndex: 10000,
                  },
                }}
                className="toast-container"
              />
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
