import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.js";

export const ProtectedRoute = ({ children }) => {
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
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};
