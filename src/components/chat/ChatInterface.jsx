import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Menu,
  Sun,
  Moon,
  Download,
  FileText,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  BarChart3,
  History,
  User,
  Bot,
  LogOut,
  Plus,
  Zap,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { chatService } from "@/services/chatService";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ChatHistory from "./ChatHistory";
import AnalyticsDashboard from "./AnalyticsDashboard";
import VoiceControls from "./VoiceControls";
import ExportChat from "./ExportChat";

function ChatInterface() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentChatId, setCurrentChatId] = useState("");
  const [chatHistory, setChatHistory] = useState({});

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize chat
  useEffect(() => {
    initializeChat();
    loadChatHistory();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save current chat when messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      chatService.saveChatHistory(currentChatId, messages);
      loadChatHistory(); // Refresh the chat history list
    }
  }, [messages, currentChatId]);

  const initializeChat = () => {
    const newChatId = chatService.generateChatId();
    setCurrentChatId(newChatId);
    setMessages([]);
  };

  const loadChatHistory = () => {
    const history = chatService.loadChatHistory();
    setChatHistory(history);
  };

  const startNewChat = () => {
    initializeChat();
    setSidebarOpen(false);
  };

  const loadChat = (chatId) => {
    const chat = chatHistory[chatId];
    if (chat) {
      setCurrentChatId(chatId);
      // Ensure timestamps are properly converted from strings back to Date objects
      const normalizedMessages = (chat.messages || []).map((message) => ({
        ...message,
        timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
      }));
      setMessages(normalizedMessages);
      setSidebarOpen(false);
    }
  };

  const deleteChat = (chatId) => {
    chatService.deleteChatHistory(chatId);
    loadChatHistory();
    if (currentChatId === chatId) {
      initializeChat();
    }
  };

  const sendMessage = async (messageText = null) => {
    const rawText = messageText || inputValue.trim();
    // Ensure we always send a string
    const textToSend = typeof rawText === "string" ? rawText.trim() : "";
    if (!textToSend || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      text: textToSend,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const botResponse = await chatService.generateResponse(
        userMessage.text,
        messages,
        user?.name || "User",
      );

      // Ensure the response is always a string
      const responseText =
        typeof botResponse === "string"
          ? botResponse
          : typeof botResponse === "object"
            ? JSON.stringify(botResponse, null, 2)
            : String(botResponse);

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Speak the AI response if voice controls support it
      setTimeout(() => {
        if (window.voiceControlsSpeakResponse) {
          window.voiceControlsSpeakResponse(botResponse);
        }
      }, 100);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error generating a response. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = (transcript) => {
    // Ensure transcript is always a string
    const safeTranscript =
      typeof transcript === "string" ? transcript.trim() : "";
    if (safeTranscript) {
      sendMessage(safeTranscript);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Calculate analytics data
  const getAnalyticsData = useCallback(() => {
    const allChats = Object.values(chatHistory);
    const totalChats = allChats.length;
    const allMessages = allChats.flatMap((chat) => chat.messages || []);
    const totalMessages = allMessages.length;
    const avgMessagesPerChat = totalChats > 0 ? totalMessages / totalChats : 0;

    // Generate daily usage data
    const dailyUsage = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toLocaleDateString();

      const dayMessages = allMessages.filter((msg) => {
        if (!msg.timestamp) return false;
        const msgDate = new Date(msg.timestamp).toLocaleDateString();
        return msgDate === dateStr;
      });

      return {
        date: dateStr,
        messages: dayMessages.length,
      };
    });

    return {
      totalMessages,
      totalChats,
      avgMessagesPerChat: Math.round(avgMessagesPerChat * 10) / 10,
      dailyUsage,
    };
  }, [chatHistory]);

  if (showAnalytics) {
    return (
      <AnalyticsDashboard
        data={getAnalyticsData()}
        onClose={() => setShowAnalytics(false)}
      />
    );
  }

  if (showHistory) {
    return (
      <ChatHistory
        chatHistory={chatHistory}
        onSelectChat={loadChat}
        onDeleteChat={deleteChat}
        onClose={() => setShowHistory(false)}
        onNewChat={startNewChat}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-screen transition-colors duration-300",
        isDark ? "bg-gray-900" : "bg-gray-50",
      )}
    >
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isDark ? "bg-gray-800" : "bg-white",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div
            className={cn(
              "flex items-center justify-between p-4 border-b transition-colors duration-300",
              isDark ? "border-gray-700" : "border-gray-200",
            )}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                ZeroCode Chat
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              ×
            </Button>
          </div>

          <div className="flex-1 p-4 space-y-3">
            <Button
              onClick={startNewChat}
              className="justify-start w-full text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>

            <Button
              variant="ghost"
              onClick={() => setShowHistory(true)}
              className="justify-start w-full"
            >
              <History className="w-4 h-4 mr-2" />
              Chat History
            </Button>

            <Button
              variant="ghost"
              onClick={() => setShowAnalytics(true)}
              className="justify-start w-full"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>

            <Separator />

            <Button
              variant="ghost"
              onClick={toggleTheme}
              className="justify-start w-full"
            >
              {isDark ? (
                <Sun className="w-4 h-4 mr-2" />
              ) : (
                <Moon className="w-4 h-4 mr-2" />
              )}
              {isDark ? "Light Mode" : "Dark Mode"}
            </Button>

            <ExportChat
              messages={messages}
              user={user}
              onExport={(format) => {
                setSidebarOpen(false);
                toast({
                  title: "Export initiated",
                  description: `Exporting chat as ${format.toUpperCase()}...`,
                });
              }}
            />
          </div>

          <div
            className={cn(
              "p-4 border-t",
              isDark ? "border-gray-700" : "border-gray-200",
            )}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-gray-100 text-high-contrast">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-600 truncate dark:text-gray-400">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="justify-start w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between p-4 border-b transition-colors duration-300",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-100 text-high-contrast">
              Chat with AI Assistant
            </h2>
          </div>
          <VoiceControls onVoiceInput={handleVoiceInput} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 max-w-md">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-black dark:text-gray-400">
                    Welcome to ZeroCode Chat
                  </h3>
                  <p className="text-gray-700 dark:text-gray-400">
                    Start a conversation with our AI assistant. Ask questions,
                    get help, or just chat!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start space-x-3",
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start",
                    )}
                  >
                    {message.sender === "bot" && (
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <Card
                      className={cn(
                        "max-w-[80%] transition-colors duration-300",
                        message.sender === "user"
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                          : isDark
                            ? "bg-gray-700"
                            : "bg-white",
                      )}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {typeof message.text === "string" ? message.text : ""}
                        </p>
                        <p
                          className={cn(
                            "text-xs mt-1 opacity-70",
                            message.sender === "user"
                              ? "text-white"
                              : "text-gray-600 dark:text-gray-400",
                          )}
                        >
                          {(() => {
                            try {
                              if (
                                (message.timestamp &&
                                  typeof message.timestamp !== "object") ||
                                message.timestamp instanceof Date
                              ) {
                                const date = new Date(message.timestamp);
                                return isNaN(date.getTime())
                                  ? new Date().toLocaleTimeString()
                                  : date.toLocaleTimeString();
                              }
                              return new Date().toLocaleTimeString();
                            } catch {
                              return new Date().toLocaleTimeString();
                            }
                          })()}
                        </p>
                      </CardContent>
                    </Card>
                    {message.sender === "user" && (
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <Card
                      className={cn(
                        "transition-colors duration-300",
                        isDark ? "bg-gray-700" : "bg-white",
                      )}
                    >
                      <CardContent className="p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Input */}
        <div
          className={cn(
            "p-4 border-t transition-colors duration-300",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex space-x-2 chat-input-area">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className={cn(
                "min-h-[60px] max-h-32 resize-none",
                isDark
                  ? "text-gray-100 bg-gray-700 border-gray-600 placeholder:text-gray-400"
                  : "text-slate-900 bg-white border-gray-300 placeholder:text-slate-500",
              )}
              disabled={isTyping}
              style={{
                color: isDark ? "#f8fafc" : "#0f172a",
                backgroundColor: isDark ? "#374151" : "#ffffff",
                borderColor: isDark ? "#4b5563" : "#d1d5db",
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
