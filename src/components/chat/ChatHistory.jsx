import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  History,
  Trash2,
  MessageSquare,
  Calendar,
  X,
  Zap,
  Plus,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

function ChatHistory({
  chatHistory,
  onSelectChat,
  onDeleteChat,
  onClose,
  onNewChat,
}) {
  const { isDark } = useTheme();
  const chats = Object.values(chatHistory).sort(
    (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated),
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={cn(
        "h-screen flex flex-col transition-colors duration-300",
        isDark ? "bg-gray-900" : "bg-gray-50",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b transition-colors duration-300",
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
            <History className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-gray-100 text-high-contrast">
            Chat History
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={onNewChat}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {chats.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-md">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl opacity-50">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 text-high-contrast">
                  No Chat History
                </h3>
                <p className="text-slate-800 dark:text-gray-400 text-high-contrast">
                  Start your first conversation to see it appear here.
                </p>
                <Button
                  onClick={onNewChat}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chats.map((chat) => (
                <Card
                  key={chat.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-lg",
                    isDark
                      ? "bg-gray-800 hover:bg-gray-750"
                      : "bg-white hover:bg-gray-50",
                  )}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 dark:text-gray-100 text-high-contrast line-clamp-2">
                          {chat.title || "Untitled Chat"}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-700 dark:text-gray-400 text-high-contrast">
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{chat.messages?.length || 0} messages</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(chat.lastUpdated)}</span>
                          </div>
                        </div>
                        {chat.messages?.length > 0 && (
                          <p className="mt-2 text-sm text-slate-700 dark:text-gray-300 text-high-contrast line-clamp-2">
                            {(() => {
                              const lastMessage =
                                chat.messages[chat.messages.length - 1];
                              const text = lastMessage?.text;
                              return typeof text === "string" ? text : "";
                            })()}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              "Are you sure you want to delete this chat?",
                            )
                          ) {
                            onDeleteChat(chat.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default ChatHistory;
