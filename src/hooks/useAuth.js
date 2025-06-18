import { useState, useEffect } from "react";
import { AuthService } from "@/services/authService.js";

export const useAuth = () => {
  // Check for existing user immediately to avoid loading states
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("zerocode_session");
      const userData = AuthService.getCurrentUser();
      return token && userData ? { ...userData, token } : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Just ensure demo user is set up
    AuthService.setupDemoUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await AuthService.login({ email, password });

      // The AuthService already stores the token with correct keys
      // Just update our local state
      const userWithToken = { ...response.user, token: response.token };

      // Force state update
      setUser(userWithToken);

      console.log("Login successful, user state updated:", userWithToken);

      return { success: true, user: userWithToken };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    // Basic validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      throw new Error("All fields are required");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address");
    }

    try {
      const response = await AuthService.register({ name, email, password });

      // The AuthService already stores the token with correct keys
      // Just update our local state
      const userWithToken = { ...response.user, token: response.token };

      // Force state update
      setUser(userWithToken);

      console.log(
        "Registration successful, user state updated:",
        userWithToken,
      );

      return { success: true, user: userWithToken };
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // AuthService.logout() already clears the correct localStorage keys
      setUser(null);
    }
  };

  return { user, isLoading, login, register, logout };
};
