class AuthService {
  constructor() {
    this.initialized = false;
  }

  async initializeDemo() {
    if (this.initialized) return;

    try {
      const demoUser = {
        id: "demo_user",
        name: "Demo User",
        email: "demo@zerocode.com",
        password: "demo123",
        createdAt: new Date().toISOString(),
      };

      const existingUsers = this.getStoredUsers();
      existingUsers["demo@zerocode.com"] = demoUser;
      localStorage.setItem("zerocode_users", JSON.stringify(existingUsers));

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize demo user:", error);
    }
  }

  getStoredUsers() {
    try {
      return JSON.parse(localStorage.getItem("zerocode_users") || "{}");
    } catch {
      return {};
    }
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const users = this.getStoredUsers();
    const user = users[normalizedEmail];

    if (!user) {
      throw new Error(
        "No account found with this email. Please sign up first.",
      );
    }

    if (user.password !== password) {
      throw new Error("Invalid password. Please try again.");
    }

    const sessionToken = this.generateSessionToken();
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem("zerocode_session", sessionToken);
    localStorage.setItem("zerocode_current_user", JSON.stringify(userData));

    return {
      user: userData,
      token: sessionToken,
    };
  }

  async register(name, email, password) {
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      throw new Error("All fields are required");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const users = this.getStoredUsers();

    if (users[normalizedEmail]) {
      throw new Error(
        "An account with this email already exists. Please sign in instead.",
      );
    }

    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      createdAt: new Date().toISOString(),
    };

    users[normalizedEmail] = newUser;
    localStorage.setItem("zerocode_users", JSON.stringify(users));

    const sessionToken = this.generateSessionToken();
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem("zerocode_session", sessionToken);
    localStorage.setItem("zerocode_current_user", JSON.stringify(userData));

    return {
      user: userData,
      token: sessionToken,
    };
  }

  async verifyToken(token) {
    const currentSession = localStorage.getItem("zerocode_session");
    if (!currentSession || currentSession !== token) {
      throw new Error("Invalid session");
    }

    const userData = localStorage.getItem("zerocode_current_user");
    if (!userData) {
      throw new Error("No user data found");
    }

    return JSON.parse(userData);
  }

  async logout() {
    localStorage.removeItem("zerocode_session");
    localStorage.removeItem("zerocode_current_user");
  }

  generateSessionToken() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentUser() {
    try {
      const userData = localStorage.getItem("zerocode_current_user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
