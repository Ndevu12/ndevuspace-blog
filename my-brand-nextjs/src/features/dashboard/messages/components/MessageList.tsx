"use client";

import { useState, useEffect } from "react";
import { ContactMessage, MessageFilters } from "@/types/message";
import { messageService } from "../messageService";
import { MessageCard } from "./MessageCard";

// Import design system components
import Typography from "@/components/atoms/Typography/Typography";
import Button from "@/components/atoms/Button/Button";
import Card from "@/components/molecules/Card/Card";
import { Loading } from "@/components/atoms/Loading/Loading";

interface MessageListProps {
  filters?: MessageFilters;
  sortBy?: "newest" | "oldest";
  onUnreadCountChange?: (count: number) => void;
  onTotalCountChange?: (count: number) => void;
  onFiltersChange?: (filters: MessageFilters) => void;
}

export function MessageList({
  filters: propFilters = {},
  sortBy: propSortBy = "newest",
  onUnreadCountChange,
  onTotalCountChange,
  onFiltersChange,
}: MessageListProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Use props instead of local state
  const filters = propFilters;
  const sortBy = propSortBy;

  const loadMessages = async () => {
    try {
      setLoading(true);
      const fetchedMessages = await messageService.fetchMessages(filters);

      // Apply sorting
      const sortedMessages = [...fetchedMessages].sort((a, b) => {
        const dateA = new Date(a.receivedAt).getTime();
        const dateB = new Date(b.receivedAt).getTime();
        return sortBy === "newest" ? dateB - dateA : dateA - dateB;
      });

      setMessages(sortedMessages);

      // Update counts
      const unreadCount = sortedMessages.filter((msg) => !msg.isRead).length;
      onUnreadCountChange?.(unreadCount);
      onTotalCountChange?.(sortedMessages.length);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [filters, sortBy]);

  const filteredMessages = messages;
  const unreadCount = messages.filter((msg) => !msg.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" />
        <Typography variant="p" className="ml-3 text-gray-400">
          Loading messages...
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <Card
            variant="bordered"
            className="text-center py-16 bg-gradient-to-br from-secondary/50 to-secondary/20 border-gray-600/50"
          >
            <div className="text-accent text-8xl mb-6 animate-bounce">
              <i className="fas fa-envelope-open"></i>
            </div>
            <Typography variant="h3" className="text-white mb-3 font-roboto">
              {Object.keys(filters).length > 0 || filters.isRead !== undefined
                ? "No messages match your filters"
                : "No messages yet"}
            </Typography>
            <Typography
              variant="p"
              className="text-gray-400 max-w-md mx-auto leading-relaxed"
            >
              {Object.keys(filters).length > 0 || filters.isRead !== undefined
                ? "Try adjusting your search terms or filter settings to find the messages you're looking for."
                : "Messages from your contact form will appear here. When visitors reach out through your website, you'll be able to view and respond to them from this dashboard."}
            </Typography>

            {(Object.keys(filters).length > 0 ||
              filters.isRead !== undefined) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onFiltersChange?.({});
                }}
                className="mt-4 border-accent/50 text-accent hover:bg-accent hover:text-black transition-all duration-300"
              >
                <i className="fas fa-refresh mr-2"></i>
                Clear filters
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {filteredMessages.map((message) => (
              <div key={message.id} className="animate-slide-in">
                <MessageCard message={message} onUpdate={loadMessages} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
