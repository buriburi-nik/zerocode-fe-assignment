import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Zero Logo Component
const ZeroLogo = ({ className }) => (
  <div className={cn("relative", className)}>
    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
      <div className="w-10 h-10 border-4 border-white rounded-full flex items-center justify-center">
        <div className="w-4 h-4 bg-white rounded-full opacity-20"></div>
      </div>
    </div>
  </div>
);

function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/chat";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setFormData({ email: "demo@zerocode.com", password: "demo123" });
    setIsLoading(true);
    setError("");

    try {
      await login("demo@zerocode.com", "demo123");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Demo login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 p-4 relative">
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center loading-overlay">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl flex items-center space-x-3 loading-card">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-800 dark:text-gray-200 font-medium">
              Signing in...
            </span>
          </div>
        </div>
      )}
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center mx-auto">
            <ZeroLogo />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="mt-2 text-slate-700 dark:text-gray-300">
              Sign in to continue to ZeroCode Chat
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-sm text-green-700 dark:text-green-300">
              <div className="space-y-2">
                <div>
                  <strong>✨ ZeroCode Chat Demo</strong>
                </div>
                <div>Try the demo account or create your own:</div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full text-green-700 border-green-300 hover:bg-green-100 dark:text-green-300 dark:border-green-600 dark:hover:bg-green-900/50"
                >
                  {isLoading
                    ? "Signing in..."
                    : "🚀 Demo Login (demo@zerocode.com)"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className={cn(
                  "input-loading",
                  isLoading ? "opacity-50 cursor-not-allowed" : "",
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isLoading}
                required
                className={cn(
                  "input-loading",
                  isLoading ? "opacity-50 cursor-not-allowed" : "",
                )}
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {error}
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
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-700 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignIn;