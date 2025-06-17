import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth.js";

export const SignIn = ({ onNavigateToSignUp }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        console.log("Login successful, redirecting to main page...");
        // The App.jsx will automatically redirect based on user state change
        // Keep loading state briefly to show success
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Sign in failed - please try again.");
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  const handleDemoLogin = () => {
    setFormData({
      email: "demo@zerocode.com",
      password: "demo123",
    });
    setError("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-white-900 dark:via-white-800 dark:to-red-900">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-black/80 dark: bg-slate-500">
        <CardHeader className="pb-8 space-y-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl">
            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg dark:bg-white-900">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500 to-orange-500"></div>
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text">
              Welcome Back
            </CardTitle>
            <CardDescription className="mt-2 text-white-600 dark:text-white-300">
              Sign in to continue to ZeroCode Chat
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <AlertDescription className="text-sm text-green-700 dark:text-green-300">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <strong>✨ ZeroCode Chat</strong>
                  <br />
                   Try the demo account:
                  <br />
                  <button
                    onClick={handleDemoLogin}
                    className="px-2 py-1 mt-2 font-mono text-xs bg-green-100 rounded hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700"
                  >
                    📧 demo@zerocode.com | 🔐 demo123
                  </button>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-white-700 dark:text-white-300"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="border-white-200 dark:border-white-700 focus:border-red-500 dark:focus:border-red-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-white-700 dark:text-white-300"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="border-white-200 dark:border-white-700 focus:border-red-500 dark:focus:border-red-400"
                required
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertDescription className="text-red-700 whitespace-pre-line dark:text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-white-600 dark:text-white-400">
              Don't have an account?{" "}
              <button
                onClick={onNavigateToSignUp}
                className="font-medium text-red-600 transition-colors dark:text-red-400 hover:text-red-500"
              >
                Sign up here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
