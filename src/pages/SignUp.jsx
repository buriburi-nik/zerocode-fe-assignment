import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { Zap, AlertCircle, Info } from "lucide-react";

function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting registration...");
      await register(formData.name, formData.email, formData.password);
      console.log("Registration successful, navigating to chat...");
      // The AuthContext will automatically update the user state
      // The App routing will handle the redirect to /chat
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const generateTestEmail = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    const testEmail = `test${randomId}@example.com`;
    const testName = `Test User ${randomId.toUpperCase()}`;
    const testPassword = "password123";

    setFormData({
      name: testName,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
    });
    setError("");
  };

  const clearAllAccounts = () => {
    if (
      window.confirm(
        "Clear all registered accounts? This will remove all user data except the demo account.",
      )
    ) {
      try {
        const demoUsers = {
          "demo@zerocode.com": {
            id: "demo_user",
            name: "Demo User",
            email: "demo@zerocode.com",
            password: "demo123",
            createdAt: new Date().toISOString(),
          },
        };
        localStorage.setItem("zerocode_users", JSON.stringify(demoUsers));
        setError("");
        alert(
          "All user accounts cleared (demo account preserved). You can now register with any email.",
        );
      } catch (e) {
        alert("Failed to clear accounts: " + e.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Join ZeroCode Chat
            </CardTitle>
            <CardDescription className="mt-2 text-slate-700 dark:text-gray-300">
              Create your account to start chatting with AI
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
              <div className="space-y-2">
                <div>
                  <strong>🚀 Free Account</strong>
                </div>
                <div>
                  Create a free account to access all features including chat
                  history, analytics, and voice input.
                </div>
                <div>
                  <strong>💡 Demo:</strong> demo@zerocode.com | demo123
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateTestEmail}
                  className="w-full mt-2 text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-800"
                >
                  🎲 Generate Test Account Details
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password (min 6 characters)"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {error}
                  {error.includes("account with") &&
                    error.includes("already exists") && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/signin")}
                            className="text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-600 dark:hover:bg-red-900/50"
                          >
                            Go to Sign In
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={generateTestEmail}
                            className="text-blue-600 border-blue-300 hover:bg-blue-100 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-800"
                          >
                            🎲 Use Test Email
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearAllAccounts}
                            className="text-gray-600 border-gray-300 hover:bg-gray-100 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800"
                          >
                            🧹 Clear All Accounts
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          💡 Quick solutions: Use test email, sign in, or clear
                          accounts for testing.
                        </p>
                      </div>
                    )}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-700 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUp;
