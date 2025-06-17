import React, { useState, useEffect, useRef, useCallback } from "react";
import jsPDF from "jspdf";
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
  ChevronDown,
  Zap,
} from "lucide-react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition.js";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis.js";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard.jsx";
import { ChatHistory } from "@/components/chat/ChatHistory.jsx";
import { VoiceControls, VoiceStatus } from "@/components/ui/voice-controls.jsx";
import { ChatService } from "@/services/chatService.js";
import { cn } from "@/lib/utils.js";
import { useToast } from "@/hooks/use-toast";

export const ChatInterface = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentChatId, setCurrentChatId] = useState("");
  const [chatHistory, setChatHistory] = useState({});

  // Self-contained theme state management
  const [isDark, setIsDark] = useState(() => {
    // First check localStorage
    const savedTheme = localStorage.getItem("zerocode_chat_theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }

    // Fall back to system preference
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    // Default to light mode
    return false;
  });

  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  // Theme management effect
  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem("zerocode_chat_theme", isDark ? "dark" : "light");

    // Apply theme to document root for this component's context
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      const savedTheme = localStorage.getItem("zerocode_chat_theme");
      if (!savedTheme) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    setIsDark((prevIsDark) => !prevIsDark);
  }, []);
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isVoiceSupported,
    error: voiceError,
    retryCount,
    isOnline,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition();

  const {
    isSpeaking,
    isPaused,
    isSupported: isSpeechSupported,
    speak,
    pause: pauseSpeaking,
    resume: resumeSpeaking,
    stop: stopSpeaking,
  } = useSpeechSynthesis();

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("zerocode_chat_history");
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save chat history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("zerocode_chat_history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const generateBotResponse = useCallback(
    async (userMessage) => {
      return await ChatService.generateResponse(
        userMessage,
        messages,
        user.name,
      );
    },
    [messages, user.name],
  );

  // Auto-speak bot responses (optional feature)
  const [autoSpeak, setAutoSpeak] = useState(false);

  // Handle auto-speaking of bot messages
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === "bot" && !isSpeaking) {
        // Small delay to ensure message is rendered
        setTimeout(() => {
          speak(lastMessage.text, {
            onEnd: () => console.log("Finished speaking bot response"),
          });
        }, 500);
      }
    }
  }, [messages, autoSpeak, speak, isSpeaking]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const botResponse = await generateBotResponse(inputValue);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error generating bot response:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error generating a response. Please check your Gemini API configuration.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exportChat = (format) => {
    if (messages.length === 0) {
      toast({
        title: "No messages to export",
        description: "Start a conversation first to export the chat.",
        variant: "destructive",
      });
      return;
    }

    const timestamp = new Date().toISOString().split("T")[0];
    let content;
    let filename;

    if (format === "pdf") {
      exportChatAsPDF();
      return;
    }

    if (format === "markdown") {
      content =
        `# ZeroCode Chat Export - ${timestamp}\n\n` +
        `**User:** ${user.name} (${user.email})\n` +
        `**Export Date:** ${new Date().toLocaleString()}\n\n---\n\n` +
        messages
          .map(
            (msg) =>
              `**${msg.sender === "user" ? "You" : "AI Assistant"}** *(${msg.timestamp.toLocaleString()})*\n\n${msg.text}\n`,
          )
          .join("\n---\n\n");
      filename = `zerocode-chat-${timestamp}.md`;
    } else {
      content = JSON.stringify(
        {
          appName: "ZeroCode Chat",
          exportDate: new Date().toISOString(),
          user: {
            name: user.name,
            email: user.email,
          },
          chatInfo: {
            totalMessages: messages.length,
            startTime: messages[0]?.timestamp,
            endTime: messages[messages.length - 1]?.timestamp,
          },
          messages: messages,
        },
        null,
        2,
      );
      filename = `zerocode-chat-${timestamp}.json`;
    }

    const blob = new Blob([content], {
      type: format === "markdown" ? "text/markdown" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    // Show success notification
    toast({
      title: `Chat exported successfully!`,
      description: `Downloaded as ${filename}`,
    });
  };

  const exportChatAsPDF = () => {
    try {
      // Show generating notification
      toast({
        title: "Generating PDF...",
        description: "Please wait while we create your chat export.",
      });

      const doc = new jsPDF();
      const timestamp = new Date().toISOString().split("T")[0];

      // PDF Configuration
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let currentY = margin;

      // Helper function to add text with word wrapping
      const addWrappedText = (
        text,
        x,
        y,
        maxWidth,
        fontSize = 10,
        fontStyle = "normal",
      ) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", fontStyle);

        const lines = doc.splitTextToSize(text, maxWidth);
        for (let i = 0; i < lines.length; i++) {
          if (y + fontSize * 0.35 > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(lines[i], x, y);
          y += fontSize * 0.35; // Line height
        }
        return y;
      };

      // Add header
      doc.setFillColor(79, 70, 229); // Indigo color
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("ZeroCode Chat Export", margin, 25);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 35);

      currentY = 55;

      // Add user info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Chat Information", margin, currentY);
      currentY += 15;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      currentY = addWrappedText(
        `User: ${user.name} (${user.email})`,
        margin,
        currentY,
        maxWidth,
      );
      currentY = addWrappedText(
        `Total Messages: ${messages.length}`,
        margin,
        currentY,
        maxWidth,
      );

      if (messages.length > 0) {
        const startTime = new Date(messages[0].timestamp).toLocaleString();
        const endTime = new Date(
          messages[messages.length - 1].timestamp,
        ).toLocaleString();
        currentY = addWrappedText(
          `Chat Duration: ${startTime} - ${endTime}`,
          margin,
          currentY,
          maxWidth,
        );
      }

      currentY += 15;

      // Add separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 15;

      // Add conversation title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Conversation", margin, currentY);
      currentY += 20;

      // Add messages
      messages.forEach((message, index) => {
        // Check if we need a new page
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = margin;
        }

        // Message header
        const sender = message.sender === "user" ? "You" : "AI Assistant";
        const timeString = new Date(message.timestamp).toLocaleString();

        // Add sender badge
        if (message.sender === "user") {
          doc.setFillColor(79, 70, 229); // Indigo for user
        } else {
          doc.setFillColor(107, 114, 128); // Gray for AI
        }

        doc.roundedRect(margin, currentY - 8, 60, 12, 2, 2, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(sender, margin + 5, currentY - 2);

        // Add timestamp
        doc.setTextColor(128, 128, 128);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(timeString, margin + 65, currentY - 2);

        currentY += 10;

        // Add message content
        doc.setTextColor(0, 0, 0);
        currentY = addWrappedText(
          message.text,
          margin,
          currentY,
          maxWidth,
          10,
          "normal",
        );

        currentY += 15; // Space between messages

        // Add light separator line between messages
        if (index < messages.length - 1) {
          doc.setDrawColor(240, 240, 240);
          doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);
        }
      });

      // Add footer to all pages
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${totalPages} • ZeroCode Chat Export`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" },
        );
      }

      // Save the PDF
      const filename = `zerocode-chat-${timestamp}.pdf`;
      doc.save(filename);

      // Show success notification
      toast({
        title: "PDF exported successfully!",
        description: `Downloaded as ${filename}`,
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error creating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveCurrentChat = () => {
    if (messages.length === 0) return;

    const chatId = currentChatId || Date.now().toString();
    setChatHistory((prev) => ({
      ...prev,
      [chatId]: {
        messages: messages,
        title: messages[0]?.text.substring(0, 50) || "Untitled Chat",
        createdAt: new Date().toISOString(),
        messageCount: messages.length,
      },
    }));

    if (!currentChatId) {
      setCurrentChatId(chatId);
    }
  };

  const loadChat = (chatId) => {
    const chat = chatHistory[chatId];
    if (chat) {
      setMessages(chat.messages || []);
      setCurrentChatId(chatId);
      setShowHistory(false);
    }
  };

  const deleteChat = (chatId) => {
    setChatHistory((prev) => {
      const newHistory = { ...prev };
      delete newHistory[chatId];
      return newHistory;
    });

    if (currentChatId === chatId) {
      setMessages([]);
      setCurrentChatId("");
    }
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      saveCurrentChat();
    }
    setMessages([]);
    setCurrentChatId("");
    setSidebarOpen(false);
  };

  const getAnalytics = () => {
    const chatEntries = Object.values(chatHistory);
    const totalChats = chatEntries.length + (messages.length > 0 ? 1 : 0);
    const allMessages = [
      ...chatEntries.flatMap((chat) => chat.messages || []),
      ...messages,
    ];

    const totalMessages = allMessages.length;
    const avgMessagesPerChat = totalChats > 0 ? totalMessages / totalChats : 0;

    // Generate realistic daily usage based on stored data
    const dailyUsage = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toLocaleDateString();

      // Count messages from that day
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
      avgMessagesPerChat,
      dailyUsage,
    };
  };

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
              <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text">
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

            {isSpeechSupported && (
              <Button
                variant="ghost"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className="justify-start w-full"
              >
                {autoSpeak ? (
                  <Volume2 className="w-4 h-4 mr-2" />
                ) : (
                  <VolumeX className="w-4 h-4 mr-2" />
                )}
                {autoSpeak ? "Auto-speak On" : "Auto-speak Off"}
              </Button>
            )}
          </div>

          <div
            className={cn(
              "p-4 border-t transition-colors duration-300",
              isDark ? "border-gray-700" : "border-gray-200",
            )}
          >
            <div className="flex items-center mb-3 space-x-3">
              <Avatar>
                <AvatarFallback className="text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-400">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate dark:text-red-400">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onLogout}
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

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div
          className={cn(
            "p-4 border-b transition-colors duration-300",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="text-white bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                    AI Assistant
                  </h2>
                  <div className="flex items-center space-x-4">
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          ChatService.isAIAvailable()
                            ? "bg-green-500 animate-pulse"
                            : "bg-red-500",
                        )}
                      ></div>
                      {ChatService.getServiceStatus()}
                    </p>
                    <p className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                      <Zap className="w-3 h-3 mr-1" />
                      Frontend Only
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportChat("pdf")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChat("markdown")}>
                  Export as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChat("json")}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <Card className="py-12 text-center">
                <CardContent>
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900">
                    <Bot className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Hello {user.name}! 👋
                  </h3>
                  <p className="mb-4 text-gray-500 dark:text-gray-400">
                    Start a conversation with your AI assistant! You can type,
                    use voice input, or ask for help.
                  </p>
                  <div className="inline-flex items-center px-3 py-1 text-xs text-green-700 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                    <Zap className="w-3 h-3 mr-1" />
                    Pure Frontend • No Backend Required
                  </div>
                </CardContent>
              </Card>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-3",
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : "",
                )}
              >
                <Avatar>
                  <AvatarFallback
                    className={cn(
                      message.sender === "user"
                        ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                        : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white",
                    )}
                  >
                    {message.sender === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <Card
                  className={cn(
                    "max-w-[70%]",
                    message.sender === "user"
                      ? "bg-gradient-to-r from-red-500 to-orange-500 text-white border-0"
                      : "bg-white dark:bg-gray-800",
                  )}
                >
                  <CardContent className="p-3">
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p
                        className={cn(
                          "text-xs",
                          message.sender === "user"
                            ? "text-red-100"
                            : "text-gray-500 dark:text-gray-400",
                        )}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                      {/* Click-to-speak button for bot messages */}
                      {message.sender === "bot" && isSpeechSupported && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speak(message.text)}
                          className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Click to speak this message"
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarFallback className="text-white bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 delay-100 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 delay-200 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div
          className={cn(
            "p-4 border-t transition-colors duration-300",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
              </div>

              <VoiceControls
                isListening={isListening}
                isSpeaking={isSpeaking}
                isPaused={isPaused}
                interimTranscript={interimTranscript}
                error={voiceError}
                isVoiceSupported={isVoiceSupported}
                isSpeechSupported={isSpeechSupported}
                isOnline={isOnline}
                onStartListening={startListening}
                onStopListening={stopListening}
                onPauseSpeaking={pauseSpeaking}
                onResumeSpeaking={resumeSpeaking}
                onStopSpeaking={stopSpeaking}
                size="sm"
                className="h-11"
              />

              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 h-11"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <VoiceStatus
              isListening={isListening}
              isSpeaking={isSpeaking}
              isPaused={isPaused}
              interimTranscript={interimTranscript}
              error={voiceError}
              retryCount={retryCount}
              isOnline={isOnline}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAnalytics && (
        <AnalyticsDashboard
          analytics={getAnalytics()}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {showHistory && (
        <ChatHistory
          chatHistory={chatHistory}
          onLoadChat={loadChat}
          onDeleteChat={deleteChat}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};
