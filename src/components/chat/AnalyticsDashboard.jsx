import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  MessageSquare,
  Calendar,
  TrendingUp,
  X,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

function AnalyticsDashboard({ data, onClose }) {
  const { isDark } = useTheme();
  const { totalMessages, totalChats, avgMessagesPerChat, dailyUsage } = data;

  const maxMessages = Math.max(...dailyUsage.map((day) => day.messages), 1);

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
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-gray-100 text-high-contrast">
            Analytics Dashboard
          </h1>
        </div>
        <Button variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Messages */}
          <Card
            className={cn(
              "transition-colors duration-300",
              isDark ? "bg-gray-800" : "bg-white",
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-800 dark:text-gray-400 text-high-contrast">
                Total Messages
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-slate-700 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-gray-100 text-high-contrast">
                {totalMessages}
              </div>
              <p className="text-xs text-slate-800 dark:text-gray-400 text-high-contrast">
                Across all conversations
              </p>
            </CardContent>
          </Card>

          {/* Total Chats */}
          <Card
            className={cn(
              "transition-colors duration-300",
              isDark ? "bg-gray-800" : "bg-white",
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-800 dark:text-gray-400 text-high-contrast">
                Total Chats
              </CardTitle>
              <Calendar className="h-4 w-4 text-slate-700 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-gray-100 text-high-contrast">
                {totalChats}
              </div>
              <p className="text-xs text-slate-800 dark:text-gray-400 text-high-contrast">
                Conversation sessions
              </p>
            </CardContent>
          </Card>

          {/* Average Messages */}
          <Card
            className={cn(
              "transition-colors duration-300",
              isDark ? "bg-gray-800" : "bg-white",
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-800 dark:text-gray-400 text-high-contrast">
                Average per Chat
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-700 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-gray-100 text-high-contrast">
                {avgMessagesPerChat}
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-400">
                Messages per conversation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Usage Chart */}
        <Card
          className={cn(
            "transition-colors duration-300",
            isDark ? "bg-gray-800" : "bg-white",
          )}
        >
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-gray-100 text-high-contrast">
              Daily Activity (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyUsage.map((day, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-slate-800 dark:text-gray-400 text-high-contrast">
                    {(() => {
                      try {
                        if (day.date && typeof day.date === "string") {
                          const date = new Date(day.date);
                          return isNaN(date.getTime())
                            ? "Invalid"
                            : date.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              });
                        }
                        return "Invalid";
                      } catch {
                        return "Invalid";
                      }
                    })()}
                  </div>
                  <div className="flex-1">
                    <div
                      className={cn(
                        "h-6 rounded-md relative",
                        isDark ? "bg-gray-700" : "bg-gray-200",
                      )}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-md transition-all duration-300"
                        style={{
                          width: `${maxMessages > 0 ? (day.messages / maxMessages) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-sm font-medium text-slate-900 dark:text-gray-100 text-high-contrast text-right">
                    {day.messages}
                  </div>
                </div>
              ))}
            </div>
            {totalMessages === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-slate-800 dark:text-gray-400 text-high-contrast">
                  No data available yet. Start chatting to see your analytics!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
