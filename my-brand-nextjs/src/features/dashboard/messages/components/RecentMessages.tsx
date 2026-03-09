"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ContactMessage } from "@/types/message";
import { messageService } from "@/features/dashboard/messages/messageService";

// Import design system components
import Typography from "@/components/atoms/Typography/Typography";
import Button from "@/components/atoms/Button/Button";
import Badge from "@/components/atoms/Badge/Badge";
import Card from "@/components/molecules/Card/Card";
import { Loading } from "@/components/atoms/Loading/Loading";
import CustomLink from "@/components/atoms/Link/Link";
import { TextLengthReducer } from "utils/textLengthReducer";

export function RecentMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadRecentMessages = async () => {
      try {
        const recentMessages = await messageService.getRecentMessages();
        const unread = await messageService.getUnreadMessagesCount();
        setMessages(recentMessages);
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to load recent messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentMessages();
  }, []);

  if (loading) {
    return (
      <Card
        variant="elevated"
        className="p-6 bg-gradient-to-br from-secondary via-secondary to-secondary/80 border-accent/20"
      >
        <Typography variant="h3" className="text-white mb-6 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-yellow-400 rounded-full flex items-center justify-center mr-3 shadow-lg shadow-accent/25">
            <i className="fas fa-envelope text-black"></i>
          </div>
          Recent Messages
        </Typography>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg animate-pulse"
            >
              <Loading size="sm" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="elevated"
      className="p-6 bg-gradient-to-br from-secondary via-secondary to-secondary/80 border-accent/20 shadow-xl shadow-black/20"
    >
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h5" className="text-white flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-yellow-400 rounded-full flex items-center justify-center mr-3 shadow-lg shadow-accent/25">
            <i className="fas fa-envelope text-black"></i>
          </div>
          Recent Messages
        </Typography>

        {unreadCount > 0 && (
          <Badge
            variant="new"
            className="bg-gradient-to-r from-red-500 to-red-400 text-white font-bold shadow-lg shadow-red-500/25 animate-pulse"
          >
            {unreadCount} new
          </Badge>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">
            <i className="fas fa-inbox"></i>
          </div>
          <Typography variant="p" className="text-gray-400">
            No messages yet
          </Typography>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <Card
              key={message.id}
              variant="bordered"
              className={`p-4 transition-all duration-300 hover:scale-[1.02] group cursor-pointer ${
                message.isRead
                  ? "border-gray-600 bg-gradient-to-br from-secondary/50 to-secondary/20 hover:border-gray-500"
                  : "border-accent/40 bg-gradient-to-br from-accent/8 via-accent/3 to-transparent hover:border-accent/60 shadow-lg shadow-accent/10"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    {!message.isRead && (
                      <div className="w-3 h-3 bg-gradient-to-r from-accent to-yellow-400 rounded-full flex-shrink-0 animate-pulse shadow-lg shadow-accent/50"></div>
                    )}
                    <Typography
                      variant="h6"
                      className={`truncate transition-colors duration-300 ${
                        message.isRead
                          ? "text-gray-300 group-hover:text-white"
                          : "text-white group-hover:text-accent"
                      }`}
                    >
                      {message.name}
                    </Typography>
                  </div>

                <div className="flex flex-col">
                  <Typography
                    variant="small"
                    className={`truncate mb-1 font-medium ${
                      message.subject
                        ? "text-accent/80 group-hover:text-accent"
                        : "text-gray-500 italic"
                    }`}
                  >
                    {message.subject || "No subject"}
                  </Typography>

                  <Typography
                    variant="small"
                    className="text-gray-400 truncate leading-relaxed group-hover:text-gray-300 transition-colors duration-300"
                  >
                    {TextLengthReducer({ text: message.message, maxLength: 300 })}
                  </Typography>
                  </div>
                </div>

                <div className="flex flex-col items-end ml-4 space-y-1">
                  <Typography
                    variant="small"
                    className="text-gray-500 whitespace-nowrap text-xs"
                  >
                    {new Date(message.receivedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0 min-w-0 hover:bg-accent/20 hover:text-accent rounded-full"
                      title="View message"
                    >
                      <i className="fas fa-eye text-xs"></i>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gradient-to-r from-accent/20 via-gray-600/50 to-accent/20">
        <CustomLink
          href="/dashboard/messages"
          className="text-accent hover:text-yellow-400 font-medium flex items-center justify-center transition-all duration-300 hover:bg-accent/10 py-2 px-4 rounded-lg group"
        >
          <i className="fas fa-envelope mr-2 text-sm group-hover:animate-bounce"></i>
          View all messages
          <i className="fas fa-arrow-right ml-2 text-sm group-hover:translate-x-1 transition-transform duration-300"></i>
        </CustomLink>
      </div>
    </Card>
  );
}
