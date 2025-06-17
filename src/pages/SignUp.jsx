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

export const SignUp = ({ onNavigateToSignIn }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
      );
      if (result.success) {
        console.log("Registration successful, redirecting to main page...");
        // The App.jsx will automatically redirect based on user state change
        // Keep loading state briefly to show success
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Sign up failed - please try again.");
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
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
              Join ZeroCode Chat
            </CardTitle>
            <CardDescription className="mt-2 text-black-600 dark:text-white-300">
              Create your account to start chatting with AI
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <strong>🚀 Free Account</strong>
                  <br />
                  Create a free account to access all features including chat
                  history, analytics, and voice input.
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-white-700 dark:text-white-300"
              >
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="border-white-200 dark:border-white-700 focus:border-red-500 dark:focus:border-red-400"
                required
              />
            </div>

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
                minLength={6}
              />
              <p className="text-xs text-white-500 dark:text-white-400">
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-white-700 dark:text-white-300"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
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
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-black-600 dark:text-grey-400">
              Already have an account?{" "}
              <button
                onClick={onNavigateToSignIn}
                className="font-medium text-red-600 transition-colors dark:text-red-400 hover:text-red-500"
              >
                Sign in here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
