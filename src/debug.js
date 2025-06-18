// Debug helper functions
// You can call these from the browser console

window.debugAuth = {
  // Check current auth state
  checkAuth: () => {
    const session = localStorage.getItem("zerocode_session");
    const user = localStorage.getItem("zerocode_current_user");
    console.log("Session:", session);
    console.log("User:", user ? JSON.parse(user) : null);
    return { session, user: user ? JSON.parse(user) : null };
  },

  // Clear all auth data
  clearAuth: () => {
    localStorage.removeItem("zerocode_session");
    localStorage.removeItem("zerocode_current_user");
    console.log("Auth data cleared. Refresh the page.");
    window.location.reload();
  },

  // Go to signup
  goToSignup: () => {
    window.location.href = "/signup";
  },

  // Go to chat
  goToChat: () => {
    window.location.href = "/chat";
  },

  // Quick demo login
  demoLogin: () => {
    // Set demo user data
    const demoSession = `session_${Date.now()}_demo`;
    const demoUser = {
      id: "demo_user",
      name: "Demo User",
      email: "demo@zerocode.com",
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem("zerocode_session", demoSession);
    localStorage.setItem("zerocode_current_user", JSON.stringify(demoUser));
    console.log("Demo login complete. Refreshing...");
    window.location.href = "/chat";
  },
};

// Voice debugging helpers
window.debugVoice = {
  // Check browser compatibility
  checkBrowser() {
    console.log("=== Voice Recognition Browser Check ===");
    console.log("User Agent:", navigator.userAgent);
    console.log("Online:", navigator.onLine);
    console.log(
      "Speech Recognition Support:",
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window,
    );
    console.log("Speech Synthesis Support:", "speechSynthesis" in window);
    console.log("Protocol:", location.protocol);
    console.log("Host:", location.host);

    const isEdge =
      navigator.userAgent.includes("Edge") ||
      navigator.userAgent.includes("Edg/");
    const isChrome = navigator.userAgent.includes("Chrome");

    console.log("Browser Detection:");
    console.log("- Edge:", isEdge);
    console.log("- Chrome:", isChrome);

    if (isEdge) {
      console.warn(
        "⚠️ Edge browser detected - known to have speech recognition network issues",
      );
    }

    return {
      supported:
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window,
      browser: { isEdge, isChrome },
      online: navigator.onLine,
      protocol: location.protocol,
    };
  },

  // Test speech recognition
  testSpeechRecognition() {
    const check = this.checkBrowser();

    if (!check.supported) {
      console.error("❌ Speech recognition not supported in this browser");
      return false;
    }

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => console.log("✅ Speech recognition started");
      recognition.onresult = (event) => {
        console.log("✅ Speech recognized:", event.results[0][0].transcript);
        recognition.stop();
      };
      recognition.onerror = (event) => {
        console.error("❌ Speech recognition error:", event.error);
        if (event.error === "network") {
          console.log("💡 Network error - try refreshing page or using Chrome");
        }
      };

      console.log(
        "🎤 Starting speech recognition test... Speak now for 3 seconds...",
      );
      recognition.start();

      setTimeout(() => {
        try {
          recognition.stop();
        } catch (e) {}
      }, 3000);

      return true;
    } catch (error) {
      console.error("❌ Failed to create speech recognition:", error);
      return false;
    }
  },

  // Get recommendations
  getRecommendations() {
    const check = this.checkBrowser();
    console.log("=== Recommendations ===");

    if (check.browser.isEdge) {
      console.log(
        "⚠️ Edge has known speech recognition issues - try Chrome instead",
      );
    } else if (!check.supported) {
      console.log("❌ Use Chrome for best speech recognition support");
    } else {
      console.log("✅ Your browser should support speech recognition");
      console.log("💡 If you get network errors, try:");
      console.log("   - Refresh the page");
      console.log("   - Close other tabs using microphone");
      console.log("   - Check microphone permissions");
    }
  },
};

console.log("🔧 Debug helpers loaded. Use:");
console.log("- debugAuth.checkAuth() - Check current auth state");
console.log("- debugAuth.clearAuth() - Clear auth and refresh");
console.log("- debugAuth.goToSignup() - Go to signup page");
console.log("- debugAuth.goToChat() - Go to chat page");
console.log("- debugAuth.demoLogin() - Quick demo login");
console.log("- debugVoice.checkBrowser() - Check voice recognition support");
console.log("- debugVoice.testSpeechRecognition() - Test voice recognition");
console.log(
  "- debugVoice.getRecommendations() - Get voice setup recommendations",
);
