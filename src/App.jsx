import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth.js";
import { SignIn } from "@/pages/SignIn.jsx";
import { SignUp } from "@/pages/SignUp.jsx";
import { Chat } from "@/pages/Chat.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg dark:bg-gray-900">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-indigo-600 to-purple-600 animate-pulse"></div>
            </div>
          </div>
          <div className="w-8 h-8 mx-auto mb-4 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          <p className="font-medium text-gray-600 dark:text-gray-400">
            Loading ZeroCode Chat...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/signin" 
          element={user ? <Navigate to="/chat" replace /> : <SignIn />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/chat" replace /> : <SignUp />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirect */}
        <Route 
          path="/" 
          element={<Navigate to={user ? "/chat" : "/signin"} replace />} 
        />
        
        {/* Catch all other routes */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/chat" : "/signin"} replace />} 
        />
      </Routes>
    </Router>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;