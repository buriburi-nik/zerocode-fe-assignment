class ChatService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || "demo-key";
    this.apiEndpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  }

  async generateResponse(userMessage, chatHistory = [], userName = "User") {
    try {
      // If no API key is available, use demo responses
      if (this.apiKey === "demo-key") {
        return this.generateDemoResponse(userMessage, userName);
      }

      const context = this.buildContext(chatHistory, userName);
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${context}\n\nUser: ${userMessage}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response. Please try again."
      );
    } catch (error) {
      console.error("Chat API error:", error);
      return this.generateDemoResponse(userMessage, userName);
    }
  }

  buildContext(chatHistory, userName) {
    const recentMessages = chatHistory.slice(-10); // Last 10 messages for context
    const context = recentMessages
      .map(
        (msg) =>
          `${msg.sender === "user" ? userName : "Assistant"}: ${msg.text}`,
      )
      .join("\n");

    return `You are a helpful AI assistant named ZeroCode Chat. You are having a conversation with ${userName}. Here's the recent conversation context:\n\n${context}`;
  }

  generateDemoResponse(userMessage, userName) {
    const responses = [
      `Hello ${userName}! I'm ZeroCode Chat, your AI assistant. How can I help you today?`,
      `That's an interesting question! Let me think about that...`,
      `I understand what you're asking about. Here's my perspective on that topic.`,
      `Thanks for sharing that with me, ${userName}. I'd be happy to help you explore this further.`,
      `That's a great point! I can see why you're thinking about it that way.`,
      `Let me provide you with some helpful information about that.`,
      `I appreciate you asking! This is definitely something worth discussing.`,
      `Based on what you've told me, I think there are several ways to approach this.`,
      `That's a thoughtful question, ${userName}. Here's what I think about it.`,
      `I can help you with that! Let me break it down for you.`,
    ];

    // Simple response selection based on message content
    if (
      userMessage.toLowerCase().includes("hello") ||
      userMessage.toLowerCase().includes("hi")
    ) {
      return `Hello ${userName}! Great to meet you! I'm ZeroCode Chat, your AI assistant. What would you like to talk about today?`;
    }

    if (userMessage.toLowerCase().includes("help")) {
      return `I'm here to help, ${userName}! I can assist you with questions, provide information, help with problem-solving, or just have a friendly conversation. What do you need help with?`;
    }

    if (userMessage.toLowerCase().includes("thank")) {
      return `You're very welcome, ${userName}! I'm glad I could help. Is there anything else you'd like to discuss?`;
    }

    // Return a random response for other messages
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  // Chat history management
  saveChatHistory(chatId, messages) {
    try {
      const allChats = JSON.parse(
        localStorage.getItem("zerocode_chat_history") || "{}",
      );
      allChats[chatId] = {
        id: chatId,
        messages,
        lastUpdated: new Date().toISOString(),
        title: this.generateChatTitle(messages),
      };
      localStorage.setItem("zerocode_chat_history", JSON.stringify(allChats));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }

  loadChatHistory() {
    try {
      return JSON.parse(localStorage.getItem("zerocode_chat_history") || "{}");
    } catch {
      return {};
    }
  }

  deleteChatHistory(chatId) {
    try {
      const allChats = this.loadChatHistory();
      delete allChats[chatId];
      localStorage.setItem("zerocode_chat_history", JSON.stringify(allChats));
    } catch (error) {
      console.error("Failed to delete chat history:", error);
    }
  }

  generateChatTitle(messages) {
    const firstUserMessage =
      messages.find((msg) => msg.sender === "user")?.text || "";
    if (firstUserMessage.length > 50) {
      return firstUserMessage.substring(0, 47) + "...";
    }
    return firstUserMessage || "New Chat";
  }

  generateChatId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const chatService = new ChatService();
