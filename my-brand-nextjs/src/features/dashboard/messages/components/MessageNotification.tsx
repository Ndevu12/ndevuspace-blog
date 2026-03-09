"use client";

import { useState, useEffect } from "react";
import { messageService } from "../messageService";

// Import design system components
import Button from "@/components/atoms/Button/Button";
import Badge from "@/components/atoms/Badge/Badge";
import LoadingSpinner from "@/components/atoms/Loading/Loading";

interface MessageNotificationProps {
  onClick?: () => void;
}

export function MessageNotification({ onClick }: MessageNotificationProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadMessagesCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 group min-w-0 w-auto h-auto"
      title="Messages"
      aria-label={`Messages ${
        unreadCount > 0 ? `(${unreadCount} unread)` : ""
      }`}
    >
      <i className="fas fa-envelope text-lg"></i>

      {/* Unread count badge */}
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1">
          <Badge
            variant="status"
            color="red"
            size="sm"
            className="animate-pulse"
          >
            {unreadCount > 99 ? "99+" : unreadCount.toString()}
          </Badge>
        </div>
      )}

      {/* Pulse animation for new messages */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 animate-ping opacity-75"></span>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute -top-1 -right-1">
          <LoadingSpinner size="xs" color="white" />
        </div>
      )}
    </Button>
  );
}
