// Debug helpers for voice recognition issues

const debugVoice = {
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

    // Check for known problematic browsers
    const isEdge =
      navigator.userAgent.includes("Edge") ||
      navigator.userAgent.includes("Edg/");
    const isChrome = navigator.userAgent.includes("Chrome");
    const isFirefox = navigator.userAgent.includes("Firefox");
    const isSafari = navigator.userAgent.includes("Safari") && !isChrome;

    console.log("Browser Detection:");
    console.log("- Edge:", isEdge);
    console.log("- Chrome:", isChrome);
    console.log("- Firefox:", isFirefox);
    console.log("- Safari:", isSafari);

    if (isEdge) {
      console.warn(
        "⚠️ Edge browser detected - known to have speech recognition network issues",
      );
    }

    return {
      supported:
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window,
      browser: { isEdge, isChrome, isFirefox, isSafari },
      online: navigator.onLine,
      protocol: location.protocol,
    };
  },

  // Test speech recognition basic functionality
  testSpeechRecognition() {
    const check = this.checkBrowser();

    if (!check.supported) {
      console.error("❌ Speech recognition not supported in this browser");
      return false;
    }

    if (!check.online) {
      console.error(
        "❌ No internet connection - required for speech recognition",
      );
      return false;
    }

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("✅ Speech recognition started successfully");
      };

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        console.log("✅ Speech recognized:", result);
        recognition.stop();
      };

      recognition.onerror = (event) => {
        console.error("❌ Speech recognition error:", event.error);
        console.log("Error details:", event);

        switch (event.error) {
          case "network":
            console.log(
              "💡 Network error - try refreshing page or using different browser",
            );
            break;
          case "not-allowed":
            console.log(
              "💡 Microphone permission denied - check browser permissions",
            );
            break;
          case "audio-capture":
            console.log(
              "💡 Microphone access issue - close other apps using microphone",
            );
            break;
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
      };

      console.log("🎤 Starting speech recognition test...");
      console.log("Speak now for 3 seconds...");
      recognition.start();

      // Auto-stop after 3 seconds
      setTimeout(() => {
        try {
          recognition.stop();
        } catch (e) {
          console.log("Recognition already stopped");
        }
      }, 3000);

      return true;
    } catch (error) {
      console.error("❌ Failed to create speech recognition:", error);
      return false;
    }
  },

  // Get recommendations based on current setup
  getRecommendations() {
    const check = this.checkBrowser();
    const recommendations = [];

    if (!check.supported) {
      recommendations.push(
        "❌ Use a supported browser: Chrome, Edge, or Safari",
      );
    }

    if (!check.online) {
      recommendations.push("❌ Check your internet connection");
    }

    if (check.protocol !== "https:" && !location.host.includes("localhost")) {
      recommendations.push(
        "❌ Speech recognition requires HTTPS in production",
      );
    }

    if (check.browser.isEdge) {
      recommendations.push(
        "⚠️ Edge has known speech recognition issues - try Chrome instead",
      );
    }

    if (check.browser.isFirefox) {
      recommendations.push(
        "⚠️ Firefox has limited speech recognition support - try Chrome instead",
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ Your setup looks good for speech recognition");
      recommendations.push("💡 If you still get errors, try:");
      recommendations.push("   - Refresh the page");
      recommendations.push("   - Close other tabs using microphone");
      recommendations.push("   - Check microphone permissions");
    }

    console.log("=== Recommendations ===");
    recommendations.forEach((rec) => console.log(rec));

    return recommendations;
  },
};

// Make available globally for debugging
if (typeof window !== "undefined") {
  window.debugVoice = debugVoice;
}

export default debugVoice;
